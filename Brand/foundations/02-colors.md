# Colors — Warm Beach Palette

All VacationPro communications use this 8-color palette. No substitutions, no "close enough" hex codes.

## Palette

| Token | Hex | CSS Variable | Usage |
|-------|-----|--------------|-------|
| **Hero Green** | `#4ac850` | `--color-brand-500` | CTAs, tags, price highlights, logo, eyebrow labels. **Never body text.** |
| **Forest** | `#0f2e1a` | `--color-forest` | Headlines, body text, dark backgrounds. |
| **Cream** | `#fff8ec` | `--color-cream` | Page and card backgrounds (alternative to white). |
| **Amber** | `#f59e0b` | `--color-accent-500` | "Limited" callouts, "VERIFIED" tags, highlight accents. |
| **Coral** | `#ef4444` | `--color-danger` | Urgency only: countdowns, price drops. Use sparingly. |
| **White** | `#ffffff` | `--color-white` | Card backgrounds, text on photos. |
| **Gray 500** | `#6b7280` | `--color-gray-500` | Secondary text, metadata, timestamps. |
| **Gray 200** | `#e5e7eb` | `--color-gray-200` | Borders, dividers, disabled states. |

## Green Scale (for UI states only)

| Shade | Hex | Use |
|-------|-----|-----|
| 50 | `#edfdf4` | Very light fill (hover on cream) |
| 100 | `#d1fae2` | Tag backgrounds |
| 200 | `#a6f4c8` | — |
| 300 | `#6beaa6` | — |
| 400 | `#33d87e` | Hover on #4ac850 |
| **500** | **`#4ac850`** | **Hero Green (primary brand)** |
| 600 | `#009b51` | Pressed state |
| 700 | `#007b41` | Dark-mode green |
| 800 | `#006135` | — |
| 900 | `#00502c` | Very dark accents |

## Usage Rules

### Hero Green (`#4ac850`)
- **Yes:** CTA buttons, price callouts, verified checkmarks, eyebrow labels, accent blocks, logo.
- **No:** Body text, large background fills (except hero carousel slide 1).

### Forest (`#0f2e1a`)
- **Yes:** All body text on cream/white backgrounds. All headlines.
- **No:** Backgrounds (too dark), CTAs.

### Cream (`#fff8ec`)
- **Yes:** Page backgrounds, card backgrounds, lower-third info panels on photos.
- **No:** Text (no contrast).

### Amber (`#f59e0b`)
- **Yes:** "VERIFIED" tags, "LIMITED" pill callouts, star ratings.
- **No:** CTAs (that's green's job), body text.

### Coral (`#ef4444`)
- **Yes:** Countdown timers, "-$412" price drop deltas, urgent alerts.
- **No:** Anything else. Coral is the scarcest color. If you're using it more than once per asset, you're using it wrong.

## Accessibility

All text must hit WCAG AA:
- Body text: 4.5:1 contrast ratio.
- Large text (18pt+ or 14pt bold+): 3:1.

### Passing combinations
- Forest (`#0f2e1a`) on cream/white ✓
- Forest on Hero Green for large text only ✓
- White on Forest ✓
- White on Hero Green for large text only ✓
- Gray 500 (`#6b7280`) on white for body ✓ (barely — avoid below 14px)

### Failing combinations (never use)
- Hero Green on cream/white for body text ✗
- Amber on white ✗
- Coral on cream for body ✗ (large only)

## Gradient Rules

Dark-photo overlays use a forest-to-transparent gradient:

```css
background: linear-gradient(180deg, rgba(15,46,26,0) 0%, rgba(15,46,26,0.75) 100%);
```

No other gradients. No rainbow backgrounds. No brand-green-to-amber fades.
