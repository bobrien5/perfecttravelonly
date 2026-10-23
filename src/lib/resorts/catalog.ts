import { RESORT_CATALOG, type CatalogDestination, type ResortRecord } from '@vacationpro/engine';

/**
 * App-side access to the resort catalog. The matcher itself lives in
 * @vacationpro/engine and takes the catalog as an argument; this module only
 * adds lookups and display helpers for pages.
 */

export const DESTINATION_NAMES: Record<string, string> = {
  aruba: 'Aruba',
  cancun: 'Cancun',
  'punta-cana': 'Punta Cana',
  'riviera-maya': 'Riviera Maya',
  'cabo-san-lucas': 'Cabo San Lucas',
  'jamaica-montego-bay': 'Montego Bay',
  'jamaica-negril': 'Negril',
};

export const DESTINATION_COUNTRY: Record<CatalogDestination, string> = {
  aruba: 'Aruba',
  cancun: 'Mexico',
  'punta-cana': 'Dominican Republic',
  'riviera-maya': 'Mexico',
};

/** Destinations offered in the quiz. Those without verified resorts lead to a quote. */
export const QUIZ_DESTINATIONS: { slug: string; name: string; hasResorts: boolean }[] = [
  { slug: 'cancun', name: 'Cancun', hasResorts: true },
  { slug: 'riviera-maya', name: 'Riviera Maya and Tulum', hasResorts: true },
  { slug: 'punta-cana', name: 'Punta Cana', hasResorts: true },
  { slug: 'aruba', name: 'Aruba', hasResorts: true },
  { slug: 'jamaica-montego-bay', name: 'Montego Bay, Jamaica', hasResorts: false },
  { slug: 'jamaica-negril', name: 'Negril, Jamaica', hasResorts: false },
  { slug: 'cabo-san-lucas', name: 'Cabo San Lucas', hasResorts: false },
];

export function destinationName(slug: string | null | undefined): string {
  if (!slug || slug === 'open') return 'Open to suggestions';
  return DESTINATION_NAMES[slug] ?? slug;
}

export const ACTIVE_RESORTS: ResortRecord[] = RESORT_CATALOG.filter((r) => r.status === 'active');

const BY_ID = new Map(RESORT_CATALOG.map((r) => [r.id, r]));

/** Any record, including hidden ones (for honest "not offered" messaging). */
export function getResortRecord(id: string): ResortRecord | null {
  return BY_ID.get(id) ?? null;
}

export function getActiveResort(id: string): ResortRecord | null {
  const r = BY_ID.get(id);
  return r && r.status === 'active' ? r : null;
}

export function resortsForDestination(slug: string): ResortRecord[] {
  return ACTIVE_RESORTS.filter((r) => r.destination === slug);
}

/** Valid destination for quiz context: a known site/catalog slug, else null. */
export function normalizeDestination(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return slug in DESTINATION_NAMES ? slug : null;
}

/**
 * A resort's own photo, or null. The catalog has no verified resort photos
 * yet, and the site's stock beach photos are not of specific places, so a
 * missing photo renders as a branded panel rather than a misleading image.
 */
export function resortImage(r: ResortRecord): { src: string; alt: string } | null {
  return r.images[0] ?? null;
}

export function transferLabel(r: ResortRecord): string | null {
  const t = r.transfer;
  if (!t) return null;
  if (!t.minutes) return `Nearest airport ${t.airport}, transfer time not confirmed`;
  const { min, max } = t.minutes;
  return min === max ? `About ${min} min from ${t.airport}` : `About ${min} to ${max} min from ${t.airport}`;
}

export function ageLabel(r: ResortRecord): string {
  if (r.adultsOnly === null) return 'Age policy not confirmed';
  if (r.adultsOnly) return r.minAge ? `Adults-only (${r.minAge}+)` : 'Adults-only (minimum age not published)';
  return 'Welcomes all ages';
}

export const PRICE_TIER_LABELS: Record<1 | 2 | 3, string> = {
  1: 'Lower price range',
  2: 'Mid price range',
  3: 'Upper price range',
};
