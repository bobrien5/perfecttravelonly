# Typography — Inter Only

VacationPro uses **Inter** for every character in every asset. No other typefaces. Ever.

Inter is free, available on Google Fonts, and supported everywhere (web, email clients that accept web fonts, print PDFs).

## Weights Used

- **Inter 500** (Medium) — body text
- **Inter 700** (Bold) — section headings, eyebrow labels
- **Inter 800** (ExtraBold) — H1s, major headlines
- **Inter 900** (Black) — display type, prices

Never use Regular (400) or Light (300) — they feel underwhelming at small sizes.

## Type Scale

| Role | Weight | Desktop | Mobile | Tracking | Line-height |
|------|--------|---------|--------|----------|-------------|
| Display | 900 | 48-72px | 32-40px | -0.03em | 1.0 |
| H1 | 800 | 32-40px | 28-32px | -0.02em | 1.15 |
| H2 | 700 | 22-28px | 20-24px | -0.01em | 1.2 |
| H3 | 700 | 18-20px | 16-18px | 0 | 1.3 |
| Body | 500 | 16px | 16px | 0 | 1.5 |
| Small | 500 | 14px | 14px | 0 | 1.5 |
| Eyebrow | 700 | 11px | 11px | 2px (uppercase) | 1 |
| Prices | 900 | 48-120px | 36-64px | -0.03em (tabular) | 1.0 |

## Tabular Figures for Prices

Prices must use tabular (monospace) numerals so columns align:

```css
font-variant-numeric: tabular-nums;
/* or */
font-feature-settings: "tnum";
```

## Eyebrow Label Pattern

Every piece of content has an eyebrow label top-left. Example:

```
DEAL DROP · CANCUN · APR 14
```

CSS:

```css
font-family: Inter;
font-weight: 700;
font-size: 11px;
text-transform: uppercase;
letter-spacing: 2px;
color: #4ac850;
```

## Headline Rules

- **Max 8 words** on H1s.
- **No orphaned words** on display — tune line breaks manually.
- **Never ALL CAPS** on headlines (feels shouty). Eyebrow labels only.
- **Never italic** in Inter — the italic cut feels off-brand. Use weight/size for emphasis.

## Body Rules

- **Line-height 1.5** for all body at 16px.
- **Max 65 characters per line** for long-form (newsletters, guides).
- **Paragraph spacing:** 1em below each `<p>`.
- **Left-align** everything. No justified text, no center-aligned body.

## Common Mistakes

- Inter Regular (400) — use Medium (500) minimum.
- Letter-spacing on body — leave at 0 except for eyebrows and display.
- Mixing Inter with other sans-serifs — they clash.
- Using Inter italic — avoid.
- Shrinking display below 28px on mobile — bump to 32px min.
