# Stay22 Monetization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Monetize VacationPro's guide/blog content with Stay22 (auto-affiliate links, AI booking popups, embedded maps), retire Partnerize, and keep Stay22 completely off the concierge booking funnel.

**Architecture:** One client component (`Stay22Scripts`) injects Stay22's `letmeallez.js` and is mounted on exactly three guide routes, never in a shared layout. A one-time migration unwraps 98 Partnerize (prf.hn) links back to raw Expedia URLs so Stay22's LMA auto-monetizes them. A `Stay22Map` component plus a Sanity `stay22Map` PortableText block lets maps be dropped into any guide.

**Tech Stack:** Next.js App Router (server components), `next/script`, Sanity (PortableText), `@sanity/client` migration scripts, TypeScript.

## Global Constraints

- Stay22 `lmaID`: `6a4fa10b1b2dc574185e339d` (public client-side ID, not a secret).
- Stay22 script URL: `https://scripts.stay22.com/letmeallez.js`
- Stay22 loads on EXACTLY these three routes: `src/app/(site)/blog/page.tsx`, `src/app/(site)/blog/[slug]/page.tsx`, `src/app/(site)/destinations/[slug]/page.tsx`.
- Stay22 must NEVER load on: `/concierge-planning`, `/quote` (BOTH render the concierge intake form and are the money pages), `/` (home), `/webinar`, `/go`, `/studio`, admin. Do NOT put it in the root layout or the `(site)` layout.
- Never use em dashes or en dashes in any copy.
- No test framework exists. The gate for every task is `npx tsc --noEmit` (exit 0) plus the grep/curl checks in that task. Do NOT add a test framework.
- Commit with EXPLICIT paths only. Never `git add -A`.
- Leave these pre-existing dirty/untracked files alone: `Marketing/`, `src/app/layout.tsx`, `src/app/(site)/layout.tsx`, `src/components/ui/EmailPopup.tsx`, and untracked `scripts/*.mjs`.
- Do not deploy.

---

## File Structure

New:
- `src/components/monetization/Stay22Scripts.tsx` — client component, injects letmeallez.js. Guide routes only.
- `src/components/monetization/Stay22Map.tsx` — Stay22 embed-map iframe.
- `src/sanity/schemas/objects/stay22Map.ts` — Sanity object type for the PortableText map block.
- `scripts/unwrap-partnerize-links.mjs` — one-time migration, dry-run by default.
- `scripts/place-stay22-maps.mjs` — one-time, inserts a map block into the top guides.

Modified:
- `src/app/(site)/blog/page.tsx`, `src/app/(site)/blog/[slug]/page.tsx`, `src/app/(site)/destinations/[slug]/page.tsx` — render `<Stay22Scripts />`; blog `[slug]` also gains the `stay22Map` PortableText serializer.
- `src/sanity/schemas/index.ts` — register `stay22Map`.
- `src/sanity/schemas/blogPost.ts` — allow `stay22Map` in the `body` array.
- `skills/vacationpro-content-writer/SKILL.md` (+ any other skill emitting prf.hn) — write raw Expedia URLs going forward.

---

### Task 1: Stay22Scripts component, mounted on guide routes only

This is the core revenue change and the highest-risk one: a leak onto the concierge pages lets Nova poach a booking Brendan earns commission on.

**Files:**
- Create: `src/components/monetization/Stay22Scripts.tsx`
- Modify: `src/app/(site)/blog/page.tsx`, `src/app/(site)/blog/[slug]/page.tsx`, `src/app/(site)/destinations/[slug]/page.tsx`

**Interfaces:**
- Produces: default export `Stay22Scripts` (no props). Later tasks do not depend on it.

- [ ] **Step 1: Create the component**

Create `src/components/monetization/Stay22Scripts.tsx`. This is Brendan's exact Stay22 snippet wrapped in `next/script`. It is one inline script (not two) so the `Stay22.params` assignment is guaranteed to run before `letmeallez.js` is injected.

