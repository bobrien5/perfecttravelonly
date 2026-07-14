/**
 * add-hotel-ctas.mjs
 *
 * Appends a "Check current rates for <Hotel> on Expedia" CTA block to the end of each
 * hotel H2 section listed in scripts/data/hotel-cta-candidates.json.
 *
 * The block is a PortableText link with a raw expedia.com href. The blog renderer already
 * styles such links as a green rel="sponsored" button, and Stay22 LMA monetizes the href
 * at runtime. So no code change is needed to make these buttons work.
 *
 * This mutates LIVE production content. Dry run by default.
 *
 * Usage:
 *   node scripts/add-hotel-ctas.mjs           # dry run
 *   node scripts/add-hotel-ctas.mjs --write   # apply
 */
import { createClient } from "@sanity/client";
import { readFileSync } from "fs";

const WRITE = process.argv.includes("--write");

const ENVTXT = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const env = Object.fromEntries(
  ENVTXT.split("\n").filter((l) => l && !l.startsWith("#") && l.includes("=")).map((l) => {
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

const rows = JSON.parse(readFileSync(new URL("./data/hotel-cta-candidates.json", import.meta.url), "utf8"))
  .filter((r) => r.expediaUrl && !r.skip);

let n = 0;
const key = (p) => `hcta${Date.now().toString(36)}${(n++).toString(36)}${p}`;

function ctaBlock(hotelName, href) {
  const linkKey = key("L");
  return {
    _type: "block",
    _key: key("B"),
    style: "normal",
    markDefs: [{ _type: "link", _key: linkKey, blank: true, href }],
    children: [
      {
        _type: "span",
        _key: key("S"),
        marks: ["strong", linkKey],
        text: `Check current rates for ${hotelName} on Expedia`,
      },
    ],
  };
}

async function main() {
  // group rows by post so each post is patched exactly once, atomically
  const byPost = new Map();
  for (const r of rows) {
    if (!byPost.has(r.slug)) byPost.set(r.slug, []);
    byPost.get(r.slug).push(r);
  }

  let inserted = 0;
  for (const [slug, list] of byPost) {
    const doc = await client.fetch(`*[_type=="blogPost" && slug.current==$slug][0]{_id, body}`, { slug });
    if (!doc) { console.log(`MISSING post ${slug}, skipping`); continue; }
    const body = doc.body || [];

    // Insert from the BOTTOM up so earlier h2Index values stay valid.
    const sorted = [...list].sort((a, b) => b.h2Index - a.h2Index);
    const newBody = [...body];

    for (const r of sorted) {
      const start = r.h2Index;
      if (newBody[start]?.style !== "h2") {
        console.log(`SKIP ${slug}: block ${start} is not an h2 anymore, content shifted. Re-run the audit.`);
        continue;
      }
      // end of this section = next h2 (in the CURRENT array), or end of body
      let end = newBody.length;
      for (let i = start + 1; i < newBody.length; i++) {
        if (newBody[i].style === "h2") { end = i; break; }
      }
      // guard: do not double-add if a button snuck in
      const already = newBody.slice(start, end).some((b) =>
        (b.markDefs || []).some((m) => /expedia\.com/i.test(m.href || ""))
      );
      if (already) { console.log(`SKIP ${slug} / ${r.hotelName}: already has a button`); continue; }

      newBody.splice(end, 0, ctaBlock(r.hotelName, r.expediaUrl));
      inserted++;
      console.log(`${WRITE ? "ADD " : "would add"} ${slug} / ${r.hotelName}`);
    }

    if (WRITE) await client.patch(doc._id).set({ body: newBody }).commit();
  }

  console.log(`\n${WRITE ? "Inserted" : "Dry run:"} ${inserted} CTA blocks across ${byPost.size} posts.`);
  if (!WRITE) console.log("Re-run with --write to apply.");
}
main().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
