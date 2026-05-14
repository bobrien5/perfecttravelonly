# VacationPro Deal Engine Strategy

*Strategy doc. Created 2026-05-14. Models VacationPro's social and monetization engine on the Jane & Gigi (@jane.and.gigi) playbook, adapted to a hybrid lead-gen plus future booking-agency model.*

---

## 1. Background: the Jane & Gigi model

Jane & Gigi are two sisters who turned a travel content audience into a multi-stream travel business. Their flow:

**Content engine (top of funnel):** Short deal reels. One specific hotel or package, real pricing, real dates, "flights from major US airports starting at $X." Every post ends in a comment-keyword CTA ("Comment CANCUN"). High volume, deal-of-the-day cadence, seasonal tie-ins.

**Conversion mechanic:** The comment keyword triggers DM automation that delivers a booking link. The fine print does the work: deals must be booked through their agency, and a deposit secures the price. The deal is the hook; the booking runs through them, so they collect agency commission.

**Revenue stack (multiple streams off one audience):** agency commissions, concierge trip planning, a travel club membership, group trips (via TrovaTrip), digital products, and brand sponsorships.

The key lesson: they converted a content audience into a booking relationship, then layered more monetization on the same followers.

---

## 2. VacationPro positioning

**What VacationPro becomes:** A deal-discovery travel brand for Caribbean, beach, and tropical vacation packages. Narrower than Jane & Gigi (who post anything, anywhere), wide enough to cover all-inclusives, beach resorts, island getaways, and tropical packages. The wedge is the vibe and region: sun, sand, water, "I need to get to a beach."

**The moat:** Become the page people follow for real, bookable tropical deals. Defensibility is the content machine cadence plus the funnel, not a parent brand. VacationPro stands fully on its own.

**The promise to the follower:** "We find you a real beach or tropical package deal with real pricing, and we make booking it effortless."