```tsx
'use client';

import Script from 'next/script';

const LMA_ID = '6a4fa10b1b2dc574185e339d';

/**
 * Loads Stay22's letmeallez.js, which activates LMA (auto-monetize accommodation
 * links), Spark (auto-insert affiliate links), and Nova (AI booking-intent popups).
 *
 * Mount this ONLY on guide/blog routes. It must never render on the concierge funnel
 * (/concierge-planning, /quote), the home page, or the studio: Nova detects booking
 * intent and can send the visitor to an OTA, which would poach a concierge lead that
 * Brendan earns advisor commission on.
 */
export default function Stay22Scripts() {
  return (
    <Script id="stay22-letmeallez" strategy="afterInteractive">
      {`(function (s, t, a, y, twenty, two) {
  s.Stay22 = s.Stay22 || {};
  s.Stay22.params = { lmaID: '${LMA_ID}' };
  twenty = t.createElement(a);
  two = t.getElementsByTagName(a)[0];
  twenty.async = 1;
  twenty.src = y;
  two.parentNode.insertBefore(twenty, two);
})(window, document, 'script', 'https://scripts.stay22.com/letmeallez.js');`}
    </Script>
  );
}
```

- [ ] **Step 2: Mount on the blog index**

In `src/app/(site)/blog/page.tsx`, add the import next to the other component imports:

```tsx
import Stay22Scripts from '@/components/monetization/Stay22Scripts';
```

Then render it as the last child inside the top-level wrapper `<div>` that the page returns (immediately before the closing `</div>`):

```tsx
      <Stay22Scripts />
    </div>
```

- [ ] **Step 3: Mount on the blog post page**

In `src/app/(site)/blog/[slug]/page.tsx`, add the import:

```tsx
import Stay22Scripts from '@/components/monetization/Stay22Scripts';
```

Render it as the last child inside the top-level wrapper `<div>` the page returns, immediately before its closing `</div>`:

```tsx
      <Stay22Scripts />
    </div>
```

- [ ] **Step 4: Mount on the destination guide page**

In `src/app/(site)/destinations/[slug]/page.tsx`, add the import:

```tsx
import Stay22Scripts from '@/components/monetization/Stay22Scripts';
```

Render it as the last child inside the top-level wrapper element the page returns, immediately before its closing tag:

```tsx
      <Stay22Scripts />
    </div>
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0, no output.

- [ ] **Step 6: Confirm it is mounted in exactly 3 files**

Run:
```bash
grep -rln "Stay22Scripts" src/app | sort
```
Expected EXACTLY these three lines and nothing else:
```
src/app/(site)/blog/[slug]/page.tsx
src/app/(site)/blog/page.tsx
src/app/(site)/destinations/[slug]/page.tsx
```

Also confirm it is NOT in any layout:
```bash
grep -rn "Stay22Scripts" src/app/layout.tsx "src/app/(site)/layout.tsx"
```
Expected: no output.

- [ ] **Step 7: Isolation check against a running dev server (CRITICAL)**

Start the dev server in the background, then check which pages serve the Stay22 script.

```bash
npm run dev > /tmp/vp-dev.log 2>&1 &
for i in $(seq 1 20); do curl -s -o /dev/null http://localhost:3000/ && break; sleep 2; done

echo "--- MUST CONTAIN letmeallez ---"
for p in /blog /blog/best-all-inclusive-resorts-punta-cana /destinations/cancun; do
  printf "%s: %s\n" "$p" "$(curl -s http://localhost:3000$p | grep -c letmeallez)"
done

echo "--- MUST BE ZERO (money pages) ---"
for p in / /concierge-planning /quote /webinar; do
  printf "%s: %s\n" "$p" "$(curl -s http://localhost:3000$p | grep -c letmeallez)"
done

