# Dual-Path Hotel CTAs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every hotel in the guides a "Check current rates on Expedia" button (backfilling 44 gaps), and reframe the once-per-post concierge block to sell the travel-advisor advantage.

**Architecture:** Path A is a Sanity content migration, not a code change: a hotel button IS a PortableText link whose href is a raw `expedia.com` URL, and the existing `marks.link` serializer already renders such links as green `rel="sponsored"` buttons that Stay22 auto-monetizes. Three scripts: audit (find gaps), research (source exact Expedia URLs), insert (patch Sanity). Path B is a single copy edit in `blog/[slug]/page.tsx`.

**Tech Stack:** Node ESM scripts + `@sanity/client`, Next.js 15 App Router, Tailwind, Playwright (verification only).

## Global Constraints

- **No test framework exists. Do NOT add one.** The gate is `npx tsc --noEmit` (exit 0), the audit script reaching **0 gaps**, and a real-browser check.
- **Never use em dashes or en dashes** in any copy. Use periods, commas, parentheses, colons.
- **Writing to Sanity changes PRODUCTION immediately** (www.vacationpro.co reads this dataset live and the button serializer is already deployed). Every mutating script is dry-run by default and only writes with an explicit `--write` flag.
- **A wrong hotel link is worse than no link.** Never guess an Expedia `h` number. If a hotel's exact page cannot be found, record `skip` with a reason.
- Expedia rate-limits automated fetches (429), so URL correctness rests on research plus the slug self-check, NOT on fetching the page.
- Commit with **explicit paths only**, never `git add -A`. Leave `Marketing/`, `.superpowers/`, and unrelated untracked `scripts/*.mjs` alone.
- Sanity env comes from `vacationpro/.env.local`: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_WRITE_TOKEN`.
- Branch: `feat/hotel-dual-path-cta`. Do not deploy without being told.

## Reference: the exact CTA block shape to replicate

This is a real, working CTA block from `best-all-inclusive-resorts-punta-cana`. Every block you insert must match this shape:

```json
{
  "_type": "block",
  "_key": "b10",
  "style": "normal",
  "markDefs": [
    { "_type": "link", "_key": "fxmr9idtog62", "blank": true,
      "href": "https://www.expedia.com/Punta-Cana-Hotels-Hard-Rock-Hotel-Casino-Punta-Cana-All-Inclusive.h2464251.Hotel-Information" }
  ],
  "children": [
    { "_type": "span", "_key": "fxmr9idtog63",
      "marks": ["strong", "fxmr9idtog62"],
      "text": "Check current rates for Hard Rock Hotel & Casino Punta Cana on Expedia" }
  ]
}
```

The span's `marks` array must contain BOTH `"strong"` and the markDef `_key`. The `_key` values must be unique within the document.

## File Structure

- Create `scripts/audit-hotel-ctas.mjs` — read-only. Finds hotel H2 sections and whether each has an Expedia link. Writes `scripts/data/hotel-cta-candidates.json`. This is the gate for "done" (must reach 0 gaps).
- Create `scripts/data/hotel-cta-candidates.json` — generated candidate list (Task 1), then hand-curated + URL-filled (Task 2).
- Create `scripts/add-hotel-ctas.mjs` — dry-run by default, `--write` patches Sanity.
- Modify `src/app/(site)/blog/[slug]/page.tsx` — the end-of-post concierge block copy (Path B).

---

### Task 1: Audit script that finds hotel sections with no Expedia button

**Files:**
- Create: `scripts/audit-hotel-ctas.mjs`
- Create (generated): `scripts/data/hotel-cta-candidates.json`

**Interfaces:**
- Produces: `scripts/data/hotel-cta-candidates.json`, an array of
  `{ slug, title, h2Index, heading, hotelName, hasButton, expediaUrl, skip }`.
  Task 2 fills `expediaUrl` or `skip`. Task 3 consumes it.
- Produces: the audit summary used as the completion gate (`gaps: 0`).

- [ ] **Step 1: Write the audit script**

Create `scripts/audit-hotel-ctas.mjs`:

```js
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
```

- [ ] **Step 2: Run it**

Run: `node scripts/audit-hotel-ctas.mjs`

Expected: prints a `gaps: N` line and a per-post breakdown, and writes the JSON. N will be roughly 40 to 50. It does NOT need to equal 44: the earlier 44 came from a cruder heuristic that overcounted (it counted 8 hotels in `best-family-all-inclusive-resorts`, which actually has 6).

- [ ] **Step 3: Eyeball the candidate list for obvious junk**

Run: `node -e "const c=require('./scripts/data/hotel-cta-candidates.json'); c.slice(0,20).forEach(x=>console.log(x.slug.padEnd(38), '|', x.hotelName))"`

Every printed `hotelName` must look like an actual property name (e.g. `Beaches Turks & Caicos`), not a sentence fragment (e.g. `a Resort Great for Families`). If a row is clearly not a hotel, note it. You will remove such rows in Task 2.

- [ ] **Step 4: Commit**

```bash
git add scripts/audit-hotel-ctas.mjs scripts/data/hotel-cta-candidates.json
git commit -m "feat: audit script for hotel sections missing an Expedia CTA"
```

---

### Task 2: Research the exact Expedia URL for every candidate

**Files:**
- Modify: `scripts/data/hotel-cta-candidates.json` (fill `expediaUrl` or `skip` on every row; delete non-hotel rows)

**Interfaces:**
- Consumes: `scripts/data/hotel-cta-candidates.json` from Task 1.
- Produces: the same file, where EVERY row has either a non-null `expediaUrl` or a non-null `skip` reason, and no row is a non-hotel.

**This is research, not coding.** Work through the candidate rows. For each one:

1. **Drop it** (delete the row) if `hotelName` is not actually a lodging property. Task 1's heuristic overmatches.
2. Otherwise, web-search for that hotel's Expedia page and find its exact URL, of the form:
   `https://www.expedia.com/<Area>-Hotels-<Property-Name>.h<NUMBER>.Hotel-Information`
