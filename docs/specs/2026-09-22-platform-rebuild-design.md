# VacationPro Platform Rebuild: Design

**Date:** 2026-09-22
**Status:** Awaiting review
**Source brief:** Brendan's "Platform Transformation Master Build Prompt" (sections 1 to 16; the brief was truncated mid-section-16)

## Summary

The brief reads as a platform build. The audit says otherwise: roughly half of
what it describes already exists and works. The genuinely new surface is the
deals hub, the deal-to-trip bridge, and the homepage. The genuine bottleneck is
content, not code.

This document records what exists, what is new, and what must be true before
any of it matters.

## What already exists

Audited 2026-09-22 against the live codebase and Sanity dataset.

| Brief section | Reality |
|---|---|
| 13, 14 Find My Vacation quiz | **Built.** `/quiz` with 7 screens: Party, Origin, Dates, Sliders, Styles, Vibes, Destination |
| 15, 16 Matching | **Built.** `@vacationpro/engine` with `match/score`, `match/destinations`, `match/resort` |
| 14 party-specific option reordering | **Built.** `quiz/variants` |
| 12 Trip object | **Built.** `trips` table in Supabase, `Trip` has party, vibes, dealbreakers, budget_band, dates, destination_slug, resort_slug, checklist |
| Trip routes | **Built.** `/trips`, `/trips/[id]`, `/trips/[id]/resort` |
| Accounts | **Built.** Supabase auth, magic link and OAuth, at `/auth/signin` |
| Payments | **Built.** Stripe concierge checkout (out of scope for this phase) |
| Destination pages | **Built.** `/destinations/[slug]` |
| Deal content model | **Built.** `deal.ts` has 40+ fields including editorialNotes, whatsIncluded, savings, faq, flags |

The engine's type system already encodes the brief's quiz options exactly:
`Party`, `Vibe` (19), `ResortStyle` (7), `Dealbreaker` (10), `BudgetBand`,
`Season`. Rebuilding any of this would be a rewrite of working software.

## What is actually new

1. `/deals` hub and `/deals/[slug]` detail.
2. "Customize This Trip": converting a deal into a Trip.
3. Homepage and navigation transformation.
4. Route migration to the brief's URLs.
5. Resort images, and a provenance model for them.

## The bottleneck: content, not code

Three numbers decide this project.

- **0 resorts.** `resort.ts` exists and `match/resort` scores resorts, but the
  dataset is empty. The matching engine has nothing to match against. Nothing
  in the Find My Vacation flow can produce a real recommendation until this is
  fixed.
- **4 deals.** Down from 27 after the 2026-09-22 purge (16 carried the dead
  Tristar partner and `isTimeshare`, 5 expired, 2 sat on deleted
  destinations). All four are Mexico. There are zero Caribbean deals on a site
  whose stated focus is the Caribbean.
- **5 destinations.** Aruba, Cabo San Lucas, Cancun, Jamaica, Punta Cana. The
  target is all of the Caribbean and Mexico, roughly 25 to 30.

Two of the four surviving deals (`puerto-vallarta`, `punta-mita`) reference
destinations that do not exist as documents.

No amount of engineering changes these numbers. They are the critical path.

## Decisions

### Routes: migrate with redirects

`/quiz` becomes `/plan`, `/trips/[id]` becomes `/trip/[id]`. Every old URL gets
a 301. The brief's section 3 forbids breaking inbound links, and these routes
are live.

**Blocker to remove first:** `next.config.ts` still carries redirect rules from
the July 2026 catalog removal sending `/deals` to `/` and `/deals/*` to
`/destinations`. The new hub is unreachable until those four rules are deleted.
This is the single most likely thing to waste a day.

### Deal model: extend, do not replace

The brief proposes a `VacationDeal` interface. The existing Sanity `deal`
schema already covers most of it. Extend rather than replace, so the four
surviving deals stay valid.

Fields to add: `resortName`, `resortSlug`, `departureAirport`, `nights`
(numeric; `duration` is a display string), `includesFlight`, `pricePerPerson`
vs `totalPrice` (the current `price` is ambiguous and one deal's disclaimer
warns it is per room, not per person), `currency`, structured `travelWindow`,
`bookingDeadline`, `vacationProScore` with sub-scores, `highlights`.

Fields to drop: `isTimeshare`, and `provider` values referencing dead partners.

### Images: Travelpayouts baseline, supplier libraries for Picks

Stay22 is link monetization (Nova, Allez, map widget). It does not supply
imagery, so it cannot be the image source.

- **Baseline:** Travelpayouts / Hotellook API, fetched by script, so adding a
  deal daily does not mean hunting for a photo.
- **Featured:** supplier media libraries via Fora advisor standing, for the
  handful shown as VacationPro Picks.

`resort.ts` already has `heroImageUrl`. What it lacks is a gallery and any
record of provenance. Add both, storing source, licence and attribution
alongside every image, because photos will arrive from Travelpayouts, supplier
libraries and creators under different rights, and in six months nobody will
remember which is which.

All four surviving deals use Unsplash stock. With a four-deal catalog, every
one is a shop window, and stock photography contradicts "handpicked trips we'd
book ourselves."

### Out of scope

- Payments and the membership tier. The brief is explicit, and Stripe already
  exists for concierge.
- Live pricing integrations.
- Rebuilding the quiz, the match engine, or the Trip object.

## Risks

1. **Content, not code, gates launch.** A perfect `/deals` hub over four deals
   is an empty shop. Sourcing deals and writing resorts must start before, not
   after, the engineering.
2. **The 135 blog posts are the SEO moat.** Route migration must not touch
   them. Every change needs redirect coverage and a sitemap check.
3. **The deals catalog was deliberately removed in July 2026** in favour of
   guides plus concierge. This rebuild reverses that. The commits record no
   reason for the original removal, so the failure mode that prompted it is
   unknown and may recur.
4. **Zero resorts makes the match engine decorative.** The quiz can run and
   produce nothing useful. Resort content is the highest-leverage work in this
   project.

## Sequence

Content work runs in parallel throughout and gates everything.

1. **Unblock deals.** Remove the stale `/deals` redirects; extend the deal
   schema; fix the two orphaned destination references.
2. **Image pipeline.** Travelpayouts fetch script, resort image field with
   provenance, replace the four Unsplash heroes.
3. **Deals hub and detail.** `/deals`, `/deals/[slug]`, filters, VacationPro
   Score presentation as clearly editorial.
4. **Deal to Trip.** "Customize This Trip" prefills a Trip from a deal. The
   most valuable part of the brief, and the connective tissue it describes.
5. **Route migration.** `/quiz` to `/plan`, `/trips` to `/trip`, with 301s and
   sitemap verification.
6. **Homepage and navigation.**

## Open questions

- The brief was truncated mid-section-16. Sections beyond that are unknown.
- Who sources deals daily, and from which programs?
- Who writes resort content, and at what rate? This sets the launch date more
  than any engineering estimate.