pkill -f "next dev"; pkill -f "next-server"
```

Expected: the first three counts are all >= 1. The last four counts are all exactly `0`.

If any of the last four is non-zero, STOP: Stay22 is leaking onto a conversion page. Do not commit. Fix the mount location (it must not be in a layout) and re-run.

- [ ] **Step 8: Commit**

```bash
git add src/components/monetization/Stay22Scripts.tsx "src/app/(site)/blog/page.tsx" "src/app/(site)/blog/[slug]/page.tsx" "src/app/(site)/destinations/[slug]/page.tsx"
git commit -m "feat(stay22): load letmeallez on guide routes only"
```

---

### Task 2: Unwrap the 98 Partnerize links to raw Expedia URLs

Stay22's LMA monetizes plain `expedia.com` links automatically. Partnerize (prf.hn) wrappers hide the Expedia URL from it, so we unwrap them. The raw Expedia URL is already embedded inside every prf.hn link, so this is lossless.

**Files:**
- Create: `scripts/unwrap-partnerize-links.mjs`

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: nothing later tasks import. It mutates Sanity `blogPost.body` link markDefs.

- [ ] **Step 1: Write the migration script**

Create `scripts/unwrap-partnerize-links.mjs`:

```js
/**
 * Unwraps Partnerize (prf.hn) affiliate links in blog bodies back to their raw
 * Expedia destination URL, so Stay22's LMA script auto-monetizes them instead.
 *
 * A prf.hn link looks like:
 *   https://prf.hn/click/camref:1101l474Rp/destination:https://www.expedia.com/Foo.h123.Hotel-Information
 * and we rewrite the href to just the destination URL.
 *
 * Dry-run by default. Pass --write to apply.
 *   node scripts/unwrap-partnerize-links.mjs
 *   node scripts/unwrap-partnerize-links.mjs --write
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

const PRF_RE = /^https?:\/\/prf\.hn\/click\/camref:[^/]+\/destination:(.+)$/;

function unwrap(href) {
  const m = href.match(PRF_RE);
  if (!m) return null;
  let dest = m[1];
  if (/%3A|%2F/i.test(dest)) {
    try {
      dest = decodeURIComponent(dest);
    } catch {
      return null;
    }
  }
  return dest;
}

async function main() {
  const posts = await client.fetch(
    `*[_type=="blogPost" && defined(body)]{_id,"slug":slug.current,body}`
  );
  let changedPosts = 0;
  let changedLinks = 0;
  let unparseable = 0;
  const hosts = new Set();

  for (const p of posts) {
    let touched = 0;
    const body = p.body.map((b) => {
      if (!Array.isArray(b.markDefs) || b.markDefs.length === 0) return b;
      const markDefs = b.markDefs.map((md) => {
        if (md._type !== "link" || !md.href) return md;
        const raw = unwrap(md.href);
        if (!raw) return md;
        let host;
        try {
          host = new URL(raw).host;
        } catch {
          unparseable++;
          return md;
        }
        hosts.add(host);
        touched++;
        return { ...md, href: raw };
      });
      return { ...b, markDefs };
    });

    if (touched > 0) {
      changedPosts++;
      changedLinks += touched;
      console.log(`${WRITE ? "PATCH" : "would unwrap"} ${String(touched).padStart(2)}  ${p.slug}`);
      if (WRITE) await client.patch(p._id).set({ body }).commit();
    }
  }

  console.log(`\n${WRITE ? "Unwrapped" : "Dry run:"} ${changedLinks} links across ${changedPosts} posts.`);
  console.log(`Destination hosts seen: ${[...hosts].join(", ") || "(none)"}`);
  if (unparseable > 0) {
    console.log(`WARNING: ${unparseable} prf.hn link(s) had an unparseable destination and were left untouched.`);
  }
  const nonExpedia = [...hosts].filter((h) => !/(^|\.)expedia\.com$/.test(h));
  if (nonExpedia.length > 0) {
    console.log(`WARNING: non-Expedia destination host(s) found: ${nonExpedia.join(", ")}`);
  }
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
```

- [ ] **Step 2: Dry run and sanity-check the numbers**

Run: `node scripts/unwrap-partnerize-links.mjs`

Expected: `Dry run: 98 links across 60 posts.` and `Destination hosts seen: www.expedia.com`.
Expected: NO warnings.

If the count is not 98/60 or a non-Expedia host appears, STOP and report before writing.

- [ ] **Step 3: Apply**

Run: `node scripts/unwrap-partnerize-links.mjs --write`
Expected: `Unwrapped 98 links across 60 posts.`

- [ ] **Step 4: Verify no Partnerize links remain and the Expedia links survived**

Run:
```bash
node --input-type=module -e '
import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
const E=readFileSync("./.env.local","utf8");
const env=Object.fromEntries(E.split("\n").filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const i=l.indexOf("=");return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["\x27]|["\x27]$/g,"")];}));
const c=createClient({projectId:env.NEXT_PUBLIC_SANITY_PROJECT_ID,dataset:env.NEXT_PUBLIC_SANITY_DATASET||"production",apiVersion:"2026-03-09",useCdn:false,token:env.SANITY_API_WRITE_TOKEN});
const posts=await c.fetch(`*[_type=="blogPost" && defined(body)]{body}`);
let prf=0,exp=0;
for(const p of posts)for(const b of p.body||[])for(const md of b.markDefs||[]){
  const h=md.href||"";
  if(/prf\.hn/.test(h))prf++;
  if(/expedia\.com/.test(h))exp++;
}
console.log("prf.hn remaining:",prf," raw expedia:",exp);
'
```
Expected: `prf.hn remaining: 0  raw expedia: 98`

- [ ] **Step 5: Commit**

```bash
git add scripts/unwrap-partnerize-links.mjs
git commit -m "feat(stay22): unwrap 98 Partnerize links to raw Expedia URLs"
```

---

### Task 3: Stop emitting Partnerize links in the content skills

New blog posts must write raw Expedia URLs, not prf.hn wrappers, or the next batch re-introduces the problem Task 2 just fixed.

**Files:**
- Modify: `skills/vacationpro-content-writer/SKILL.md` and any other file under `skills/` that instructs writing a prf.hn link.

Note: the `skills/` directory lives in the PARENT repo (`/Users/brendanobrien/Documents/Claude`), not in the vacationpro repo. Commit it there, separately.

- [ ] **Step 1: Find every skill instructing prf.hn**

Run:
```bash
grep -rln "prf.hn" /Users/brendanobrien/Documents/Claude/skills/
```
Expected: one or more SKILL.md paths. Work through each one.

- [ ] **Step 2: Rewrite the affiliate-link instructions**

In each file found, replace the instruction that says to wrap the Expedia URL in `https://prf.hn/click/camref:1101l474Rp/destination:<URL>` with an instruction to use the RAW Expedia URL directly. The CTA line format stays the same. For example, the instruction becomes:

```
## Affiliate links (REQUIRED on posts that recommend specific bookable resorts)
VacationPro monetizes accommodation links automatically via Stay22 (its LMA script
rewrites any Expedia link into a tracked affiliate link at page load). So you write
PLAIN Expedia URLs. Do NOT wrap them in prf.hn / Partnerize links.

For each SPECIFIC resort you recommend:
1. Web-find that resort's exact Expedia.com hotel page URL. Format:
   `https://www.expedia.com/<Area>-Hotels-<Resort-Name>.h<NUMBER>.Hotel-Information`
   Do NOT guess the h-number; find the real one. If the resort is genuinely not on
   Expedia, skip its affiliate link.
2. Add a CTA on its own line at the end of that resort's section:
   `**[Check current rates for <Resort Name> on Expedia](<the plain Expedia URL>)**`
```

Keep the surrounding structure and voice of each skill file intact. Do not use em dashes or en dashes.

- [ ] **Step 3: Verify no skill still tells the writer to use prf.hn**

Run:
```bash
grep -rn "prf.hn" /Users/brendanobrien/Documents/Claude/skills/ | grep -viE "no longer|do not|don't|instead of|deprecated|superseded"
```
Expected: no output.

- [ ] **Step 4: Commit (in the parent repo)**

```bash
cd /Users/brendanobrien/Documents/Claude
git add skills/vacationpro-content-writer/SKILL.md
# add any other skill files the grep in Step 1 found
git commit -m "docs(skills): write raw Expedia URLs, Stay22 monetizes them (retire Partnerize)"
cd /Users/brendanobrien/Documents/Claude/vacationpro
```

---

### Task 4: Stay22Map component, Sanity block, and PortableText serializer

Lets an editor drop a "where to stay" map into any guide body.

**Files:**
- Create: `src/components/monetization/Stay22Map.tsx`
- Create: `src/sanity/schemas/objects/stay22Map.ts`
- Modify: `src/sanity/schemas/index.ts`, `src/sanity/schemas/blogPost.ts`, `src/app/(site)/blog/[slug]/page.tsx`

**Interfaces:**
- Produces: default export `Stay22Map` with props `{ address: string; checkin?: string; checkout?: string }`. Task 5 relies on the Sanity block being named `stay22Map` with fields `address`, `checkin`, `checkout`.

- [ ] **Step 1: Confirm the Stay22 map embed ID**

The map iframe uses an `aid` (embed ID) from the Stay22 Hub, which may or may not equal the `lmaID`. Log in to https://hub.stay22.com and check the map/embed section for the embed ID and the exact iframe URL it generates.

- If the Hub's embed ID equals `6a4fa10b1b2dc574185e339d`, no env var is needed (the component defaults to it).
- If it differs, add to `.env.local`: `NEXT_PUBLIC_STAY22_MAP_AID=<the id from the Hub>` and also set it in the Vercel project env.

Record which case applied in your report. If you cannot access the Hub, proceed with the default and flag it clearly in your report as UNVERIFIED, because the map will render but may not be attributed.

- [ ] **Step 2: Create the map component**

Create `src/components/monetization/Stay22Map.tsx`:

```tsx
const MAP_AID = process.env.NEXT_PUBLIC_STAY22_MAP_AID || '6a4fa10b1b2dc574185e339d';

interface Stay22MapProps {
  address: string;
  checkin?: string;
  checkout?: string;
}

/**
 * Stay22 embedded map: shows bookable stays around an address, monetized by Stay22.
 * Safe on guide pages only (same rule as Stay22Scripts).
 */
