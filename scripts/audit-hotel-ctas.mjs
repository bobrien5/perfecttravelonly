/**
 * audit-hotel-ctas.mjs  (READ ONLY)
 *
 * Finds every H2 section in a published VacationPro guide that names a hotel but has
 * no Expedia link in it, i.e. no "Check current rates" button for the reader.
 *
 * Hotel detection is a HEURISTIC. It over- and under-matches, so the output is a
 * CANDIDATE list for review, never something to act on blindly.
 *
 * Usage: node scripts/audit-hotel-ctas.mjs
 * Writes: scripts/data/hotel-cta-candidates.json
 */
import { createClient } from "@sanity/client";
import { readFileSync, writeFileSync, mkdirSync } from "fs";

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

// Words that signal an H2 names a lodging property.
const BRAND_HINT =
  /resort|hotel|sandals|beaches|riu|excellence|secrets|hyatt|zilara|ziva|iberostar|barcel|dreams|hard rock|majestic|nickelodeon|palace|bahia|melia|meliá|club med|breathless|live aqua|le blanc|jade mountain|ladera|coconut bay|bodyholiday|half moon|galley bay|curtain bluff|hammock cove|pineapple beach|divi|tamarijn|bucuti|joia|holiday inn|grand palladium|moon palace|atlantis|baha mar|sanctuary|zoetry|now |royalton|ocean blue|paradisus/i;

// H2s that are structural, never a hotel, even if they contain a brand word.
const NOT_HOTEL =
  /^(what|why|how|when|where|which|who|tips|faq|frequently|related|final|bottom line|the bottom|conclusion|about|find your|ready|before you|planning|is |are |do |does |should )/i;

/**
 * Pull the hotel name out of an H2 like:
 *   "Best Overall: Beaches Turks & Caicos"      -> "Beaches Turks & Caicos"
 *   "Hard Rock Hotel & Casino Punta Cana (Best All-Around)" -> "Hard Rock Hotel & Casino Punta Cana"
 *   "1. Sandals Royal Caribbean"                -> "Sandals Royal Caribbean"
 */
function extractHotelName(heading) {
  let s = heading.trim();
  s = s.replace(/^\s*\d+[.)]\s*/, "");        // leading "1." / "1)"
  if (s.includes(":")) s = s.slice(s.indexOf(":") + 1); // drop "Best Overall:" label
  s = s.replace(/\([^)]*\)\s*$/, "");          // drop trailing "(Best All-Around)"
  return s.trim();
}

const text = (b) => (b.children || []).map((c) => c.text || "").join("");
const hasExpediaLink = (b) => (b.markDefs || []).some((m) => /expedia\.com/i.test(m.href || ""));

async function main() {
  const posts = await client.fetch(
    `*[_type=="blogPost" && (brand=="vacationpro"||!defined(brand)) && (status=="published"||!defined(status)) && defined(body)]{"slug":slug.current, title, body} | order(slug asc)`
  );

  const candidates = [];
  let hotelSections = 0;
  let withButton = 0;

  for (const p of posts) {
    const body = p.body || [];
    // section boundaries: each h2 owns blocks until the next h2
    const h2s = [];
    body.forEach((b, i) => { if (b.style === "h2") h2s.push(i); });

    for (let k = 0; k < h2s.length; k++) {
      const start = h2s[k];
      const end = k + 1 < h2s.length ? h2s[k + 1] : body.length;
      const heading = text(body[start]);
      if (!BRAND_HINT.test(heading) || NOT_HOTEL.test(heading)) continue;

      hotelSections++;
      const sectionHasButton = body.slice(start, end).some(hasExpediaLink);
      if (sectionHasButton) { withButton++; continue; }

      candidates.push({
        slug: p.slug,
        title: p.title,
        h2Index: start,
        heading,
        hotelName: extractHotelName(heading),
        hasButton: false,
        expediaUrl: null,  // Task 2 fills this
        skip: null,        // or a reason string
      });
    }
  }

  mkdirSync(new URL("./data/", import.meta.url), { recursive: true });
  const out = new URL("./data/hotel-cta-candidates.json", import.meta.url);
  writeFileSync(out, JSON.stringify(candidates, null, 2));

  const byPost = candidates.reduce((m, c) => ((m[c.slug] = (m[c.slug] || 0) + 1), m), {});
  console.log(`posts: ${posts.length}`);
  console.log(`hotel sections detected: ${hotelSections}  (with button: ${withButton})`);
  console.log(`\ngaps: ${candidates.length}  across ${Object.keys(byPost).length} posts`);
  for (const [slug, n] of Object.entries(byPost).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(2)}  ${slug}`);
  }
  console.log(`\nwrote ${candidates.length} candidates to scripts/data/hotel-cta-candidates.json`);
}
main().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
