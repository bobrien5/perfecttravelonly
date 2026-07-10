# VacationPro Repositioning, Part 1: Remove Deals + Reframe as Tropical-Travel Guides

Date: 2026-07-10
Status: Approved (pending spec review)
Branch: `feat/stay22-monetization` (repositioning work; may split per piece)

## Context

VacationPro is pivoting from a vacation-**deals** catalog to a **tropical-travel guides**
destination with a **concierge booking** upsell. This is part 1 of a 3-part program:

1. **(this spec)** Remove the deals system and reframe the site IA around guides.
2. Stay22 monetization on guides (spec: `2026-07-10-stay22-monetization-design.md`).
3. Concierge two-tier upsell (free "book with me" + $99 deep-plan) — later spec.

Part 1 ships first so the site's shape is settled before monetization and the upsell land.

## Goal

Delete the deals catalog end to end, redirect its old URLs, and reframe the homepage, nav,
and footer around tropical-travel guides + a concierge CTA, without leaving broken links or
orphaned UI.

## Current state (surface to remove)

- Routes: `(site)/deals/[category]/page.tsx`, `(site)/deals/[category]/[slug]/page.tsx`
- Data/schema/UI: `src/data/deals.ts`, `src/sanity/schemas/deal.ts`, `src/components/ui/DealCard.tsx`,
  `src/components/ui/ClaimOfferForm.tsx`, deal queries in `src/sanity/lib/queries.ts`,
  deal fetch helpers in `src/sanity/lib/fetch.ts`, `Deal` type + `dealCount` in `src/types/index.ts`
- Nav: `Header.tsx` "Deals" dropdown (8 links); `Footer.tsx` deals column (7 links)
- Homepage: `(site)/page.tsx` is deals-first (featured deals, all deals, timeshare deals,
  "best vacation package deals on the internet")
- Destinations: `(site)/destinations/[slug]/page.tsx` + destination schema surface `dealCount`
- API: `src/app/api/ghl/claim-offer/route.ts` (deals-only intake)
- Content: ~89 `/deals` and `/go` references across 25 blog bodies (exact `/deals`-only
  count enumerated in the plan; `/go` affiliate links are handled in part 3, not here)
- Sanity: 27 `deal` documents (0 advisor packages)

## Design

### 1. Delete routes + 301 redirect old URLs

Remove the `(site)/deals` route tree. Add permanent redirects so indexed deal URLs do not
404: `/deals/:category/:slug` and `/deals/:category` → `/destinations` (the new guide hub),
`/deals` → `/`. Implement in `next.config` `redirects()` (301). Keep a short list; a catch-all
`/deals/:path*` → `/destinations` covers the tail.

### 2. Reframe navigation

- **Header:** replace the "Deals" dropdown with **Guides** (→ `/blog`) and **Destinations**
  (→ `/destinations`). Add a prominent **"Plan With Me"** CTA button (→ `/concierge-planning`).
  Keep Blog, About, Newsletter.
- **Footer:** replace the deals column with a **Guides/Destinations** column and a
  **Concierge** link. Update the newsletter blurb from "never miss a deal" to guide/travel-tips framing.

### 3. Reframe the homepage

Rewrite `(site)/page.tsx` from deals-first to guides-first:

- Hero: tropical-travel positioning (headline + subhead about guides to the best all-inclusive
  and tropical trips), primary CTA to guides, secondary CTA "Plan with me".
- Sections: **Featured guides** (recent/popular blog posts), **Destinations** grid (guide hubs),
  and a **concierge upsell band** (placeholder copy in part 1; the real two-tier component
  lands in part 3). Remove featured-deals, all-deals, and timeshare-deals sections and their
  `getFeaturedDeals/getAllDeals/getTimeshareDeals` calls.
- Metadata/OG copy updated from "best vacation package deals" to the guides positioning.

### 4. Remove deal data, schema, types, and UI

- Delete `DealCard.tsx`, `ClaimOfferForm.tsx`, `src/data/deals.ts`.
- Remove deal queries/fetch helpers and the `Deal` type; drop `dealCount` from destination/category
  types and queries and from the destinations page UI.
- Unregister the `deal` (and deal-only `category`, if unused elsewhere) schema from
  `src/sanity/schemas/index.ts`. **Non-destructive:** the 27 `deal` docs stay in the dataset
  (orphaned, reversible); a separate optional purge can delete them later once we're confident.
- Remove `/api/ghl/claim-offer`. Keep `/api/ghl/concierge-intake`.
- Sweep the incidental deal imports in about/contact/legal/quote/newsletter/rss/revalidate/
  welcome-sequence and remove dead references (many are type-only or footer/link imports).

### 5. Repoint blog internal links

Migration script `scripts/repoint-deals-links.mjs` (dry-run default, `--write`): for each
`link` markDef whose `href` starts with `/deals`, repoint to `/destinations/<slug>` when a
matching destination guide exists, else `/destinations`. Leaves `/go` affiliate links untouched
(part 3 handles those). Re-run the link audit after to confirm 0 `/deals` links and no new 404s.

### 6. Concierge page: stop the bleeding, don't rebuild yet

`concierge-planning/page.tsx` currently has a deals-based "free path." In part 1, remove the
deal dependency: keep the working **$99 paid path** and replace the free-path column with a
simple "free book-with-me, coming below" placeholder that points at the $99 form for now.
Part 3 builds the real free-booking tier. This keeps the page functional and deal-free in the
interim.

## Verification

- `npm run build` + typecheck clean (no dangling deal imports/types).
- Crawl/spot-check: `/deals`, `/deals/all-inclusive`, `/deals/all-inclusive/<slug>` all 301 to
  the right place (no 404).
- Header/Footer show Guides/Destinations/Concierge, no deal links anywhere.
- Homepage renders guides + destinations + concierge band; no deal sections; no console errors.
- Link audit: 0 `/deals` hrefs remain in blog bodies; no new 404s.
- Studio loads without the deal type; existing posts/destinations unaffected.

## Out of scope (other parts)

- Stay22 script/unwrap/maps (part 2).
- The real concierge two-tier upsell + reusable in-guide CTA component (part 3).
- Deleting the 27 orphaned deal docs (optional later cleanup).

## Risks

- **SEO:** deal URLs may have inbound links/rankings → 301s (not 404/410) preserve equity;
  redirect to the closest guide hub.
- **Dead imports:** deals are referenced in ~30 files → typecheck/build is the safety net;
  remove references file-by-file.
- **Intermediate concierge state:** part-1 concierge page is a stopgap; flagged so it is not
  mistaken for the final design.
