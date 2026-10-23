# Resort platform v1: handoff

Branch `feat/resort-match-platform`. Not deployed to production.

## What it does

Social post or search, then `/quiz`, then up to three resort picks, then `/compare`, then either "Check Rates & Book Online" (Stay22 allez) or "Get a Quote from Brendan" (`/concierge-planning`). The quote is stored in `quote_requests` and managed at `/admin/quotes`.

Recommendations, comparisons, booking links and quotes need no account and no Vault membership.

## Where things live

| Piece | Location |
| --- | --- |
| Matcher, budget estimate, quiz state machine | `packages/engine/src/resort/` (pure, deterministic, no AI) |
| Resort catalog (generated, committed) | `packages/engine/src/resort/catalog.generated.ts` |
| Catalog inputs | `scripts/seed-resorts-data.mjs` (editorial), `data/resort-facts.json` (facts, sources), `data/resort-sheet-extract.json` (transfer times and room counts from the community sheet; its prices are not used) |
| Rebuild the catalog | `node scripts/build-resort-catalog.mjs` |
| Quiz UI | `src/app/quiz/resort/` (legacy wizard still handles `/quiz?claim=1`) |
| Resort pages, comparison | `src/app/(site)/resorts/`, `src/app/(site)/compare/` |
| Quote form, API, storage, emails | `src/components/quote/`, `src/app/api/quote-requests/`, `src/lib/quote/` |
| Admin | `src/app/(admin)/admin/quotes/` |
| Analytics | `src/lib/analytics/journey.ts` |
| Migration | `sql/quote_requests.sql` |

## Catalog rules

- 32 records, 28 active. Hidden: Hyatt Regency Aruba and Hilton Aruba Caribbean (not all-inclusive), Renaissance Wind Creek Aruba (all-inclusive is optional), and Hard Rock Hotel Cancun (closed for renovation, reopening reported for December 2026).
- Facts were checked against official resort and brand sites on 2026-10-23, with sources per resort. Unknown facts are `null` and display as "Not confirmed".
- Ratings (beach, food, pools, rooms, nightlife, value, family) come from the existing resort database seeded into Sanity in September 2026. They are labeled as VacationPro editorial ratings. Hyatt Vivid Cancun (formerly Dreams Vista) is unrated until re-reviewed.
- Mondrian Cancun's age policy is unknown: booking sites say adults-only, but official material does not publish a policy.
- The community "All Inclusive Resort Ratings" sheet supplies transfer times and room counts where official sources had none, credited on each resort. Its prices are not used (decided 2026-10-23), so price context is the editorial price tier, labeled as an estimate.
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