3. **Self-check (mandatory):** the property name must be recognizably present in the URL slug. Example: hotel `Beaches Turks & Caicos` -> URL contains `Beaches-Turks-Caicos`. If the slug does not match the hotel, you found the wrong property. Do not use it.
4. **Never guess an `h` number.** If you cannot find the exact page, set `skip` to a short reason (e.g. `"no Expedia listing found"`, `"ambiguous: heading names two properties"`) and leave `expediaUrl` null.
5. Do NOT curl/fetch expedia.com to verify. It rate-limits bots (429) and a 429 tells you nothing about correctness.

Known-tricky rows to expect:
- `Hyatt Zilara/Ziva Cap Cana` names TWO different properties in one heading. Pick the one the section body actually describes; if the body covers both, `skip` with reason `"ambiguous: heading names two properties"`.
- Accented names (`Hyatt Ziva Cancún`, `Barceló Bávaro Palace`) — Expedia slugs use unaccented ASCII (`Hyatt-Ziva-Cancun`, `Barcelo-Bavaro-Palace`). That is a match, not a mismatch.

- [ ] **Step 1: Fill in every row**

Edit `scripts/data/hotel-cta-candidates.json` so each remaining row has `expediaUrl` set (or `skip` set). Keep `slug`, `h2Index`, `heading`, `hotelName` untouched: Task 3 keys off them.

- [ ] **Step 2: Validate the file mechanically**

Run:

