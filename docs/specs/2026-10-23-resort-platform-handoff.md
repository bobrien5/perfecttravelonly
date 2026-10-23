# Resort platform v1: handoff

Branch `feat/resort-match-platform`. Not deployed to production.

## What it does

Social post or search, then `/quiz`, then up to three resort picks, then `/compare`, then either "Check Rates & Book Online" (Stay22 allez) or "Get a Quote from Brendan" (`/concierge-planning`). The quote is stored in `quote_requests` and managed at `/admin/quotes`.

Recommendations, comparisons, booking links and quotes need no account and no Vault membership.

## Where things live

| Piece | Location |
| --- | --- |
| Matcher, budget estimate, quiz state machine | `packages/engine/src/resort/` (pure, deterministic, no AI) |
| Resort catalog (generated, committed, server only) | `src/data/resorts/catalog.generated.json`, `src/data/resorts/destinations.generated.json` |
| Catalog inputs | `scripts/seed-resorts-data.mjs` (editorial), `data/resort-facts.json` (facts, sources), `data/resort-sheet.json` (the community sheet's factual columns, no prices) and `data/resort-sheet-extract.json` (which sheet row is which researched resort) |
| Refresh the sheet, then rebuild | `node scripts/import-resort-sheet.mjs` then `node scripts/build-resort-catalog.mjs` |
| Matching API (server) | `src/app/api/recommendations/`, `src/lib/resorts/recommend.ts` |
| Quiz UI | `src/app/quiz/resort/` (legacy wizard still handles `/quiz?claim=1`) |
| Resort pages, comparison | `src/app/(site)/resorts/`, `src/app/(site)/compare/` |
| Quote form, API, storage, emails | `src/components/quote/`, `src/app/api/quote-requests/`, `src/lib/quote/` |
| Admin | `src/app/(admin)/admin/quotes/` |
| Analytics | `src/lib/analytics/journey.ts` |
| Migration | `sql/quote_requests.sql` |

## Catalog rules

- 773 records, 672 active, across 36 destinations in Mexico and the Caribbean (Cuba, Haiti, Central and South America excluded).
- 32 are researched by VacationPro: facts checked against official resort sites on 2026-10-23, editorial ratings from the existing resort database. The other 741 come from the community "All Inclusive Resort Ratings" sheet Brendan shared.
- Sheet resorts use only the sheet's facts: adults-only or family, couples-only, minimum ages, max people per room, airport and transfer time, room count, amenities, room types, its beach, food, romance and party tags, hotel class, and its average guest rating. Its prices are not imported or used.
- Ratings for sheet resorts are derived from those fields and labeled "community resort guide", never as VacationPro's. Price range for sheet resorts is estimated from hotel class, or unknown.
- Guest ratings (average of TripAdvisor, Google, Costco and Expedia, compiled by the sheet) are a capped ranking signal and are shown with their source. Ratings the sheet flags for suspected manipulation are ignored.
- Hidden from matching: closed, not yet open, not all-inclusive, and clothing-optional resorts (Brendan can still quote them).
- Sheet resort pages are `noindex` and left out of the sitemap until reviewed. Researched resort pages are indexed.
- Results show up to three picks: best overall, then best value or worth the upgrade when prices justify it, otherwise "also a strong fit" for close runners-up only.
- No resort photos and no "visited" status yet.

## Configuration

| Variable | Purpose | Default |
| --- | --- | --- |
| `ADVISOR_NOTIFICATION_EMAIL` | Where new-quote emails go | none (advisor email skipped) |
| `NEXT_PUBLIC_QUOTE_RESPONSE_COPY` | Response-time line after a request | "Brendan will reply by email with next steps." |
| `ADVISOR_COMMISSION_RATE` | Default expected-commission rate | `0.12` |
| `QUOTE_IP_SALT` | Salt for hashed IPs (rate limiting) | falls back to `JWT_SECRET` |

Existing variables used: `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `GHL_API_TOKEN`, `GHL_LOCATION_ID`, `BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `ADMIN_PASSWORD_HASH`.

## Launch steps

1. Run `sql/quote_requests.sql` in the Supabase SQL editor. It is additive and safe to run twice. Until it runs, quote submissions return an honest "could not save" error.
2. Set `ADVISOR_NOTIFICATION_EMAIL` in Production. Confirm `SENDGRID_API_KEY` is set there (it is missing from Preview).
3. Decide the response-time copy and set `NEXT_PUBLIC_QUOTE_RESPONSE_COPY` if you want a timeframe.
4. Merge, then check `/quiz`, a quote submission and `/admin/quotes` on production.

## Decisions for Brendan

- **Vacation Vault.** Booking links and quotes are now free for everyone. Members keep the exact deal dates, editorial notes and deal FAQ, and billing is untouched. The Vault page copy was corrected so it no longer sells free features. Decide whether to keep selling the Vault.
- **Public bio.** Pages say "Brendan O'Brien, VacationPro's founder, an independent travel advisor with Fora". Confirm you are happy with this wording, and add an approved photo if you want one.
- **Legacy concierge.** The $99 Stripe checkout route, `ConciergePlanningForm` and `/api/ghl/concierge-intake` are unlinked but kept for existing payments.
