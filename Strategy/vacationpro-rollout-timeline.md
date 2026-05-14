# VacationPro Deal Engine: Rollout Timeline & Plan (Sprint)

> Sprint rollout of the VacationPro deal engine across the three tracks defined in `vacationpro-deal-engine-strategy.md`. Soft launch target: this week. Day 1 is 2026-05-14 (Thursday).

**Goal:** Take VacationPro from carousel-only posting to a live Jane & Gigi-style deal engine (deal-post content machine + comment-keyword funnel) within one week, then booking commissions within ~3 weeks.

**Approach:** Compressed sprint. Tracks 1 (content machine) and 2 (funnel automation) get built and launched in Week 1. Track 3 (host agency) is already secured (World Via Pro, 90/10 split, $29/month), so it is an onboarding step, not a search. Booking Go-Live follows soft launch by ~2 weeks.

---

## Timeline at a glance

| Phase | Window | Focus |
|---|---|---|
| Week 1: Build & Soft Launch | May 14 - May 20 | Build everything, first batch live |
| Week 2: Optimize + Agency onboarding | May 21 - May 27 | First analytics loop, onboard World Via Pro, build booking routing |
| Week 3: Booking Go-Live | May 28 - Jun 3 | Landing page flips to booking |
| Weeks 4+: Phase-3 streams | Jun 4 onward | Group trips, travel club |

**Critical path:** Nothing gates soft launch. World Via Pro onboarding gates the Week 3 booking Go-Live, and since it is a $29/month signup rather than a search, that risk is small.

---

## Week 1: Build & Soft Launch (May 14 - May 20)

### Day 1, Thu May 14: Setup blitz
- [x] Create the VacationPro TikTok account (bio, link, profile image) — done: @vacationpro.co
- [ ] Create a ManyChat account, connect VacationPro's Facebook page and Instagram
- [ ] Decide the video pipeline for deal reels (Remotion / Hyperframes / Milo-style), document it
- [ ] Pull 5-10 Jane & Gigi reference posts as format benchmarks
- [ ] Build the deal sheet (weekly intake spreadsheet) with the workflow SOP fields
- [ ] Track 3: sign up for World Via Pro ($29/month), start the onboarding process

### Day 2, Fri May 15: Content templates + funnel scaffolding
- [ ] Build the 4:5 carousel template
- [ ] Build the 4:5 static template
- [ ] Build or configure the 9:16 reel format in the chosen pipeline
- [ ] Build the deal registry (keyword to deal to landing-page mapping)
- [ ] Scaffold the dynamic-content endpoint (Vercel function)
- [ ] Scaffold the `vacationpro deal` CLI (`add`, `sync`, `list`, `status`)

### Day 3, Mon May 18: Finish the funnel
- [ ] Finish the `vacationpro deal` CLI
- [ ] Finish the dynamic-content endpoint
- [ ] Build the templated deal landing page (lead-gen routing mode active)
- [ ] Build the ManyChat universal "deal keyword" flow, wire the Dynamic Content block to the endpoint
- [ ] Wire funnel tracking tags (comments, DMs, clicks, leads)

### Day 4, Tue May 19: Produce the first batch + end-to-end test
- [ ] End-to-end test: comment a test keyword, confirm public reply, DM, link, landing page, email capture, Tristar routing
- [ ] Run the first full weekly batch per the workflow SOP (a full week of deal posts)
- [ ] Register all the batch's keywords via `vacationpro deal sync`

### Day 5, Wed May 20: Go live
- [ ] Schedule the batch to FB, IG, TikTok via Publer on the 4x/day cadence
- [ ] Funnel live: comment-keyword to DM to landing page to Tristar lead
- [ ] Begin daily monitoring (keyword collisions, DM failures, broken links)

**Week 1 exit criteria:** Deal content publishing, funnel converting real comments to real leads, TikTok account live, World Via Pro signup submitted.

---

## Week 2: Optimize + Agency Onboarding (May 21 - May 27)

- [ ] Daily monitoring continues through the first live week
- [ ] Run the first weekly analytics loop: comments, DMs, clicks, leads, webinars, revenue per deal
- [ ] Tune deal selection and format mix from the data
- [ ] A/B test hook styles, keywords, and DM copy
- [ ] Produce and schedule Week 2's batch
- [ ] **Track 3: complete World Via Pro onboarding (portal access, booking-tool training)**
- [ ] Build and test the booking-routing mode of the landing page (not yet switched on)
- [ ] Decide the split: which deals route to Tristar lead-gen vs World Via Pro booking

**Week 2 exit criteria:** Second batch live, first real funnel data in hand, World Via Pro onboarding complete, booking routing built and tested.

---

## Week 3: Booking Go-Live (May 28 - Jun 3)

- [ ] Flip the landing page routing from lead-gen-only to lead-gen plus booking
- [ ] Update DM copy and landing page CTA to "reserve with deposit" for bookable deals
- [ ] Test the first real bookings end-to-end through World Via Pro
- [ ] Add booking commission tracking to the weekly analytics loop
- [ ] Keep the weekly batch + analytics loop running

**Week 3 exit criteria:** Real bookings flowing through the funnel, commissions tracked, both monetization paths (Tristar lead-gen + World Via Pro booking) running.

---

## Weeks 4+: Phase-3 Streams (Jun 4 onward)

- [ ] Scope the first group trip (destination, dates, pricing, TrovaTrip-style platform)
- [ ] Promote the group trip through the deal-post engine
- [ ] Scope the travel club (membership tier, price, what members get, recurring billing)
- [ ] Soft-launch the travel club to the most engaged audience segment
- [ ] Evaluate the optional paid lead-ads track (meta-ads MCP)

---

## Ownership

| Track | Lead | Claude's role |
|---|---|---|
| Track 1: Content machine | Brendan | Template specs, weekly batch production, briefs, scripts |
| Track 2: Funnel automation | Brendan + Claude | Build the CLI, endpoint, registry, landing page |
| Track 3: World Via Pro onboarding | Brendan | Sign up, complete training, confirm booking flow |
| Weekly batch (ongoing) | Claude-run, Brendan-approved | Runs the 6-step SOP each week |
| Analytics loop (ongoing) | Claude-run | Weekly pull and recommendations |

---

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Sprint pace slips a build day | Soft launch can shift 1-2 days without affecting Track 3 or booking Go-Live |
| World Via Pro onboarding takes longer than a week | Weeks 1-2 lead-gen revenue is unaffected; only the Week 3 booking Go-Live moves |
| ManyChat per-contact cost grows with volume | Native Meta API is the documented phase-2+ fallback |
| Deal posts look like pure ads, reach drops | 1-2 supporting posts/day built into the cadence |
| Keyword collisions across active deals | `vacationpro deal list` collision check is step 1 of intake |
| No exclusive deal source before booking Go-Live | Week 1-2 soft-launches on curated public deals; bookable inventory comes online with World Via Pro |

---

## Next step

Track 2 (the `vacationpro deal` CLI, deal registry, dynamic-content endpoint, landing page) is the code-heavy work happening on Days 2-3. Its detailed TDD implementation plan is at `docs/plans/2026-05-14-deal-engine-funnel.md`. Tracks 1 and 3 run off this timeline's checklists.
