# Beehiiv Welcome Series — Manual Setup

The 5 welcome emails are ready in this folder. Beehiiv's API can't build the automation for you, so this is the manual handoff. ~5 minutes.

## Why Beehiiv (not SendGrid)
SendGrid version is still live as a fallback (automation `feb7b198-fa22-4bd8-813b-48c56af99fe8`, draft status, do not activate). This Beehiiv version becomes primary for new signups going forward.

## Files
| File | Subject | Send Timing |
|------|---------|-------------|
| `01-welcome.html` | Welcome to VacationPro | Immediately on signup |
| `02-how-we-check.html` | The 3 things we check on every deal | +2 days |
| `03-case-study.html` | A deal we almost passed on | +5 days |
| `04-segment.html` | What kind of traveler are you? | +8 days |
| `05-feedback.html` | How are we doing? | +12 days |

Logo is embedded as base64 in each HTML file — no asset hosting needed.

## Setup steps in Beehiiv

1. Go to **Automations** in Beehiiv
2. Open the existing draft **"New Automation (1)"** (id `aut_150ba494-31ad-4b8f-aa0e-c65d432c1c5d`) — it already has the **signup** trigger
   - Or delete it and start fresh; just confirm trigger = `On signup`
3. Add **5 email steps** with these delays and subjects:
   - Email 1 — `Send immediately` (day 0) — subject: *Welcome to VacationPro*
   - Email 2 — `Wait 3 days` (day 3) — subject: *The 3 things we check on every deal*
   - Email 3 — `Wait 4 days` (day 7) — subject: *A deal we almost passed on*
   - Email 4 — `Wait 3 days` (day 10) — subject: *What kind of traveler are you?*
   - Email 5 — `Wait 4 days` (day 14) — subject: *How are we doing?*
4. For each email step:
   - Use **HTML editor** (not markdown blocks)
   - Paste the corresponding `.html` file's full contents
   - Sender: `brendan@vacationpro.co`
5. Send a test from email 1 — verify logo + brand
6. **Publish** the automation

## After publishing

- New signups via your website form auto-enroll (because trigger = signup)
- The existing 4,364 subs will NOT be enrolled (they signed up before the automation was published — Beehiiv only triggers on new events)
- If you want to backfill the 1,559 highly-engaged subs, change trigger to "Add by API" and tell me — I'll enroll them via Beehiiv's `/automations/{id}/journeys` POST endpoint

## Cleaning up the others

You also have two stale automations in Beehiiv:
- `aut_6e647d7c-a8c7-48d3-af52-7f4090c40e64` — "New Automation" — status `finishing` (in process of shutdown)
- `aut_01a472da-019d-41dc-82c9-e8d3485a0d0a` — "Unsubsribe Inactives" — draft

Delete or archive them in the dashboard once the new welcome series is live.
