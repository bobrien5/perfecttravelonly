/**
 * Inserts a Stay22 map block at the end of the top destination guides.
 * Idempotent: skips any post that already contains a stay22Map block.
 *
 * Dry-run by default. Pass --write to apply.
 *   node scripts/place-stay22-maps.mjs
 *   node scripts/place-stay22-maps.mjs --write
 */
import { createClient } from "@sanity/client";
import { readFileSync } from "fs";

const WRITE = process.argv.includes("--write");
const ENVTXT = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const env = Object.fromEntries(
  ENVTXT.split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    })
);
const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2026-03-09",
  useCdn: false,
  token: env.SANITY_API_WRITE_TOKEN,
});

// slug -> address to centre the map on
const PLACEMENTS = {
  "best-all-inclusive-resorts-punta-cana": "Punta Cana, Dominican Republic",
  "best-all-inclusive-resorts-aruba": "Palm Beach, Aruba",
  "best-all-inclusive-resorts-jamaica": "Montego Bay, Jamaica",
  "best-beaches-in-the-caribbean": "Grace Bay, Turks and Caicos",
  "sandals-jamaica-reopening-2026": "Montego Bay, Jamaica",
};

let keyc = 0;
const nk = () => `s22${Date.now().toString(36)}${keyc++}`;

async function main() {
  let placed = 0;
  let skipped = 0;

  for (const [slug, address] of Object.entries(PLACEMENTS)) {
    const post = await client.fetch(
      `*[_type=="blogPost" && slug.current==$slug && !(_id in path("drafts.**"))][0]{_id,"slug":slug.current,body}`,
      { slug }
    );
    if (!post) {
      console.log(`MISSING  ${slug} (no such post)`);
      continue;
    }
    const body = post.body || [];
    if (body.some((b) => b._type === "stay22Map")) {
      skipped++;
      console.log(`skip     ${slug} (already has a map)`);
      continue;
    }
    const existingKeys = new Set(body.map((b) => b._key).filter(Boolean));
    let key = nk();
    while (existingKeys.has(key)) key = nk();
    const block = { _type: "stay22Map", _key: key, address };
    placed++;
    console.log(`${WRITE ? "PLACE   " : "would place"} ${slug} -> ${address}`);
    if (WRITE) {
      await client
        .patch(post._id)
        .setIfMissing({ body: [] })
        .append("body", [block])
        .commit();
    }
  }

  console.log(`\n${WRITE ? "Placed" : "Dry run:"} ${placed} map(s), skipped ${skipped}.`);
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