export default function Stay22Map({ address, checkin, checkout }: Stay22MapProps) {
  const params = new URLSearchParams({ aid: MAP_AID, address });
  if (checkin) params.set('checkin', checkin);
  if (checkout) params.set('checkout', checkout);
  const src = `https://www.stay22.com/embed/gm?${params.toString()}`;

  return (
    <figure className="not-prose my-8">
      <iframe
        src={src}
        title={`Where to stay near ${address}`}
        width="100%"
        height="460"
        loading="lazy"
        style={{ border: 0, borderRadius: '0.75rem' }}
        referrerPolicy="no-referrer-when-downgrade"
      />
      <figcaption className="mt-2 text-sm text-gray-500">
        Compare places to stay near {address}. We may earn a commission from bookings, at no cost to you.
      </figcaption>
    </figure>
  );
}
```

- [ ] **Step 3: Create the Sanity object type**

Create `src/sanity/schemas/objects/stay22Map.ts`:

```ts
const stay22Map = {
  name: 'stay22Map',
  title: 'Stay22 Map',
  type: 'object',
  fields: [
    {
      name: 'address',
      title: 'Address or destination',
      type: 'string',
      description: 'For example: Punta Cana, Dominican Republic',
      validation: (r: any) => r.required(),
    },
    { name: 'checkin', title: 'Check-in (YYYY-MM-DD, optional)', type: 'string' },
    { name: 'checkout', title: 'Check-out (YYYY-MM-DD, optional)', type: 'string' },
  ],
  preview: {
    select: { address: 'address' },
    prepare({ address }: { address?: string }) {
      return { title: address ? `Stay22 Map: ${address}` : 'Stay22 Map' };
    },
  },
};

