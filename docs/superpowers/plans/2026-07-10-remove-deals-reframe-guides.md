# Remove Deals + Reframe as Tropical-Travel Guides — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Delete VacationPro's deals catalog end-to-end, 301-redirect its old URLs, and reframe the site's nav, footer, and homepage around tropical-travel guides + a concierge CTA, with no broken links or dead imports.

**Architecture:** A Next.js 15 (App Router) + Sanity content site. This is a removal + reframe: delete the `(site)/deals` route tree and deal schema/data/UI, redirect old URLs in `next.config.ts`, rewrite Header/Footer/homepage, and run one Sanity migration to repoint `/deals` links inside blog bodies. No new runtime subsystems.

**Tech Stack:** Next.js (App Router, TypeScript), Sanity (`@sanity/client`), Tailwind v4.

## Global Constraints

- **No test framework exists** (no vitest/jest). The per-task gate is: `npx tsc --noEmit` (typecheck) AND `npm run build` succeed, plus the task's explicit `grep`/`curl` verification. Do NOT add a test framework (YAGNI).
- **Writing style:** never use em dashes (—) or en dashes (–) in any user-facing copy. Use periods, commas, parentheses.
- **Redirects:** old `/deals/*` → `/destinations` and `/deals` → `/`, all **301 (permanent: true)**.
- **Non-destructive Sanity:** do NOT delete the 27 `deal` documents. Only unregister the schema type.
- **Leave `/go` affiliate links alone** — those are handled in Part 2 (Stay22). This part only touches `/deals` links.
- **Branch:** `feat/stay22-monetization` (already checked out).
- Commit after every task with a clear message.

## File Structure

- `next.config.ts` — MODIFY: add `/deals*` → `/destinations` redirects.
- `src/components/layout/Header.tsx` — MODIFY: drop Deals + Categories dropdowns; add Guides + Plan-With-Me; retitle CTA.
- `src/components/layout/Footer.tsx` — MODIFY: replace deals column with Guides/Concierge; retitle newsletter blurb.
- `src/app/(site)/page.tsx` — REWRITE: guides-first homepage, no deal sections/queries, add concierge band.
- `scripts/repoint-deals-links.mjs` — CREATE: Sanity migration repointing `/deals` link markDefs.
- `src/components/ui/DestinationCard.tsx` — MODIFY: remove `dealCount` display.
- `src/sanity/schemas/index.ts` — MODIFY: unregister `deal` type.
- DELETE: `src/app/(site)/deals/` (tree), `src/components/ui/DealCard.tsx`, `src/components/ui/ClaimOfferForm.tsx`, `src/data/deals.ts`, `src/app/api/ghl/claim-offer/route.ts`.
- Dead-import sweep across pages that import deal helpers/types.
- `src/app/(landing)/concierge-planning/page.tsx` — MODIFY: remove deal-based free path (stopgap).

---

### Task 1: Redirect old deal URLs

**Files:**
- Modify: `next.config.ts`

**Interfaces:**
- Produces: 301 redirects for `/deals/:category/:slug`, `/deals/:category`, `/deals`.

- [ ] **Step 1: Add redirects to the `redirects()` array**

In `next.config.ts`, add these three entries to the array returned by `async redirects()` (keep the existing `/d/aruba` and `/d/puntacana` entries):

