/**
 * build-resort-catalog.mjs
 *
 * Generates packages/engine/src/resort/catalog.generated.ts from two inputs:
 *
 * 1. scripts/seed-resorts-data.mjs: the existing VacationPro resort database
 *    (the same records seeded into Sanity in September 2026). Supplies the
 *    editorial layer: vibe scores (mapped to priority ratings), price band,
 *    the verdict text, and the Expedia search URL.
 * 2. data/resort-facts.json: the verified facts layer, fact-checked against
 *    official resort and brand sites on 2026-10-23 with sources per resort.
 *    Unverified fields are null there and stay null here.
 *
 * 3. data/resort-sheet-extract.json: the columns we use, for our resorts only,
 *    from the community "All Inclusive Resort Ratings" spreadsheet (shared by
 *    Brendan 2026-10-23). Used as an attributed secondary source: dated
 *    reference prices, and transfer times and room counts where the official
 *    research had none. Where both give a transfer time, the range spans both.
 *    Official research wins on every other conflict.
 *
 * Run: node scripts/build-resort-catalog.mjs
 * Re-run after editing either input. The output is committed so the matcher
 * works without Sanity, network access, or an AI API.
 */
import { readFileSync, writeFileSync } from 'fs';
import { RESORTS } from './seed-resorts-data.mjs';

const FACTS_CHECKED_AT = '2026-10-23';
const EDITORIAL_DATE = '2026-09-22'; // when the seed entered the resort database

const sheet = JSON.parse(readFileSync('data/resort-sheet-extract.json', 'utf8'));
const SHEET_SOURCE = { label: sheet.source.label, url: sheet.source.url };

// Sheet prices that do not describe the resort as it is now.
const SKIP_SHEET_PRICE = {
  // Checked April 2026, before the August 2026 rebrand from a family resort
  // (Dreams Vista) to adults-only Hyatt Vivid.
  'dreams-vista-cancun': true,
};

const facts = new Map(JSON.parse(readFileSync('data/resort-facts.json', 'utf8')).map((f) => [f.slug, f]));

// Display names where the resort has been renamed or the seed name is ambiguous.
const NAME_OVERRIDES = {
  'bahia-principe-grand-punta-cana': 'Bahia Principe Explore Punta Cana',
  'dreams-vista-cancun': 'Hyatt Vivid Cancun',
  'divi-tamarijn-aruba': 'Divi Aruba and Tamarijn Aruba All Inclusive',
  'iberostar-selection-paraiso': 'Iberostar Selection Paraiso Lindo',
  'live-aqua-beach-resort-cancun': 'Live Aqua Beach Resort Cancun',
};

// Facts that need a human decision. Each override says why.
const FACT_OVERRIDES = {
  // Booking sites call it adults-only; official material does not publish a
  // child policy and mentions a planned teens club. Unknown until confirmed.
  'mondrian-cancun': { adultsOnly: null, minAge: null },
};

// Summary text replacing a seed verdict that no longer describes the resort.
const SUMMARY_OVERRIDES = {
  'dreams-vista-cancun':
    'Formerly Dreams Vista Cancun, rebranded in August 2026 as Hyatt Vivid, an adults-only all-inclusive. We have not re-rated it since the rebrand, so ask for a current read before booking.',
  'bahia-principe-grand-punta-cana': null, // seed verdict still accurate; name updated only
};

// Seed ratings that no longer describe the resort.
const PROVISIONAL = { 'dreams-vista-cancun': true };

const HIDE = {
  'hyatt-regency-aruba': 'Not an all-inclusive resort.',
  'hilton-aruba-caribbean': 'Not an all-inclusive resort.',
  'renaissance-wind-creek-aruba': 'All-inclusive is an optional package, not the standard plan.',
  'hard-rock-hotel-cancun': 'Temporarily closed for renovation from August 2026, with reopening reported for December 2026.',
};

const r = (v) => (v === undefined ? null : v);

function ratings(seed, adultsOnly) {
  const v = seed.vibeScores;
  const pick = (...keys) => {
    const vals = keys.map((k) => v[k]).filter((x) => typeof x === 'number');
    return vals.length ? Math.max(...vals) : null;
  };
  return {
    beach: pick('beach'),
    food: pick('food'),
    pools: pick('pool'),
    rooms: pick('luxury', 'privatepools'),
    nightlife: pick('nightlife', 'entertainment'),
    value: pick('value'),
    family: adultsOnly ? 0 : pick('kids', 'kidsclub', 'familysuites', 'waterpark'),
  };
}

function atmosphere(seed) {
  const v = seed.vibeScores;
  const night = Math.max(v.nightlife ?? 0, v.entertainment ?? 0);
  if (night >= 3) return 'social';
  const calm = Math.max(v.romantic ?? 0, v.seclusion ?? 0, v.relaxing ?? 0);
  if (night <= 1 && calm >= 2) return 'quiet';
  return 'balanced';
}

