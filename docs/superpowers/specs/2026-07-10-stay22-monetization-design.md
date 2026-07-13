# VacationPro Stay22 Monetization — Design

Date: 2026-07-10 (refreshed 2026-07-13 after Part 1 landed)
Status: Approved
Branch: `feat/stay22-monetization`

## Goal

Monetize VacationPro's guide/blog content with Stay22's affiliate suite, and retire
the existing Expedia/Partnerize (prf.hn) links in favor of Stay22. Keep Stay22 entirely
off the concierge/agent-booking funnel so it never cannibalizes an advisor booking.

## Context after Part 1

Part 1 (remove deals + reframe as guides) is complete. This changes two things here:

- The deals routes no longer exist, so they cannot leak Stay22. The exclusion list below
  drops them.
- **`/quote` now hosts the `ConciergePlanningForm`.** It is a live conversion page, so
  keeping Stay22 off it is now MORE important, not less. Same for `/concierge-planning`.

## Decisions (locked)

- **Overlap:** Go all-in on Stay22; retire Partnerize. Unwrap prf.hn CTAs back to their
  raw Expedia URLs so Stay22's LMA monetizes them.
- **Features:** All Stay22 products on — LMA (auto-monetize links), Spark (auto-insert
  affiliate links into guide text), Nova (AI intent popups), and embedded Maps.
- **Scope:** Guide/blog pages only. Never on concierge, quote, webinar, home, go, or studio.

## Stay22 account

- Product script: `https://scripts.stay22.com/letmeallez.js`
- `lmaID`: `6a4fa10b1b2dc574185e339d`
- This ID is a public, client-side identifier (visible in page source); it is not a secret.
- Nova/Spark/Maps are configured in the Stay22 Hub against this lmaID; the single
  `letmeallez.js` script activates whatever is enabled there.

## Architecture

### 1. Scope: where Stay22 loads

A `Stay22Scripts` component (client component using `next/script`, strategy
`afterInteractive`) that injects `letmeallez.js` with the lmaID param. It is rendered
ONLY by the guide routes:

- `(site)/blog/page.tsx` (blog index)
- `(site)/blog/[slug]/page.tsx` (blog posts)
- `(site)/destinations/[slug]/page.tsx` (destination guides)

It is NOT added to the root layout or the `(site)` layout, and must NOT appear on:

- `(landing)/concierge-planning/*` and `(landing)/quote` — BOTH render the concierge
  intake form. These are the money pages.
- `(site)/page.tsx` (home), `(site)/webinar`, `(site)/go`, `(studio)/*`, admin

Rationale: on the concierge pages the visitor should book through Brendan (advisor
commission), so Nova must not intercept them and send them to an OTA.

Implementation note: the injector Brendan supplied sets `window.Stay22.params = { lmaID }`
before loading the script. In `Stay22Scripts` we set the params via a small inline
`next/script` (strategy `beforeInteractive` is unnecessary; use an inline script that runs
before the external one) and then load `letmeallez.js`. Equivalent to the supplied snippet,
adapted to `next/script`.

### 2. Retire Partnerize (unwrap prf.hn CTAs)

A one-time migration script, `scripts/unwrap-partnerize-links.mjs`, that:

1. Fetches every published `blogPost` body from Sanity.
2. For each `link` markDef whose `href` matches
   `https://prf.hn/click/camref:<camref>/destination:<RAW_URL>`, rewrites `href` to the
   decoded `<RAW_URL>` (the raw Expedia hotel URL already embedded in the link).
3. Leaves the visible CTA text/buttons unchanged.
4. Runs dry-run by default; `--write` applies and reports counts per post.

Actual scope (measured 2026-07-13): **98 prf.hn links across 60 posts** (every published
post). There are currently **0** raw Expedia links and **0** other external links, so every
external link on the blog is a Partnerize link and every one gets unwrapped. After this,
every resort CTA points to a plain `expedia.com` URL, which Stay22 LMA auto-monetizes.

Because this rewrites links on every post, the script must be dry-run first and the diff
sanity-checked (count in == count out, host always `www.expedia.com`) before `--write`.

Also update the blog-writer brief (`skills/vacationpro-content-writer` and the Monday
brief) so new posts emit raw Expedia URLs, not prf.hn. The Partnerize
`reference_partnerize_expedia_links` memory is marked superseded for VacationPro.

Fallback: if verification shows LMA does not monetize a given raw Expedia link, the unwrap
is reversible from git + the destination is still a valid Expedia URL (reader-safe either
way).

### 3. Embedded maps

A reusable `Stay22Map` React component rendering the Stay22 map iframe for a given address.
The Stay22 map embed uses an `aid` (embed/associate ID) from the Stay22 Hub, which may
differ from the `lmaID`. It will be read from `NEXT_PUBLIC_STAY22_MAP_AID` (env), defaulting
to the `lmaID` if Stay22 confirms they are the same. Confirm the exact map embed ID/URL
format in the Hub during implementation.

```
<Stay22Map address="Punta Cana, Dominican Republic" checkin="..." checkout="..." />
```

Plus a Sanity PortableText block type `stay22Map` (fields: `address`, optional `checkin`/
`checkout`) so an editor can drop a map into any guide body. The blog `[slug]` PortableText
renderer gains a `types.stay22Map` serializer that renders `Stay22Map`.

Rollout: manually place maps in the top destination guides first (Punta Cana, Aruba,
Jamaica, Cancun, Turks & Caicos). Auto-injection by destination is explicitly out of scope
for this spec.

### 4. Verification

- LMA: load a blog post with an Expedia link; confirm a network request to
  `stay22.com`/`letmeallez` and that the outbound link is rewritten/monetized.
- Nova: confirm the intent popup fires on a guide page.
- Maps: confirm the iframe renders for a placed `stay22Map` block.
- Unwrap: re-run the link audit; confirm 0 remaining prf.hn hrefs, 98 raw Expedia hrefs,
  and no new 404s.
- **Isolation (critical):** load `/concierge-planning`, `/quote`, `/` (home), and `/webinar`;
  confirm ZERO Stay22 script tags and ZERO stay22.com network requests on each. A leak here
  means Nova can poach a concierge lead and send them to an OTA, which is the single
  highest-cost failure in this spec.

## Components / files

New:
- `src/components/monetization/Stay22Scripts.tsx` (client, next/script, guide pages only)
- `src/components/monetization/Stay22Map.tsx` (iframe map)
- `src/sanity/schemas/objects/stay22Map.ts` (PortableText block) + register in schema index
- `scripts/unwrap-partnerize-links.mjs` (migration, dry-run default)

Changed:
- `src/app/(site)/blog/page.tsx`, `.../blog/[slug]/page.tsx`,
  `.../destinations/[slug]/page.tsx` — render `<Stay22Scripts />`; blog `[slug]` adds the
  `stay22Map` PortableText serializer.
- Blog-writer brief/skill — raw Expedia URLs going forward.

Out of scope (later specs): the package/agent flow refinements; automatic map injection;
any change to the deals/concierge funnel.

## Risks

- LMA may not recognize some raw Expedia URL shapes → verify on a sample before unwrapping
  all; unwrap is git-reversible.
- Nova popups could feel aggressive → tunable in the Stay22 Hub post-launch, not a code change.
- Scope leak (Stay22 on a deal page) is the highest-impact failure → explicit isolation
  test in verification.