```ts
      {
        source: "/deals/:category/:slug",
        destination: "/destinations",
        permanent: true,
      },
      {
        source: "/deals/:category",
        destination: "/destinations",
        permanent: true,
      },
      {
        source: "/deals",
        destination: "/",
        permanent: true,
      },
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0, no errors.

- [ ] **Step 3: Verify redirects resolve (dev server)**

Run: `npm run dev` in the background, then:
`curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/deals/all-inclusive`
Expected: `308` or `307`/`301` to `/destinations` (Next dev emits 308 for permanent; production emits 301). Also check `http://localhost:3000/deals` → `/`. Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add next.config.ts
git commit -m "feat: 301-redirect old /deals URLs to /destinations"
```

---

### Task 2: Reframe the Header nav

**Files:**
- Modify: `src/components/layout/Header.tsx`

**Interfaces:**
- Produces: a `navigation` array with no `/deals` hrefs; a "Plan With Me" CTA to `/concierge-planning`.

- [ ] **Step 1: Replace the `navigation` constant**

Replace the entire `const navigation = [ ... ];` block with:

```tsx
const navigation = [
  { name: 'Guides', href: '/blog' },
  {
    name: 'Destinations',
    href: '/destinations/cancun',
    children: [
      { name: 'Cancun', href: '/destinations/cancun' },
      { name: 'Punta Cana', href: '/destinations/punta-cana' },
      { name: 'Jamaica', href: '/destinations/jamaica' },
      { name: 'Aruba', href: '/destinations/aruba' },
      { name: 'Cabo San Lucas', href: '/destinations/cabo-san-lucas' },
      { name: 'Orlando', href: '/destinations/orlando' },
      { name: 'Las Vegas', href: '/destinations/las-vegas' },
      { name: 'Maui', href: '/destinations/maui' },
    ],
  },
  { name: 'About', href: '/about' },
];
```

- [ ] **Step 2: Retitle the desktop CTA**

In the desktop CTA `Link`, change `href="/newsletter"` → `href="/concierge-planning"` and the text `Get Deal Alerts` → `Plan With Me`.

- [ ] **Step 3: Retitle the mobile CTA**

In the mobile nav CTA `Link`, make the same change: `href="/concierge-planning"` and text `Plan With Me`.

- [ ] **Step 4: Verify no deal links remain**

Run: `grep -n "/deals" src/components/layout/Header.tsx`
Expected: no output.

- [ ] **Step 5: Typecheck + commit**

```bash
npx tsc --noEmit
git add src/components/layout/Header.tsx
git commit -m "feat: reframe header nav to Guides/Destinations + Plan With Me"
```

---

### Task 3: Reframe the Footer

**Files:**
- Modify: `src/components/layout/Footer.tsx`

**Interfaces:**
- Consumes: `footerLinks` object.
- Produces: `footerLinks` with a `guides` key instead of `deals`.

- [ ] **Step 1: Replace the `deals` key with `guides`**

In `footerLinks`, replace the entire `deals: [ ... ],` array with:

```tsx
  guides: [
    { name: 'All Guides', href: '/blog' },
    { name: 'Destinations', href: '/destinations/cancun' },
    { name: 'Plan With Me', href: '/concierge-planning' },
  ],
```

- [ ] **Step 2: Update the column that renders `footerLinks.deals`**

Grep for where the deals column renders: `grep -n "footerLinks.deals\|Deals" src/components/layout/Footer.tsx`. Change the reference `footerLinks.deals` → `footerLinks.guides` and the column heading text (e.g. "Deals") → "Guides".

- [ ] **Step 3: Retitle the newsletter blurb**

Grep: `grep -n "deal" src/components/layout/Footer.tsx`. Replace copy "Get the best vacation deals in your inbox" → "Tropical travel guides and tips in your inbox" and "never miss a deal" → "never miss a new guide". Remove any remaining `/deals` hrefs.

- [ ] **Step 4: Verify**

Run: `grep -n "/deals" src/components/layout/Footer.tsx`
Expected: no output.

- [ ] **Step 5: Typecheck + commit**

```bash
npx tsc --noEmit
git add src/components/layout/Footer.tsx
git commit -m "feat: reframe footer to guides + concierge"
```

---

### Task 4: Repoint `/deals` links inside blog bodies (Sanity migration)

**Files:**
- Create: `scripts/repoint-deals-links.mjs`

**Interfaces:**
- Produces: a dry-run-by-default migration; `--write` applies. Repoints `link` markDefs whose `href` starts with `/deals` to `/destinations/<slug>` when a matching destination exists, else `/destinations`. Leaves `/go` and external links untouched.

- [ ] **Step 1: Write the migration script**

Create `scripts/repoint-deals-links.mjs`:

```js
/**
 * Repoints /deals internal links in blog bodies to /destinations after the
 * deals catalog is removed. Dry-run by default; --write applies.
 * Leaves /go affiliate links and external links untouched.
 */
import { createClient } from "@sanity/client";
import { readFileSync } from "fs";

const WRITE = process.argv.includes("--write");
const ENVTXT = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const env = Object.fromEntries(ENVTXT.split("\n").filter(l => l && !l.startsWith("#") && l.includes("=")).map(l => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; }));
const client = createClient({ projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID, dataset: env.NEXT_PUBLIC_SANITY_DATASET || "production", apiVersion: "2026-03-09", useCdn: false, token: env.SANITY_API_WRITE_TOKEN });

function repointHref(href, destSlugs) {
  // /deals/<category>/<slug> or /deals/<category> -> /destinations/<slug> if slug is a known destination, else /destinations
  const parts = href.replace(/^\/deals\/?/, "").split("/").filter(Boolean);
  for (const p of parts) if (destSlugs.has(p)) return `/destinations/${p}`;
  return "/destinations";
}