export default stay22Map;
```

- [ ] **Step 4: Register the schema**

Replace the contents of `src/sanity/schemas/index.ts` with:

```ts
import destination from './destination';
import category from './category';
import blogPost from './blogPost';
import blogCategory from './blogCategory';
import blogTag from './blogTag';
import stay22Map from './objects/stay22Map';

export const schemaTypes = [destination, category, blogPost, blogCategory, blogTag, stay22Map];
```

- [ ] **Step 5: Allow the block inside blogPost.body**

In `src/sanity/schemas/blogPost.ts`, find the `body` field's `of: [` array. It currently starts with `{ type: 'block', ... }` and contains at least one more entry. Add this entry to the END of that `of` array (after the last existing entry, inside the closing `]`):

```ts
        { type: 'stay22Map' },
```

- [ ] **Step 6: Render it in the blog post PortableText**

In `src/app/(site)/blog/[slug]/page.tsx`, add the import:

```tsx
import Stay22Map from '@/components/monetization/Stay22Map';
```

Then in the `portableTextComponents` object, inside its `types: {` block, add a `stay22Map` serializer alongside the existing `image` one:

```tsx
    stay22Map: ({ value }) => (
      <Stay22Map
        address={value.address}
        checkin={value.checkin}
        checkout={value.checkout}
      />
    ),
```

- [ ] **Step 7: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0, no output.

- [ ] **Step 8: Commit**

```bash
git add src/components/monetization/Stay22Map.tsx src/sanity/schemas/objects/stay22Map.ts src/sanity/schemas/index.ts src/sanity/schemas/blogPost.ts "src/app/(site)/blog/[slug]/page.tsx"
git commit -m "feat(stay22): add Stay22Map component, Sanity block, and PortableText serializer"
```

---

### Task 5: Place maps in the top guides and prove one renders

**Files:**
- Create: `scripts/place-stay22-maps.mjs`

**Interfaces:**
- Consumes: the Sanity `stay22Map` object type from Task 4 (fields `address`, optional `checkin`/`checkout`) and the `Stay22Map` serializer registered in `blog/[slug]/page.tsx`.

- [ ] **Step 1: Write the placement script**

Create `scripts/place-stay22-maps.mjs`. It appends one `stay22Map` block to the end of five destination guides, and is idempotent (skips a post that already has a map).

```js
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
      `*[_type=="blogPost" && slug.current==$slug][0]{_id,"slug":slug.current,body}`,
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
    const block = { _type: "stay22Map", _key: nk(), address };
    const newBody = [...body, block];
    placed++;
    console.log(`${WRITE ? "PLACE   " : "would place"} ${slug} -> ${address}`);
    if (WRITE) await client.patch(post._id).set({ body: newBody }).commit();
  }

  console.log(`\n${WRITE ? "Placed" : "Dry run:"} ${placed} map(s), skipped ${skipped}.`);
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
```

- [ ] **Step 2: Dry run**

Run: `node scripts/place-stay22-maps.mjs`
Expected: five `would place` lines (or `skip`/`MISSING` lines if a slug does not exist) and a summary. If a slug is MISSING, that is acceptable; note it and continue.

- [ ] **Step 3: Apply**

Run: `node scripts/place-stay22-maps.mjs --write`
Expected: `Placed N map(s), skipped 0.` where N is the number of existing slugs.

- [ ] **Step 4: Prove a map actually renders on the page**

```bash
npm run dev > /tmp/vp-dev.log 2>&1 &
for i in $(seq 1 20); do curl -s -o /dev/null http://localhost:3000/ && break; sleep 2; done
curl -s http://localhost:3000/blog/best-all-inclusive-resorts-punta-cana | grep -o 'stay22.com/embed/gm[^"]*' | head -1
pkill -f "next dev"; pkill -f "next-server"
```
Expected: one line containing `stay22.com/embed/gm?aid=...&address=Punta+Cana...`

If nothing prints, the serializer is not wired up. Fix Task 4 Step 6 before continuing.

- [ ] **Step 5: Commit**

```bash
git add scripts/place-stay22-maps.mjs
git commit -m "feat(stay22): place maps in top destination guides"
```

---

### Task 6: Final verification

No code changes. Prove the whole feature works and, above all, that Stay22 is not on the money pages.

- [ ] **Step 1: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 2: Confirm no Partnerize links remain anywhere**

Run:
```bash
grep -rn "prf.hn" src/ | grep -v node_modules
```
Expected: no output.

- [ ] **Step 3: Full isolation + presence sweep against the dev server**

```bash
npm run dev > /tmp/vp-dev.log 2>&1 &
for i in $(seq 1 20); do curl -s -o /dev/null http://localhost:3000/ && break; sleep 2; done