**The relationship ladder (what a follower becomes):**
1. Watches a deal post
2. Comments the keyword, enters the funnel
3. Becomes a Tristar lead (today's money) or a booking contact (phase-2 money)
4. Eventually: travel club member, group trip traveler, or repeat booker

**Brand voice:** Unchanged. Existing VacationPro caption voice (45 words or fewer, "[Topic]... [reframe]" hook, "Comment DEALS and I'll send you..." CTA). The Jane & Gigi influence is format and funnel, not voice.

**What stays:** FB Creator monetization, newsletter ad revenue, Tristar lead-gen, brand sponsorships.

**What changes:** Carousels stop being the primary unit. The deal post (in three formats) becomes the core. Every post gets a comment-keyword funnel.

---

## 3. The hybrid model

VacationPro follows Jane & Gigi's content and funnel mechanics now, and builds toward their booking-agency revenue model as a phase 2.

- **Now:** Run the deal-post content machine. Monetize through the existing Tristar lead-gen model ($250 per qualified lead who attends a webinar), plus FB Creator revenue, newsletter ads, and sponsorships.
- **Phase 2:** Activate the host agency. The same funnel's landing page flips its CTA from "get pricing" (lead capture) to "reserve with deposit" (booking), and VacationPro collects booking commissions.

**Host agency: World Via Pro (secured).** Brendan has an existing relationship with World Via Pro: a 90/10 commission split (VacationPro keeps 90%) for a $29/month flat fee. This removes the host agency search as a dependency. Phase 2 is now an onboarding-and-activation step, not a search, so booking Go-Live can happen weeks earlier than originally planned.

The content format and the funnel automation are built now with zero dependency on the agency, and the agency is already in hand, so the full hybrid can come online fast.

---

## 4. The content machine

### Three core units, all built around one deal

1. **The deal reel.** Fast-cut video, hook plus price on screen, destination-specific comment-keyword CTA. For FB, TikTok, and IG Reels. 9:16.
2. **The deal carousel.** Slide 1 is the attention-grabbing destination photo plus price hook. Middle slides break down inclusions, dates, flight estimate, and resort shots. Last slide is the CTA. IG-favored right now, reusable on FB. 4:5.
3. **The deal static.** Single image, price plus destination hook baked in, CTA in caption. Fast to produce, good for filling cadence and quick deal drops. 4:5.

Same deal, same keyword, same caption voice across all three formats. Pick the format per deal, or run multiples.

### Aspect ratio

Everything is built to fit Instagram. Statics and carousels are 4:5. Reels are 9:16. 4:5 is the default canvas for the static and carousel templates.

### Format mix by platform

- **Instagram:** Carousels and statics heavy (ride the current algorithm), reels secondary.
- **Facebook:** All three formats. Keep the established 4x/day cadence.
- **TikTok:** Reels only. (Account live at @vacationpro.co.)

### Cadence

4 posts per day on Facebook at 8am, 12pm, 4pm, 8pm ET (minimum 4-hour gap), per the existing VacationPro posting rule.

- 2 to 3 deal posts per day (reel, carousel, or static). These are the money posts.
- 1 to 2 supporting posts per day (destination highlights, "is this resort worth it," travel news). These keep the feed from looking like pure ads and feed reach.

### Production system (weekly batch)

One weekly batch session produces a full week of deal posts, so nothing is posted day-of.

1. **Deal intake.** Pull the week's available deals into a deal sheet: destination, price, dates, keyword, source link.
2. **Brief generation.** Claude turns each deal into a reel script, carousel slide outline, or static layout, plus caption and keyword.
3. **Visuals.** Batch-generate or source resort and beach imagery via an API script (per the batched-image-generation rule), on the 4:5 canvas.
4. **Assembly.** Reels via the existing video pipeline. Carousels and statics via the templated 4:5 system. Real VacationPro logo (logo-white.svg) and price on frame or slide 1.
5. **Schedule.** Batch-schedule to FB, IG, and TikTok via Publer. Carousels go to both FB and IG.
6. **Funnel sync.** Register each keyword in the DM automation via the `vacationpro deal` CLI (see Section 5).

Full weekly-batch SOP lives in `vacationpro-weekly-batch-workflow.md`.

---

## 5. The funnel mechanics

This is the part that turns a view into money. Modeled on Jane & Gigi's comment-keyword to DM to link flow.

### The trigger

Every deal post has a destination-specific keyword (PUNTACANA, ARUBA, JAMAICA). When someone comments it:
- ManyChat detects the keyword (it covers FB and IG natively).
- It auto-replies to the comment publicly ("Sent you a DM!"). The public reply also boosts the post's engagement.
- It sends the commenter a DM with the deal link.

### The DM sequence

1. **DM 1:** "Here's the [destination] deal" plus the link plus a one-line qualifier ("What dates are you thinking?").
2. **DM 2 (if they reply):** Capture name and email, route them.
3. **Fallback:** A follow-up DM roughly 24 hours later if no reply.

### Where the link goes: the routing fork

The link points to a templated VacationPro landing page (one per deal, or one templated page with deal parameters) that does two jobs:
- **Today (lead-gen):** Captures email and basic info, producing a qualified Tristar lead ($250 when they attend the webinar). The page frames it as "get full pricing and book."
- **Phase 2 (booking agency):** Same page, CTA becomes "reserve with deposit" routed through the host agency, producing a booking commission.

The page is built once with swappable routing logic, so phase 1 to phase 2 is a config change, not a rebuild.

### Tracking

Every keyword, deal, and post gets a tag. The funnel reports: comments, DMs sent, link clicks, leads captured, Tristar webinars attended, revenue. This feeds the weekly analytics loop.

### TikTok caveat

TikTok's comment-to-DM automation is weaker than Meta's. There the CTA is "link in bio" plus a Beacons or Linktree-style page. Lower conversion, but TikTok is for reach; Meta is for conversion.

### Why ManyChat, not the native Meta API

Meta's Instagram Messaging API can technically do this (the Private Replies feature), but doing it natively requires a Meta app with messaging-permission app review and business verification, an always-on hosted webhook server, and self-managed handling of Meta's 24-hour messaging window. ManyChat exists precisely to absorb that complexity, and gets the funnel live in days. Native Meta API is a possible phase-2-plus optimization if ManyChat per-contact pricing becomes a real cost at scale.

The existing meta-ads MCP cannot run this funnel: it is ads-only (lead forms, video lead ads, campaign insights), with no comment-monitoring or messaging tools.

### The `vacationpro deal` CLI

ManyChat's API cannot create flows or keyword triggers programmatically (that is UI-only), but it can call external HTTP requests from inside a flow. So the architecture is:

**ManyChat side (one-time UI setup):**
- One universal "deal keyword" automation that triggers on any comment on any post.
- A single flow with a Dynamic Content block that calls a VacationPro endpoint, passing the commented keyword.
- The flow handles the public reply and DM delivery generically.

**VacationPro side (what gets built):**
- A **deal registry**: the keyword to deal to landing-page mapping (JSON file or the VacationPro DB). Source of truth.
- A tiny **dynamic-content endpoint** (one Vercel function) that ManyChat calls: given `JAMAICA`, it returns that deal's DM copy and link. Minimal infrastructure.
- The **`vacationpro deal` CLI**:
  - `vacationpro deal add` — register a deal: keyword, price, dates, landing page, DM copy.
  - `vacationpro deal sync` — take the week's deals from the batch deal sheet and register them all at once.
  - `vacationpro deal list` / `status` — see active keywords, check for collisions.

ManyChat is set up once. After that, every new deal is one CLI command, and `vacationpro deal sync` is step 6 of the weekly batch. The only remaining manual ManyChat touch is changing the flow logic itself (timing, sequence structure).

---

## 6. The revenue stack

Multiple streams off one audience, layered in over time.

| Stream | Phase | Notes |
|---|---|---|
| Tristar lead-gen ($250 per qualified lead) | Now | Existing. The deal funnel feeds it. |
| FB Creator monetization | Now | Existing. More reels means more eligible views. |
| Newsletter ad revenue | Now | Existing. The funnel captures emails and grows the list. |
| Brand sponsorships | Now, grows | Existing. Audience growth raises rates. |
| Booking commissions | Phase 2 | Via World Via Pro: 90/10 split (VacationPro keeps 90%), $29/month flat. Same funnel, "reserve with deposit" CTA. |
| Group trips | Phase 3 | TrovaTrip-style. Host tropical group trips, earn per traveler. |
| Travel club / membership | Phase 3 | Recurring revenue from the most engaged followers. |

### Optional parallel track: paid lead ads

The existing meta-ads MCP supports a separate paid acquisition path (`meta_create_lead_form`, `meta_create_video_lead_ad`, `meta_list_recent_leads`, `meta_subscribe_page_leadgen_webhook`). This is paid lead-gen ads with instant forms, a different mechanic from the organic comment funnel, but it feeds the same Tristar $250-per-lead model. Optional to spin up once the organic engine is proven.

---

## 7. Roadmap (Approach C: three parallel tracks, then converge)

### Track 1: Content machine (build now, no dependencies)

- Build the 4:5 carousel and static templates, and the reel format spec.
- Build the caption and keyword system.
- ~~Stand up a VacationPro TikTok account.~~ Done: @vacationpro.co.
- Run the first weekly batch and start posting deal content.

### Track 2: Funnel automation (build now, no dependencies)

- One-time: ManyChat universal flow plus Dynamic Content block setup on FB and IG.
- Build the deal registry plus the dynamic-content endpoint (Vercel function).
- Build the `vacationpro deal` CLI.
- Build the templated deal landing page with swappable lead-gen / booking routing.
- Wire tracking and analytics.

### Track 3: Host agency activation (secured, no search needed)

The host agency is already chosen: **World Via Pro**, 90/10 split, $29/month. This track is now onboarding, not research:

- Sign up with World Via Pro ($29/month), get portal access.
- Complete onboarding and booking-tool training.
- Confirm the booking and commission flow end to end.

### Convergence: "Go-Live"

- Real bookable inventory plugs into the proven format (Track 1) and the working funnel (Track 2).
- The landing page routing flips from lead-gen-only to lead-gen plus booking.
- Because there is no agency search, Go-Live can follow soft launch within ~2 weeks.
- Phase 3 streams (group trips, travel club) open once booking volume is steady.

### The analytics loop (ongoing)

Weekly pull of comments, DMs, clicks, leads, and revenue per deal and per destination, so deal selection and format mix get sharper every week.

---

## 8. Open items

- **Video pipeline choice:** Confirm which existing pipeline (Remotion, Hyperframes, or the Milo-style setup) is reused for deal reels.
- **TikTok account:** Resolved — live at @vacationpro.co.
- **Deal source:** World Via Pro is the host agency for bookings. Until onboarding completes, Week 1 soft-launches on curated public deals as content hooks; exclusive bookable inventory comes online with World Via Pro.

---

## 9. Next step

Each track becomes its own implementation plan. Recommended order to plan: Track 2 funnel automation (the `vacationpro deal` CLI, deal registry, endpoint, landing page), since it has the most build surface and no dependency, then Track 1 content templates.