async function main() {
  const destSlugs = new Set(await client.fetch(`*[_type=="destination"].slug.current`));
  const posts = await client.fetch(`*[_type=="blogPost" && defined(body)]{_id,"slug":slug.current,body}`);
  let changedPosts = 0, changedLinks = 0;
  for (const p of posts) {
    let touched = 0;
    const body = p.body.map(b => {
      if (!Array.isArray(b.markDefs)) return b;
      const markDefs = b.markDefs.map(md => {
        if (md._type === "link" && typeof md.href === "string" && md.href.startsWith("/deals")) {
          touched++; changedLinks++;
          return { ...md, href: repointHref(md.href, destSlugs) };
        }
        return md;
      });
      return { ...b, markDefs };
    });
    if (touched > 0) {
      changedPosts++;
      console.log(`${WRITE ? "PATCH" : "would fix"} ${String(touched).padStart(2)} links  ${p.slug}`);
      if (WRITE) await client.patch(p._id).set({ body }).commit();
    }
  }
  console.log(`\n${WRITE ? "Patched" : "Dry run:"} ${changedLinks} links across ${changedPosts} posts.`);
}
main().catch(e => { console.error("FAILED:", e.message); process.exit(1); });
```

- [ ] **Step 2: Dry run**

Run: `node scripts/repoint-deals-links.mjs`
Expected: a list of posts with counts and a total (some number > 0 of `/deals` links).

- [ ] **Step 3: Apply**

Run: `node scripts/repoint-deals-links.mjs --write`
Expected: `PATCH` lines and a total. Then re-run `node scripts/repoint-deals-links.mjs` (dry) and expect `0 links across 0 posts`.

- [ ] **Step 4: Commit**

```bash
git add scripts/repoint-deals-links.mjs
git commit -m "feat: repoint /deals blog links to /destinations"
```

---

### Task 5: Rewrite the homepage (guides-first)

**Files:**
- Modify: `src/app/(site)/page.tsx`

**Interfaces:**
- Consumes: `getAllDestinations`, `getRecentBlogPosts` from `@/sanity/lib/fetch`; `DestinationCard`, `BlogCard`, `NewsletterSignup`, `SectionHeader` components.
- Produces: a homepage with NO deal imports/queries.

- [ ] **Step 1: Replace the entire file**

Replace `src/app/(site)/page.tsx` with:

```tsx
import Link from 'next/link';
import DestinationCard from '@/components/ui/DestinationCard';
import BlogCard from '@/components/ui/BlogCard';
import NewsletterSignup from '@/components/ui/NewsletterSignup';
import SectionHeader from '@/components/ui/SectionHeader';
import { getAllDestinations, getRecentBlogPosts } from '@/sanity/lib/fetch';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VacationPro: Tropical Travel Guides + Concierge Booking',
  description:
    'Expert guides to the best tropical and all-inclusive trips, plus concierge booking to plan and book your vacation with a real travel advisor.',
  alternates: { canonical: '/' },
};