echo "=== Stay22 MUST be present (guides) ==="
for p in /blog /blog/best-all-inclusive-resorts-punta-cana /destinations/cancun; do
  printf "%-50s letmeallez=%s\n" "$p" "$(curl -s http://localhost:3000$p | grep -c letmeallez)"
done

echo "=== Stay22 MUST BE ABSENT (money pages) ==="
for p in / /concierge-planning /quote /webinar; do
  printf "%-50s letmeallez=%s\n" "$p" "$(curl -s http://localhost:3000$p | grep -c letmeallez)"
done

echo "=== pages still return 200 ==="
for p in / /blog /concierge-planning /quote /destinations/cancun /blog/best-all-inclusive-resorts-punta-cana; do
  printf "%-50s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000$p)"
done

pkill -f "next dev"; pkill -f "next-server"
```

Expected:
- guides: `letmeallez=1` (or more) on all three.
- money pages: `letmeallez=0` on ALL FOUR. Any non-zero is a hard failure.
- every page returns `200`.

- [ ] **Step 4: Report**

Write the results of Step 3 verbatim into your report. Explicitly state whether the four money pages were all zero.

---

## Notes for the implementer

- Stay22's Nova/Spark/LMA behaviour is configured in the Stay22 Hub, not in code. If the popups feel wrong later, that is a Hub setting, not a code change.
- The map `aid` is the one genuine unknown. If you cannot confirm it in the Hub, say so plainly rather than guessing.
- Do NOT delete `src/sanity/schemas/deal.ts` or the orphaned Sanity deal documents. They were intentionally left in place by Part 1.
