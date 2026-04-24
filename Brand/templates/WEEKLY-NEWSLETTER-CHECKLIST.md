# Weekly Newsletter Plug-and-Play Checklist

Two newsletters per week. Both pasted into Beehiiv as HTML blocks.

---

## Monday — Boarding Pass *(content newsletter)*

Editorial newsletter: editor's letter, featured story, 2–3 short news bites, tip of the week, ONE highlighted deal at the bottom.

**Template:** `boarding-pass-beehiiv.html`
**Subject formula:** `{issue_headline}` (or hook from featured story)
**Preview formula:** First sentence of editor's letter

### Fill-in fields

**Top:**
| Placeholder | Example |
|---|---|
| `{{issue_label}}` | ISSUE 18 · APR 21 |
| `{{issue_headline}}` | The week Caribbean fares dropped 22%. |
| `{{editors_letter_paragraph_1}}` | Quick context for the week — what we noticed, what's interesting. |
| `{{editors_letter_paragraph_2}}` | Bridge into the rest of the issue. |

**Featured story:**
| `{{featured_image_url}}` `{{featured_headline}}` `{{featured_dek}}` `{{featured_url}}` |

**Shorts (2–3 cards — delete short #3 block if only 2):**
| `{{short_N_category}}` (e.g. "AIRLINE NEWS", "RESORT OPENING") |
| `{{short_N_headline}}` `{{short_N_body}}` `{{short_N_url}}` |

**Tip of the week:**
| `{{tip_headline}}` `{{tip_body}}` |

**Deal of the week (single, highlighted):**
| `{{deal_destination}}` (uppercase) `{{deal_nights}}` `{{deal_resort}}` `{{deal_price}}` `{{deal_one_liner}}` `{{deal_image_url}}` `{{deal_url}}` |

---

## Thursday — Deal Alert

**Template:** `deal-alert-beehiiv.html`
**Subject formula:** `Is the ${price} {resort_short_name} deal worth it?`
**Preview formula:** First 5–8 words of `{{verdict_one_liner}}`

### Fill-in fields

| Placeholder | Example |
|---|---|
| `{{destination}}` | CANCUN |
| `{{resort_name}}` | Grand Palladium |
| `{{resort_short_name}}` | Grand Palladium |
| `{{price}}` | 487 |
| `{{retail_price}}` | 899 |
| `{{savings}}` | 412 |
| `{{verdict_one_liner}}` | Yes — but skip the flights. |
| `{{hero_image_url}}` | https://images.unsplash.com/photo-XXXX?w=1600 |
| `{{book_url}}` | https://vacationpro.co/deals/cancun-grand-palladium |

What we checked (4 bullets): `{{checked_1..4}}`
Included (4): `{{included_1..4}}`
Not included (4): `{{excluded_1..4}}`
The catch: `{{catch_headline}}` + `{{catch_explanation}}`
Our take (2 paragraphs): `{{take_paragraph_1}}`, `{{take_paragraph_2}}`

---

## Workflow

1. Duplicate the template file → `boarding-pass-YYYY-MM-DD.html` in `Outbox/Newsletters/`
2. Find/replace every `{{placeholder}}` (use editor's multi-cursor)
3. Open Beehiiv → New Post → HTML block → paste
4. Set subject + preview text
5. Send test to brendan@vacationpro.co
6. Schedule (Mondays 8am ET for Boarding Pass, Thursdays 10am ET for Deal Alert)

## Brand rules (per Brand/foundations/)

- ✅ Inter only (already inline in template)
- ✅ Hero Green `#4ac850` for CTAs/prices, Forest `#0f2e1a` for headlines/body
- ✅ Cream `#fff8ec` background (Beehiiv handles), white cards inside
- ❌ Coral `#ef4444` only for "you save" delta and ✗ NOT INCLUDED — never else
- Image URLs: prefer Unsplash for free, or upload to Beehiiv's media library and use that URL
