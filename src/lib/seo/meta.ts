/**
 * Search snippet length limits. Google cuts titles around 60 to 65 characters
 * and descriptions around 155 to 165, so metadata is built to fit.
 */
export const TITLE_MAX = 65;
export const DESCRIPTION_MAX = 165;

const BRAND_SUFFIX = ' | VacationPro';

/**
 * Trim text to at most `max` characters, cutting on a word boundary and
 * dropping trailing punctuation so the result never ends mid-word.
 */
export function clampText(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max + 1);
  const lastSpace = cut.lastIndexOf(' ');
  const base = lastSpace > 0 ? cut.slice(0, lastSpace) : clean.slice(0, max);
  return base.replace(/[\s,;:.\-(]+$/, '');
}

/** First candidate that fits `max`, else the last candidate clamped. */
export function firstThatFits(candidates: string[], max: number): string {
  for (const c of candidates) {
    if (c.length <= max) return c;
  }
  return clampText(candidates[candidates.length - 1] ?? '', max);
}

/** Resort page title: the longest descriptive variant that fits TITLE_MAX. */
export function resortTitle(name: string): string {
  const variants = [
    `${name}: Who It Suits${BRAND_SUFFIX}`,
    `${name} Review${BRAND_SUFFIX}`,
    `${name}${BRAND_SUFFIX}`,
  ];
  const fit = variants.find((v) => v.length <= TITLE_MAX);
  if (fit) return fit;
  return `${clampText(name, TITLE_MAX - BRAND_SUFFIX.length)}${BRAND_SUFFIX}`;
}

/** Resort page description, capped at DESCRIPTION_MAX on a word boundary. */
export function resortDescription(name: string, destination: string, ageLabel: string): string {
  const core = `${name} in ${destination}: ${ageLabel}, strengths, tradeoffs and who should skip it, with sources.`;
  return firstThatFits([`${core} Book online or get a quote from Brendan.`, `${core} Book online or get a quote.`, core], DESCRIPTION_MAX);
}