```bash
node -e "
const c = require('./scripts/data/hotel-cta-candidates.json');
const bad = c.filter(x => !x.expediaUrl && !x.skip);
const malformed = c.filter(x => x.expediaUrl && !/^https:\/\/www\.expedia\.com\/.+\.h\d+\.Hotel-Information/.test(x.expediaUrl));
// slug self-check: at least one distinctive word of the hotel name must appear in the URL.
// Strip accents first: Expedia slugs are ASCII (Cancún -> Cancun, Barceló -> Barcelo).
const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const mismatch = c.filter(x => {
  if (!x.expediaUrl) return false;
  const url = norm(x.expediaUrl);
  const words = norm(x.hotelName).split(/[^a-z0-9]+/).filter(w => w.length > 3);
  return !words.some(w => url.includes(w));
});
console.log('rows:', c.length, '| with url:', c.filter(x=>x.expediaUrl).length, '| skipped:', c.filter(x=>x.skip).length);
console.log('UNRESOLVED (must be 0):', bad.length, bad.map(x=>x.hotelName));
console.log('MALFORMED URL (must be 0):', malformed.length, malformed.map(x=>x.hotelName));
console.log('SLUG MISMATCH (must be 0):', mismatch.length, mismatch.map(x=>x.hotelName + ' -> ' + x.expediaUrl));
"
```

Expected: `UNRESOLVED`, `MALFORMED URL`, and `SLUG MISMATCH` all report **0**. If any is non-zero, fix those rows and re-run. Do not proceed with a non-zero count.

- [ ] **Step 3: Print the review table for the human**

Run:

```bash
node -e "
const c = require('./scripts/data/hotel-cta-candidates.json');
for (const x of c) console.log((x.skip ? 'SKIP  ' : 'ADD   ') + x.slug.padEnd(40) + ' | ' + x.hotelName.padEnd(38) + ' | ' + (x.expediaUrl || x.skip));
"
```

Report this full table in your final message. It is the human's last look before production content changes.

- [ ] **Step 4: Commit**

```bash
git add scripts/data/hotel-cta-candidates.json
git commit -m "feat: research exact Expedia URLs for hotel CTA backfill"
```

---

### Task 3: Insert the CTA blocks into Sanity

**Files:**
- Create: `scripts/add-hotel-ctas.mjs`

**Interfaces:**
- Consumes: `scripts/data/hotel-cta-candidates.json` (rows with `expediaUrl`; rows with `skip` are ignored).
- Produces: the CTA blocks live in Sanity, which makes the audit from Task 1 report `gaps: 0` (excluding skipped rows).

**This writes to PRODUCTION content.** Dry-run first, always.

- [ ] **Step 1: Write the insert script**

Create `scripts/add-hotel-ctas.mjs`:

```js
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
```

- [ ] **Step 2: Dry run**

Run: `node scripts/add-hotel-ctas.mjs`

Expected: prints one `would add <slug> / <Hotel>` line per row and a `Dry run: N CTA blocks across M posts.` summary. There must be **no** `SKIP ... is not an h2 anymore` lines. If there are, re-run Task 1's audit to refresh `h2Index` values and redo Task 2's URLs for any changed rows.

- [ ] **Step 3: Apply**

Run: `node scripts/add-hotel-ctas.mjs --write`

Expected: `Inserted N CTA blocks across M posts.` with N matching the dry run.

- [ ] **Step 4: Re-run the audit. This is the completion gate.**

Run: `node scripts/audit-hotel-ctas.mjs`

Expected: `gaps: 0`, EXCEPT for any rows you deliberately marked `skip` in Task 2. If a skipped hotel still appears as a gap, that is correct and expected. State clearly in your report how many gaps remain and that each is an intentional skip.

- [ ] **Step 5: Commit**

```bash
git add scripts/add-hotel-ctas.mjs
git commit -m "feat: backfill Expedia check-rates CTA under every hotel section"
```

---

### Task 4: Reframe the end-of-post concierge block (Path B)

**Files:**
- Modify: `src/app/(site)/blog/[slug]/page.tsx` (the "Share / CTA" block, around lines 223-240)

**Interfaces:**
- Consumes: nothing from earlier tasks. Independent of Path A.