function bookingUrl(seed, name) {
  const url = new URL(seed.expediaUrl);
  if (NAME_OVERRIDES[seed.slug] && url.searchParams.has('hotel-name')) {
    url.searchParams.set('hotel-name', name);
  }
  return url.toString();
}

function sheetPrice(slug, adultsOnly) {
  const row = sheet.resorts[slug];
  if (!row || !row.directUsd7Nights || SKIP_SHEET_PRICE[slug]) return null;
  const adults = row.category === 'Adults Only';
  // Only use the price when its occupancy basis matches our age-policy fact.
  if (adultsOnly !== null && adults !== adultsOnly) return null;
  return {
    amount: Math.round(row.directUsd7Nights),
    currency: 'USD',
    nights: 7,
    basis: 'lowest-priced refundable room, booked direct with the resort',
    travelDates: 'March 2027 or the nearest available dates',
    occupancy: adults ? sheet.source.occupancyAdultsOnly : sheet.source.occupancyFamily,
    occupancyCounts: adults ? { adults: 2, children: 0 } : { adults: 2, children: 2 },
    includes: 'All-inclusive resort stay. Flights not included.',
    source: sheet.source.label,
    sourceUrl: sheet.source.url,
    checkedAt: sheet.source.pricesCheckedAt,
  };
}

function mergedTransfer(f, row) {
  const airport = f.nearestAirport ?? (row?.airport ? row.airport : null);
  if (!airport) return null;
  const vals = [];
  if (f.transferMinutes) vals.push(f.transferMinutes.min, f.transferMinutes.max);
  if (row?.transferMinutes) vals.push(row.transferMinutes);
  return { airport, minutes: vals.length ? { min: Math.min(...vals), max: Math.max(...vals) } : null };
}

const out = RESORTS.map((seed) => {
  const f = { ...facts.get(seed.slug), ...(FACT_OVERRIDES[seed.slug] ?? {}) };
  if (!facts.has(seed.slug)) throw new Error(`No facts for ${seed.slug}`);
  const name = NAME_OVERRIDES[seed.slug] ?? seed.name;
  const adultsOnly = r(f.adultsOnly);
  const summary = SUMMARY_OVERRIDES[seed.slug] ?? seed.verdict;
  const row = sheet.resorts[seed.slug] ?? null;
  const usedSheet = Boolean(row && (row.directUsd7Nights || row.transferMinutes || (f.roomCount == null && row.roomCount)));
  const sources = [...(f.sources ?? []), ...(usedSheet ? [SHEET_SOURCE] : [])];
  return {
    id: seed.slug,
    name,
    destination: seed.destinationSlug,
    status: HIDE[seed.slug] ? 'hidden' : 'active',
    ...(HIDE[seed.slug] ? { hiddenReason: HIDE[seed.slug] } : {}),
    images: [],
    summary,
    allInclusive: r(f.allInclusive),
    adultsOnly,
    minAge: adultsOnly ? r(f.minAge) : null,
    hasKidsClub: r(f.hasKidsClub),
    hasWaterPark: r(f.hasWaterPark),
    roomCount: r(f.roomCount) ?? (row?.roomCount ? Math.round(row.roomCount) : null),
    restaurantsCount: r(f.restaurantsCount),
    transfer: mergedTransfer(f, row),
    beach: { swimmable: r(f.beachSwimmable), notes: r(f.beachNotes) },
    inclusions: f.notableInclusions ?? [],
    exclusions: f.notableExclusions ?? [],
    sources,
    factsCheckedAt: FACTS_CHECKED_AT,
    ...(f.notes ? { factNotes: f.notes } : {}),
    // A rebranded resort's seed ratings describe the old concept, so they
    // are treated as unknown (neutral in ranking) until re-reviewed.
    atmosphere: PROVISIONAL[seed.slug] ? null : atmosphere(seed),
    ratings: PROVISIONAL[seed.slug]
      ? { beach: null, food: null, pools: null, rooms: null, nightlife: null, value: null, family: adultsOnly ? 0 : null }
      : ratings(seed, adultsOnly),
    priceTier: seed.priceBand,
    editorialReviewedAt: SUMMARY_OVERRIDES[seed.slug] ? null : EDITORIAL_DATE,
    visitStatus: null,
    price: sheetPrice(seed.slug, adultsOnly),
    bookingSearchUrl: bookingUrl(seed, name),
  };
});

const banned = /[–—]/;
for (const rec of out) {
  if (banned.test(JSON.stringify(rec))) throw new Error(`Dash character in ${rec.id}`);
}

const header = `// GENERATED by scripts/build-resort-catalog.mjs. Do not edit by hand.
// Facts: data/resort-facts.json (checked ${FACTS_CHECKED_AT}). Editorial: scripts/seed-resorts-data.mjs.
import type { ResortRecord } from './types';

`;
writeFileSync(
  'packages/engine/src/resort/catalog.generated.ts',
  `${header}export const RESORT_CATALOG: ResortRecord[] = ${JSON.stringify(out, null, 2)};\n`,
);
console.log(`Wrote ${out.length} resorts (${out.filter((x) => x.status === 'active').length} active).`);