export default async function HomePage() {
  const [allDestinations, recentPosts] = await Promise.all([
    getAllDestinations(),
    getRecentBlogPosts(6),
  ]);
  const topDestinations = allDestinations.slice(0, 8);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&h=800&fit=crop')] bg-cover bg-center" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 md:py-28">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6">
              Your guide to the best tropical trips.
              <span className="text-brand-300"> Booked with a real advisor.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-brand-100 mb-6 sm:mb-8 max-w-2xl">
              Honest guides to all-inclusive resorts, Caribbean beaches, and warm-weather escapes.
              When you are ready to book, plan the whole trip with me.
            </p>
            <div className="flex flex-row gap-3 sm:gap-4">
              <Link
                href="/blog"
                className="inline-flex items-center justify-center px-5 sm:px-8 py-3 sm:py-4 bg-white text-brand-700 font-semibold rounded-xl hover:bg-brand-50 transition-colors text-sm sm:text-lg"
              >
                Browse Guides
              </Link>
              <Link
                href="/concierge-planning"
                className="inline-flex items-center justify-center px-5 sm:px-8 py-3 sm:py-4 bg-brand-700 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors text-sm sm:text-lg border border-brand-500"
              >
                Plan With Me
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured guides */}
      {recentPosts.length > 0 && (
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title="Latest Guides"
              subtitle="Destination guides, resort breakdowns, and tropical travel tips."
              viewAllHref="/blog"
              viewAllText="Read the Blog"
            />
            <div className="grid md:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Destinations */}
      <section className="py-12 sm:py-16 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Explore Destinations"
            subtitle="Guides to the most popular tropical destinations."
          />
          <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 md:grid-cols-4 sm:gap-4 sm:overflow-visible sm:pb-0">
            {topDestinations.map((dest) => (
              <div key={dest.id} className="min-w-[200px] sm:min-w-0 snap-start">
                <DestinationCard destination={dest} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Concierge upsell band (placeholder copy; real two-tier component lands in Part 3) */}
      <section className="py-14 sm:py-20 bg-gradient-to-r from-brand-600 to-brand-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Ready to book? Let me plan it.</h2>
          <p className="text-brand-50 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
            Tell me your dates, your group, and your home airport. I will build the trip and book it
            for you as your travel advisor. No booking fees.
          </p>
          <Link
            href="/concierge-planning"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-brand-700 font-semibold rounded-xl hover:bg-brand-50 transition-colors text-lg"
          >
            Plan With Me
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsletterSignup variant="hero" />
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Verify no deal references remain**

Run: `grep -niE "deal|DealCard" src/app/\(site\)/page.tsx`
Expected: no output.

- [ ] **Step 3: Typecheck + commit**

```bash
npx tsc --noEmit
git add "src/app/(site)/page.tsx"
git commit -m "feat: reframe homepage to guides-first + concierge band"
```

---

### Task 6: Concierge page stopgap (remove deal-based free path)

**Files:**
- Modify: `src/app/(landing)/concierge-planning/page.tsx`

**Interfaces:**
- Consumes: `ConciergePlanningForm` (the $99 path). Removes any deal/DealCard import and the free-path column.

- [ ] **Step 1: Remove deal imports + the free-path column**

Grep: `grep -n "deal\|Deal\|Free\|free" "src/app/(landing)/concierge-planning/page.tsx"`. Remove the import of any deal helper/`DealCard`, and delete the "FREE PATH" column JSX block (the free/deal card). Keep the `$99` paid column and the `ConciergePlanningForm`. Update the intro line that says "Browse a curated package and book it free, or hire me..." to: "Plan and book your trip with me. Custom itineraries available."

- [ ] **Step 2: Verify**

Run: `grep -niE "/deals|DealCard|getDeal" "src/app/(landing)/concierge-planning/page.tsx"`
Expected: no output.

- [ ] **Step 3: Typecheck + commit**

```bash
npx tsc --noEmit
git add "src/app/(landing)/concierge-planning/page.tsx"
git commit -m "feat: concierge page stopgap, drop deal-based free path"
```

---

### Task 7: Delete the deals route tree, UI, data, and API

**Files:**
- Delete: `src/app/(site)/deals/` (whole tree), `src/components/ui/DealCard.tsx`, `src/components/ui/ClaimOfferForm.tsx`, `src/data/deals.ts`, `src/app/api/ghl/claim-offer/route.ts`

- [ ] **Step 1: Delete the files**

```bash
git rm -r "src/app/(site)/deals" src/components/ui/DealCard.tsx src/components/ui/ClaimOfferForm.tsx src/data/deals.ts src/app/api/ghl/claim-offer/route.ts
```

- [ ] **Step 2: Typecheck to surface every remaining importer**

Run: `npx tsc --noEmit`
Expected: errors listing files that still import the deleted modules (about page, contact, legal pages, quote, newsletter, rss, revalidate, welcome-sequence, etc.). This list drives Step 3.

- [ ] **Step 3: Remove dead deal imports/usages from each flagged file**

For each file the typecheck flags, remove the deal import and any JSX/logic that used it. These are incidental (footer link lists, type-only imports, a `getAllDeals` call for a count). Do not add new features; just delete the dead references. Common ones: `src/app/(site)/about/page.tsx`, `contact/page.tsx`, `legal/*`, `(landing)/quote/page.tsx`, `newsletter/page.tsx`, `api/rss/route.ts`, `api/revalidate/route.ts`, `lib/email/welcome-sequence.ts`, `components/ui/NewsletterSignup.tsx`, `components/ui/EmailPopup.tsx`.

- [ ] **Step 4: Re-run typecheck until clean**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: delete deals routes, UI, data, and claim-offer API"
```

---

### Task 8: Remove deal schema registration + DestinationCard dealCount + deal queries/types

**Files:**
- Modify: `src/sanity/schemas/index.ts`, `src/components/ui/DestinationCard.tsx`, `src/sanity/lib/queries.ts`, `src/sanity/lib/fetch.ts`, `src/types/index.ts`

**Interfaces:**
- Produces: a schema list without `deal`; destination UI/query without `dealCount`.

- [ ] **Step 1: Unregister the `deal` schema**

In `src/sanity/schemas/index.ts`, remove `import deal from './deal';` and remove `deal` from the `schemaTypes` array. Leave `deal.ts` on disk (non-destructive; the type is simply not registered). Result:

```ts
import destination from './destination';
import category from './category';
import blogPost from './blogPost';
import blogCategory from './blogCategory';
import blogTag from './blogTag';

export const schemaTypes = [destination, category, blogPost, blogCategory, blogTag];
```

- [ ] **Step 2: Remove `dealCount` from DestinationCard**

Grep: `grep -n "dealCount" src/components/ui/DestinationCard.tsx`. Remove the JSX that renders `destination.dealCount` (e.g. a "N deals" badge/line). If the card becomes visually sparse, leave it; do not redesign here.

- [ ] **Step 3: Remove deal queries + fetch helpers + Deal type + dealCount fields**

- In `src/sanity/lib/queries.ts`: delete `dealProjection`, `dealBySlugQuery`, `dealsByCategoryQuery`, and any other deal query; remove `dealCount` from the destination and category projections.
- In `src/sanity/lib/fetch.ts`: delete `getFeaturedDeals`, `getAllDeals`, `getTimeshareDeals`, `getDealBySlug`, `getDealsByCategory`, and any deal helper.
- In `src/types/index.ts`: delete the `Deal` interface and remove `dealCount` from the `Destination` and category interfaces.

- [ ] **Step 4: Typecheck until clean**

Run: `npx tsc --noEmit`
Expected: exit 0 (fix any newly surfaced references the same way — delete dead usage).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: unregister deal schema, drop dealCount + deal queries/types"
```

---

### Task 9: Full-site verification

**Files:** none (verification only)

- [ ] **Step 1: Production build**

Run: `npm run build`
Expected: build succeeds, no type errors, no missing-module errors. Note any `/deals` route in the output (there should be none).

- [ ] **Step 2: No stray deal references in shipped code**

Run: `grep -rniE "/deals|DealCard|getFeaturedDeals|getAllDeals|getTimeshareDeals|ClaimOfferForm" src/ | grep -viE "node_modules|schemas/deal.ts|deal.ts:"`
Expected: no output (the only allowed remaining file is the unregistered `src/sanity/schemas/deal.ts` on disk).

- [ ] **Step 3: Redirect + render smoke test (dev server)**

Start `npm run dev`, then:
```bash
for u in /deals /deals/all-inclusive /deals/all-inclusive/anything; do
  curl -s -o /dev/null -w "%{http_code} $u\n" "http://localhost:3000$u"; done
curl -s -o /dev/null -w "%{http_code} home\n" http://localhost:3000/
curl -s -o /dev/null -w "%{http_code} blog\n" http://localhost:3000/blog
curl -s -o /dev/null -w "%{http_code} concierge\n" http://localhost:3000/concierge-planning
```
Expected: deal URLs return a redirect (3xx), home/blog/concierge return 200. Stop dev server.

- [ ] **Step 4: Blog link audit**

Run: `node scripts/repoint-deals-links.mjs` (dry)
Expected: `0 links across 0 posts`.

- [ ] **Step 5: Final commit (if any verification fixups were needed)**

```bash
git add -A
git commit -m "chore: verify deals removal, redirects, and reframed IA" --allow-empty
```

---

## Self-Review

- **Spec coverage:** routes deleted + redirected (T1, T7), nav reframed (T2), footer (T3), homepage (T5), blog links repointed (T4), schema/types/queries/DestinationCard (T8), claim-offer removed (T7), concierge stopgap (T6), verification incl. isolation of `/go` links untouched (T4, T9). All spec sections covered.
- **Placeholder scan:** no "TBD"/"handle edge cases"; each step has exact code or an exact grep/curl. The homepage code is complete. Dead-import sweep (T7 S3, T8 S4) is intentionally typecheck-driven because the exact set is only knowable after deletion — the gate (tsc exit 0) is concrete.
- **Type consistency:** `getAllDestinations`/`getRecentBlogPosts` reused from existing fetch module; `DestinationCard`/`BlogCard`/`NewsletterSignup`/`SectionHeader` are existing components; homepage drops all deal symbols.
- **Non-destructive:** `deal.ts` schema file left on disk; 27 Sanity docs untouched; `/go` links untouched.
