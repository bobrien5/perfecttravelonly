import type { ResortRecord } from '@vacationpro/engine';
import DESTINATION_LIST from '@/data/resorts/destinations.generated.json';

/**
 * Browser-safe resort helpers: destination names and labels computed from a
 * record. Never imports the catalog itself (about 1MB), which stays on the
 * server in ./catalog.ts.
 */

export interface DestinationInfo {
  slug: string;
  name: string;
  country: string;
  /** Active resorts in the catalog. */
  count: number;
  /** Of those, researched by VacationPro. */
  researched: number;
}

export const DESTINATIONS: DestinationInfo[] = DESTINATION_LIST as DestinationInfo[];

const NAMES = new Map(DESTINATIONS.map((d) => [d.slug, d.name]));

export function destinationName(slug: string | null | undefined): string {
  if (!slug || slug === 'open') return 'Open to suggestions';
  return NAMES.get(slug) ?? slug;
}

/** Valid destination for quiz context: a known catalog slug, else null. */
export function normalizeDestination(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return NAMES.has(slug) ? slug : null;
}

/** Destinations grouped by country for the quiz and quote pickers, biggest first. */
export function destinationsByCountry(): { country: string; destinations: DestinationInfo[] }[] {
  const groups = new Map<string, DestinationInfo[]>();
  for (const d of DESTINATIONS) groups.set(d.country, [...(groups.get(d.country) ?? []), d]);
  return [...groups.entries()]
    .map(([country, destinations]) => ({ country, destinations }))
    .sort((a, b) => b.destinations.reduce((s, d) => s + d.count, 0) - a.destinations.reduce((s, d) => s + d.count, 0));
}

const DESTINATION_KEYWORDS: [RegExp, string][] = [
  [/riviera[- ]maya|tulum|playa[- ]del[- ]carmen|akumal|puerto[- ]morelos/i, 'riviera-maya'],
  [/cancun|playa[- ]mujeres|costa[- ]mujeres/i, 'cancun'],
  [/punta[- ]cana|cap[- ]cana|bavaro/i, 'punta-cana'],
  [/puerto[- ]plata/i, 'puerto-plata'],
  [/la[- ]romana|bayahibe/i, 'la-romana'],
  [/aruba/i, 'aruba'],
  [/montego[- ]bay/i, 'jamaica-montego-bay'],
  [/negril/i, 'jamaica-negril'],
  [/ocho[- ]rios|runaway[- ]bay/i, 'jamaica-ocho-rios'],
  [/cabo/i, 'cabo-san-lucas'],
  [/puerto[- ]vallarta|riviera[- ]nayarit|nuevo[- ]vallarta/i, 'puerto-vallarta'],
  [/st[- ]?lucia|saint[- ]lucia/i, 'saint-lucia'],
  [/barbados/i, 'barbados'],
  [/antigua/i, 'antigua'],
  [/turks[- ]and[- ]caicos|providenciales/i, 'turks-and-caicos'],
  [/bahamas|nassau|exuma/i, 'bahamas'],
  [/curacao/i, 'curacao'],
  [/cozumel/i, 'cozumel'],
];

/**
 * Destination context for an article, only when exactly one destination is
 * clearly named (e.g. in the slug). Multi-destination articles get none, so
 * the quiz is never pointed at the wrong place.
 */
export function inferDestinationSlug(text: string): string | null {
  const hits = new Set(DESTINATION_KEYWORDS.filter(([re]) => re.test(text)).map(([, slug]) => slug));
  return hits.size === 1 ? [...hits][0] : null;
}

/**
 * A resort's own photo, or null. There are no verified resort photos yet, and
 * the site's stock beach photos are not of specific places, so a missing
 * photo renders as a branded panel rather than a misleading image.
 */
export function resortImage(r: ResortRecord): { src: string; alt: string } | null {
  return r.images[0] ?? null;
}

export function transferLabel(r: ResortRecord): string | null {
  const t = r.transfer;
  if (!t) return null;
  if (!t.minutes) return `Nearest airport ${t.airport}, transfer time not confirmed`;
  const { min, max } = t.minutes;
  return max - min <= 5 ? `About ${max} min from ${t.airport}` : `About ${min} to ${max} min from ${t.airport}`;
}

export function ageLabel(r: ResortRecord): string {
  if (r.couplesOnly) return 'Couples only';
  if (r.adultsOnly === null) return 'Age policy not confirmed';
  if (r.adultsOnly) return r.minAge ? `Adults-only (${r.minAge}+)` : 'Adults-only (minimum age not published)';
  if (r.minAge) return `Guests ${r.minAge}+`;
  return 'Welcomes all ages';
}

export const PRICE_TIER_LABELS: Record<1 | 2 | 3, string> = {
  1: 'Lower price range',
  2: 'Mid price range',
  3: 'Upper price range',
};

/** Price context with no number: the estimated range and how it was estimated. */
export function priceRangeLabel(r: ResortRecord): string {
  if (r.priceTier === null) return 'No price information yet. Check current rates.';
  const basis = r.priceTierBasis === 'hotel-class' ? 'estimated from hotel class' : 'our estimate';
  return `${PRICE_TIER_LABELS[r.priceTier]} for the area (${basis}). Check current rates.`;
}

export function ratingSourceText(r: ResortRecord): string {
  return r.ratingSource === 'vacationpro'
    ? 'VacationPro editorial ratings'
    : 'Ratings derived from the community All Inclusive Resort Ratings guide (its beach, food, romance and party tags, amenities and hotel class)';
}