The block currently sells a free itinerary, which gives the group / exclusive-deal buyer no reason to click. Replace the copy with the travel-advisor pitch. Structure, styling, and the `/concierge-planning` destination stay the same.

- [ ] **Step 1: Replace the CTA copy**

Find this exact block in `src/app/(site)/blog/[slug]/page.tsx`:

```tsx
            <div className="bg-brand-50 rounded-2xl p-8 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Planning a trip?
              </h3>
              <p className="text-gray-600 mb-4">
                Tell me where you want to go and I will put together a verified
                itinerary and pricing for you, free of charge.
              </p>
              <Link
                href="/concierge-planning"
                className="inline-block px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors"
              >
                Plan With Me
              </Link>
            </div>
```

Replace it with:

```tsx
            <div className="bg-brand-50 rounded-2xl p-8 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Booking a group, or want a rate you will not find on Expedia?
              </h3>
              <p className="text-gray-600 mb-4">
                I book as a travel advisor with access to agent-only pricing,
                resort credits, and group perks. Tell me your dates and I will
                price it against whatever you just saw.
              </p>
              <Link
                href="/concierge-planning"
                className="inline-block px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors"
              >
                Get my agent rate
              </Link>
            </div>
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0, no output.

- [ ] **Step 3: Confirm no em/en dashes were introduced**

Run: `grep -n "—\|–" "src/app/(site)/blog/[slug]/page.tsx"`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(site)/blog/[slug]/page.tsx"
git commit -m "feat: reframe post concierge CTA to the travel-advisor pitch"
```

---

### Task 5: Verify in a real browser

**Files:** none (verification only)

**Interfaces:**
- Consumes: the Sanity content from Task 3 and the code change from Task 4.

Curl cannot verify this. Stay22 rewrites hrefs client-side after hydration, so a raw `curl | grep stay22` returns 0 on every page regardless of correctness. You MUST use a real browser.

Note: the Task 3 Sanity content is ALREADY live on production (the button serializer is deployed), so the new buttons can be verified on production immediately. The Task 4 copy change is NOT live until deployed, so verify that one locally.

- [ ] **Step 1: Verify the new buttons monetize, on production**

Use Playwright. Navigate to `https://www.vacationpro.co/blog/best-family-all-inclusive-resorts`, wait for `window.Stay22` to be defined (poll up to 15s), wait a further 3s, then evaluate:

```js
() => {
  const links = [...document.querySelectorAll('a')];
  return {
    monetized: links.filter(a => (a.href||'').includes('stay22')).length,
    rawExpediaLeft: links.filter(a => (a.href||'').includes('expedia.com') && !(a.href||'').includes('stay22')).length,
    sponsoredButtons: [...document.querySelectorAll('a[rel*="sponsored"]')].length,
  };
}
```

Expected: `sponsoredButtons` >= 6 (one per hotel in that post), `monetized` > 0, and `rawExpediaLeft` === 0. Repeat for `https://www.vacationpro.co/blog/best-luxury-all-inclusive-resorts`.

- [ ] **Step 2: Verify the Path B copy renders locally**

Start the dev server (`npm run dev`, it uses port 3000; if 3000 is taken, kill the stale process first with `lsof -ti:3000 | xargs kill -9`). Navigate a browser to `http://localhost:3000/blog/best-family-all-inclusive-resorts` and confirm the end-of-post block reads "Booking a group, or want a rate you will not find on Expedia?" with a "Get my agent rate" button. Kill the dev server when done (`pkill -f "next dev"`).

- [ ] **Step 3: Report**

Report the browser numbers from Step 1 verbatim, the count of CTAs added, and the list of any intentional `skip` rows.

---

## Notes for the executor

- If the audit's `gaps` count disagrees with the "44" figure in the spec, trust the audit. The 44 came from a cruder heuristic that overcounted.
- Do not deploy. The Sanity content goes live on its own; the code change ships on the next deploy, which the human will trigger.
