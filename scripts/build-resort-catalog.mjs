/**
 * build-resort-catalog.mjs
 *
 * Generates the resort catalog the matcher runs on:
 *   src/data/resorts/catalog.generated.json      (server only, all records)
 *   src/data/resorts/destinations.generated.json (small, safe for the browser)
 *
 * Inputs:
 * 1. scripts/seed-resorts-data.mjs: VacationPro's own resort database (the
 *    records seeded into Sanity in September 2026). Supplies editorial ratings,
 *    price band, the verdict text and the Expedia search URL for 32 resorts.
 * 2. data/resort-facts.json: facts for those 32, checked against official
 *    resort and brand sites on 2026-10-23, with sources.
 * 3. data/resort-sheet.json: the community "All Inclusive Resort Ratings"
 *    sheet (run scripts/import-resort-sheet.mjs to refresh). Adds every other
 *    in-scope resort, plus guest ratings, amenities and transfer times. Its
 *    prices are never imported or used.
 * 4. data/resort-sheet-extract.json: which sheet row matches each researched
 *    resort, so they are not duplicated.
 * 5. data/resort-expedia-ids.json: Expedia property id per resort id, each
 *    verified from a public Expedia (or sister-site) listing URL that names the
 *    resort. Drives exact Stay22 booking links; missing ids fall back to
 *    Stay22's name match, and the UI says so.
 *
 * Unknown stays unknown (null). Ratings derived from the sheet are labeled
 * 'community-sheet', never presented as VacationPro's own.
 *
 * Run: node scripts/build-resort-catalog.mjs
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { RESORTS } from './seed-resorts-data.mjs';

const FACTS_CHECKED_AT = '2026-10-23';
const EDITORIAL_DATE = '2026-09-22';

const facts = new Map(JSON.parse(readFileSync('data/resort-facts.json', 'utf8')).map((f) => [f.slug, f]));
const sheet = JSON.parse(readFileSync('data/resort-sheet.json', 'utf8'));
const extract = JSON.parse(readFileSync('data/resort-sheet-extract.json', 'utf8'));
const SHEET_SOURCE = { label: sheet.source.label, url: sheet.source.url };
const SHEET_DATE = sheet.source.retrievedAt;
const sheetByName = new Map(sheet.resorts.map((r) => [r.name, r]));
const EXPEDIA_IDS = existsSync('data/resort-expedia-ids.json')
  ? JSON.parse(readFileSync('data/resort-expedia-ids.json', 'utf8')).ids
  : {};

// ─── Destinations ────────────────────────────────────────────

const DEST = {
  cancun: ['Cancun and Costa Mujeres', 'Mexico'],
  'riviera-maya': ['Riviera Maya and Tulum', 'Mexico'],
  cozumel: ['Cozumel', 'Mexico'],
  'puerto-vallarta': ['Puerto Vallarta and Riviera Nayarit', 'Mexico'],
  'cabo-san-lucas': ['Los Cabos', 'Mexico'],
  mazatlan: ['Mazatlan', 'Mexico'],
  ixtapa: ['Ixtapa and Zihuatanejo', 'Mexico'],
  huatulco: ['Huatulco', 'Mexico'],
  acapulco: ['Acapulco', 'Mexico'],
  manzanillo: ['Manzanillo', 'Mexico'],
  'costa-maya': ['Costa Maya', 'Mexico'],
  loreto: ['Loreto', 'Mexico'],
  'punta-cana': ['Punta Cana', 'Dominican Republic'],
  'la-romana': ['La Romana and Bayahibe', 'Dominican Republic'],
  'puerto-plata': ['Puerto Plata', 'Dominican Republic'],
  samana: ['Samana', 'Dominican Republic'],
  'jamaica-montego-bay': ['Montego Bay', 'Jamaica'],
  'jamaica-negril': ['Negril', 'Jamaica'],
  'jamaica-ocho-rios': ['Ocho Rios and Runaway Bay', 'Jamaica'],
  'jamaica-south-coast': ['Jamaica South Coast', 'Jamaica'],
  aruba: ['Aruba', 'Aruba'],
  'saint-lucia': ['St. Lucia', 'St. Lucia'],
  barbados: ['Barbados', 'Barbados'],
  antigua: ['Antigua', 'Antigua and Barbuda'],
  'turks-and-caicos': ['Turks and Caicos', 'Turks and Caicos'],
  bahamas: ['Bahamas', 'Bahamas'],
  curacao: ['Curacao', 'Curacao'],
  grenada: ['Grenada', 'Grenada'],
  'st-maarten': ['St. Martin and Sint Maarten', 'St. Martin'],
  'british-virgin-islands': ['British Virgin Islands', 'British Virgin Islands'],
  'us-virgin-islands': ['US Virgin Islands', 'US Virgin Islands'],
  dominica: ['Dominica', 'Dominica'],
  'st-vincent': ['St. Vincent and the Grenadines', 'St. Vincent and the Grenadines'],
  martinique: ['Martinique', 'Martinique'],
  'cayman-islands': ['Cayman Islands', 'Cayman Islands'],
  bonaire: ['Bonaire', 'Bonaire'],
};

const COUNTRY_DEST = {
  Aruba: 'aruba',
  'Saint Lucia': 'saint-lucia',
  Barbados: 'barbados',
  Antigua: 'antigua',
  'Turks and Caicos': 'turks-and-caicos',
  Bahamas: 'bahamas',
  'Curaçao': 'curacao',
  Grenada: 'grenada',
  'Saint Martin': 'st-maarten',
  'British Virgin Islands': 'british-virgin-islands',
  'Saint Croix': 'us-virgin-islands',
  'Saint Thomas': 'us-virgin-islands',
  'US Virgin Islands': 'us-virgin-islands',
  Dominica: 'dominica',
  'Saint Vincent': 'st-vincent',
  Martinique: 'martinique',
  'Grand Cayman': 'cayman-islands',
  Bonaire: 'bonaire',
};
// Out of scope for a Mexico and Caribbean product, or under a do-not-travel advisory (Haiti).
const OUT_OF_SCOPE = new Set(['Cuba', 'Haiti', 'Bermuda', 'Nicaraugua', 'El Salvador', 'Brazil', 'Costa Rica', 'Colombia', 'Belize', 'Panama', 'Honduras', 'United States', 'Guatemala', 'Ecuador', 'Peru']);

const CANCUN_AREAS = new Set(['Cancun', 'Playa Mujeres', 'Costa Mujeres', 'Isla Mujeres', 'Punta Sam', 'Holbox Island']);
const ROMANA_AREAS = new Set(['Bayahibe', 'La Romana', 'Dominicus', 'Boca Chica', 'Juan Dolio', 'Guayacanes', 'El Soco']);

function destinationFor(r) {
  const { country, area, airport } = r;
  if (!country || OUT_OF_SCOPE.has(country)) return null;
  if (country === 'Mexico') {
    if (airport === 'Cozumel' || area === 'Cozumel') return 'cozumel';
    if (airport === 'Cancun' || airport === 'Tulum') return CANCUN_AREAS.has(area) ? 'cancun' : 'riviera-maya';
    if (airport === 'Ordaz' || /Vallarta|Nayarit|Mita|Bucerias|Sayulita/i.test(area ?? '')) return 'puerto-vallarta';
    if (airport === 'Los Cabos' || /Cabo/i.test(area ?? '')) return 'cabo-san-lucas';
    if (airport === 'Gen Rafael Buelna' || airport === 'Mazatlan' || area === 'Mazatlan') return 'mazatlan';
    if (/Zihuatanejo/.test(airport ?? '') || area === 'Ixtapa') return 'ixtapa';
    if (airport === 'Huatulco' || area === 'Huatulco' || area === 'Tangolunda') return 'huatulco';
    if (airport === 'Alvarez' || area === 'Acapulco') return 'acapulco';
    if (airport === 'Manzanillo' || area === 'Manzanillo' || area === 'Cihuatlan') return 'manzanillo';
    if (airport === 'Chetumal') return 'costa-maya';
    if (airport === 'Loreto' || area === 'Loreto') return 'loreto';
    if (area && CANCUN_AREAS.has(area)) return 'cancun';
    if (area && /Playa del Carmen|Tulum|Akumal|Puerto Morelos|Puerto Aventuras|Riviera Maya|Xpu-Ha|Playacar/i.test(area)) return 'riviera-maya';
    return null;
  }
  if (country === 'Dominican Republic') {
    if (airport === 'La Union' || /Puerto Plata|Sosua|Cabarete|Playa Dorada/i.test(area ?? '')) return 'puerto-plata';
    if (/Saman/.test(airport ?? '') || /Saman|Las Terrenas|Punta Balandra/i.test(area ?? '')) return 'samana';
    if (area && ROMANA_AREAS.has(area)) return 'la-romana';
    if (airport === 'Punta Cana' || /Punta Cana|Bavaro|Cap Cana|Uvero Alto|Miches/i.test(area ?? '')) return 'punta-cana';
    return null;
  }
  if (country === 'Jamaica') {
    if (/Negril|West End/i.test(area ?? '')) return 'jamaica-negril';
    if (/Ocho|Runaway|Discovery Bay/i.test(area ?? '')) return 'jamaica-ocho-rios';
    if (/Bluefields|White House|Treasure Beach|South Coast/i.test(area ?? '')) return 'jamaica-south-coast';
    if (airport === 'Sangster' || area) return 'jamaica-montego-bay';
    return null;
  }
  return COUNTRY_DEST[country] ?? null;
}

const AIRPORT_CODES = {
  Cancun: 'CUN', 'Punta Cana': 'PUJ', Sangster: 'MBJ', Ordaz: 'PVR', 'Los Cabos': 'SJD', 'La Union': 'POP',
  'George F. L. Charles': 'SLU', Hewanorra: 'UVF', 'V.C. Bird': 'ANU', 'Grantley Adams': 'BGI', Cozumel: 'CZM',
  'Reina Beatrix': 'AUA', 'Aeropuerto Hato': 'CUR', Providenciales: 'PLS', 'Gen Rafael Buelna': 'MZT', Mazatlan: 'MZT',
  'Ixtapa-Zihuatanejo': 'ZIH', 'Aeropuerto Internacional de Zihuatanejo': 'ZIH', 'Samaná El Catey': 'AZS',
  'Lynden Pindling': 'NAS', 'Point Saline': 'GND', Huatulco: 'HUX', Alvarez: 'ACA', 'Beef Island': 'EIS',
  Manzanillo: 'ZLO', 'Princ. Juliana': 'SXM', 'Melville Hall': 'DOM', Exuma: 'GGT', 'Grand Bahama': 'FPO',
  Chetumal: 'CTM', Argyle: 'SVD', Loreto: 'LTO', Lamentin: 'FDF', 'Owen Roberts': 'GCM', Tulum: 'TQO', 'Cyril E. King': 'STT',
};

// ─── Sheet fields ────────────────────────────────────────────

const has = (list, ...names) => names.some((n) => list.some((x) => x.toLowerCase().startsWith(n.toLowerCase())));
const KIDS_CLUB = ['Kids Club'];
const WATERPARK = ['Waterpark For', 'Kids Waterpark', 'Big Waterslides'];
const POOL_FEATURES = ['Swim Up Bar', 'Lazy River', 'Pool Slide', 'Adult Pool', 'Heated Pool', 'Water Feature', 'Flowrider'];

function hiddenReason(r) {
  const p = r.policy;
  if (p.includes('Permanently Closed')) return 'Permanently closed.';
  if (p.includes('Temporarily Closed') || /Reopening/i.test(r.name)) return 'Temporarily closed.';
  if (p.includes('Not Open Yet') || /\s-\s(\?|20\d\d|[A-Z][a-z]{2} \d)/.test(r.name)) return 'Not open yet.';
  if (p.includes('Not All Inclusive')) return 'Not an all-inclusive resort.';
  if (p.includes('Clothing Optional') || p.includes('Nude Areas')) return 'Clothing-optional resort, not included in matching. Brendan can still quote it.';
  return null;
}

function cleanName(name) {
  return name.replace(/\s+-\s+(Reopening.*|\?|20\d\d.*|[A-Z][a-z]{2} \d.*)$/, '').trim();
}

function slugify(s) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function sheetMinAge(policy) {
  for (const p of policy) {
    const m = /^(\d+)\+ Allowed$/.exec(p) || /^Children (\d+)\+$/.exec(p);
    if (m) return Number(m[1]);
  }
  return null;
}

function sheetMaxPerRoom(policy) {
  for (const p of policy) {
    const m = /^(?:Max )?(\d) per Room$/.exec(p);
    if (m) return Number(m[1]);
  }
  return null;
}

const tagLevel = (tags, noun) => (tags.includes(`Great ${noun}`) ? 3 : tags.includes(`Good ${noun}`) ? 2 : null);

function sheetRatings(r, adultsOnly) {
  const known = r.amenities.length > 0;
  const poolCount = POOL_FEATURES.filter((f) => r.amenities.includes(f)).length;
  const kids = has(r.amenities, ...KIDS_CLUB);
  const extraKids = has(r.amenities, ...WATERPARK, 'Teen Club');
  return {
    beach: tagLevel(r.tags, 'Beach') ?? (known && !r.amenities.includes('Beach') ? 0 : null),
    food: tagLevel(r.tags, 'Food'),
    pools: poolCount >= 3 ? 3 : poolCount === 2 ? 2 : poolCount === 1 ? 1 : null,
    rooms: r.hotelClass === null ? null : r.hotelClass >= 5 ? 3 : r.hotelClass >= 4.5 ? 2 : r.hotelClass >= 4 ? 1 : 0,
    nightlife: r.tags.includes('Great for Parties') ? 3 : r.amenities.includes('Nightclub') ? 2 : r.amenities.includes('Evening Entertainment') ? 1 : null,
    value: null,
    family: adultsOnly ? 0 : !known ? null : kids ? (extraKids ? 3 : 2) : 1,
  };
}

function sheetAtmosphere(r) {
  const party = r.tags.includes('Great for Parties');
  const romance = r.tags.some((t) => /for Romance/.test(t)) || r.styles.includes('Quiet') || r.styles.includes('Romantic');
  if (party) return 'social';
  if (romance && !r.amenities.includes('Nightclub')) return 'quiet';
  if (romance || r.styles.includes('Family') || r.styles.includes('Family Resort') || r.amenities.includes('Nightclub')) return 'balanced';
  return null;
}

function sheetTier(hotelClass) {
  if (hotelClass === null) return null;
  return hotelClass >= 5 ? 3 : hotelClass >= 4 ? 2 : 1;
}

const FEATURE_ORDER = [
  ['Swim Up Bar', 'Swim-up bar'],
  ['Lazy River', 'Lazy river'],
  ['Waterpark For Big Kids', 'Water park for older kids'],
  ['Waterpark For Little Kids', 'Splash park for little kids'],
  ['Kids Club', 'Kids club'],
  ['Teen Club', 'Teen club'],
  ['Adult Pool', 'Adults-only pool'],
  ['Spa', 'Spa'],
  ['Golf Course', 'Golf course'],
  ['Casino', 'Casino'],
  ['Nightclub', 'Nightclub'],
  ["Restaurants Don't Require Reservations", 'Restaurants without reservations'],
  ['No Timeshare Pitches', 'No timeshare pitches'],
  ['Five People Allowed In Standard Room', 'Standard rooms fit five'],
];
const ROOM_FEATURES = {
  'Swim Up Rooms': 'Swim-up rooms',
  'Plunge Pool Rooms': 'Plunge pool rooms',
  'Over Water Rooms': 'Overwater rooms',
  'Family Suite': 'Family suites',
  '2 Bedroom Suites': 'Two-bedroom suites',
  Villas: 'Villas',
  'Beach Front Rooms': 'Beachfront rooms',
  'Adults Only Rooms': 'Adults-only room section',
  'Accessible Rooms': 'Accessible rooms',
};

function sheetFeatures(r) {
  const out = [];
  for (const [key, label] of FEATURE_ORDER) if (r.amenities.some((a) => a.startsWith(key))) out.push(label);
  for (const o of r.roomOptions) if (ROOM_FEATURES[o]) out.push(ROOM_FEATURES[o]);
  if (r.connectingRooms && /yes|night/i.test(r.connectingRooms)) out.push('Guaranteed connecting rooms');
  if (r.policy.includes('Timeshare')) out.push('Timeshare sales on site (reported)');
  if (r.policy.includes('Optional Topless Areas')) out.push('Optional topless areas');
  if (r.policy.includes('No TV')) out.push('No TV in rooms');
  return Array.from(new Set(out)).slice(0, 12);
}

function sheetExclusions(r) {
  const x = [];
  if (r.policy.includes('Alcohol not included')) x.push('alcohol');
  if (r.policy.includes('Beverages not included')) x.push('beverages');
  if (r.policy.includes('AC is an additional charge')) x.push('air conditioning (extra charge)');
  if (r.policy.includes('No AC or Pool')) x.push('air conditioning and pool (none on site)');
  return x;
}

function sheetNotes(r) {
  const map = {
    'Non Refundable': 'Rates reported as non-refundable.',
    'No Online Booking': 'Reported as not bookable online.',
    "Can't Book Kids Online": 'Reported that children cannot be booked online.',
    'Minimum Stay 14 Nights': 'Reported 14-night minimum stay.',
    'Site Not in English': 'Resort website not in English.',
    'Suspected Review Manipulation': 'Sheet flags suspected review manipulation, so guest ratings are not used.',
  };
  return r.policy.map((p) => map[p]).filter(Boolean).join(' ') || undefined;
}

function guestRating(r) {
  if (r.guestRating === null || r.policy.includes('Suspected Review Manipulation')) return null;
  return { score: Math.round(r.guestRating * 10) / 10, reviews: r.reviews, source: `${sheet.source.label}: ${sheet.source.ratingNote}` };
}

function expediaSearch(name, place, country) {
  const u = new URL('https://www.expedia.com/Hotel-Search');
  u.searchParams.set('destination', `${place}, ${country}`);
  u.searchParams.set('hotel-name', name);
  return u.toString();
}

function sheetSummary(r, destName, rooms) {
  const kind = r.policy.includes('Couples Only') ? 'Couples-only' : r.category === 'Adults Only' ? 'Adults-only' : r.category === 'Family' ? 'Family-friendly' : 'All-inclusive';
  const where = r.area && r.area !== r.country ? `${r.area}, ${r.country}` : destName;
  const size = rooms ? ` with about ${rooms.toLocaleString('en-US')} rooms` : '';
  const brand = r.brand ? ` from ${r.brand}` : '';
  const style = r.styles.filter((s) => ['Quiet', 'Romantic', 'Luxury', 'Modern', 'Boutique', 'Trendy', 'Charming', 'Classic', 'Hidden Gem', 'Value'].includes(s)).slice(0, 2);
  const described = style.length ? ` The community guide describes it as ${style.map((s) => s.toLowerCase()).join(' and ')}.` : '';
  return `${kind}${kind === 'All-inclusive' ? '' : ' all-inclusive'} resort in ${where}${size}${brand}.${described}`;
}

// ─── Researched resorts (existing seed + official-source facts) ───

const NAME_OVERRIDES = {
  'bahia-principe-grand-punta-cana': 'Bahia Principe Explore Punta Cana',
  'dreams-vista-cancun': 'Hyatt Vivid Cancun',
  'divi-tamarijn-aruba': 'Divi Aruba and Tamarijn Aruba All Inclusive',
  'iberostar-selection-paraiso': 'Iberostar Selection Paraiso Lindo',
  'live-aqua-beach-resort-cancun': 'Live Aqua Beach Resort Cancun',
};
// Booking sites call it adults-only; official material does not publish a policy.
const FACT_OVERRIDES = { 'mondrian-cancun': { adultsOnly: null, minAge: null } };
const SUMMARY_OVERRIDES = {
  'dreams-vista-cancun':
    'Formerly Dreams Vista Cancun, rebranded in August 2026 as Hyatt Vivid, an adults-only all-inclusive. We have not re-rated it since the rebrand, so ask for a current read before booking.',
};
// Seed ratings that no longer describe the resort.
const PROVISIONAL = { 'dreams-vista-cancun': true };
const HIDE = {
  'hyatt-regency-aruba': 'Not an all-inclusive resort.',
  'hilton-aruba-caribbean': 'Not an all-inclusive resort.',
  'renaissance-wind-creek-aruba': 'All-inclusive is an optional package, not the standard plan.',
  'hard-rock-hotel-cancun': 'Temporarily closed for renovation from August 2026, with reopening reported for December 2026.',
};

const r0 = (v) => (v === undefined ? null : v);

function seedRatings(seed, adultsOnly) {
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

function seedAtmosphere(seed) {
  const v = seed.vibeScores;
  const night = Math.max(v.nightlife ?? 0, v.entertainment ?? 0);
  if (night >= 3) return 'social';
  const calm = Math.max(v.romantic ?? 0, v.seclusion ?? 0, v.relaxing ?? 0);
  if (night <= 1 && calm >= 2) return 'quiet';
  return 'balanced';
}

function mergedTransfer(f, row) {
  const airport = f.nearestAirport ?? (row?.airport ? AIRPORT_CODES[row.airport] ?? row.airport : null);
  if (!airport) return null;
  const vals = [];
  if (f.transferMinutes) vals.push(f.transferMinutes.min, f.transferMinutes.max);
  if (row?.transferMinutes) vals.push(row.transferMinutes);
  return { airport, minutes: vals.length ? { min: Math.min(...vals), max: Math.max(...vals) } : null };
}

const usedSheetNames = new Set();
const curated = RESORTS.map((seed) => {
  if (!facts.has(seed.slug)) throw new Error(`No facts for ${seed.slug}`);
  const f = { ...facts.get(seed.slug), ...(FACT_OVERRIDES[seed.slug] ?? {}) };
  const sheetName = extract.resorts[seed.slug]?.sheetName ?? null;
  const row = sheetName ? sheetByName.get(sheetName) ?? null : null;
  if (sheetName) usedSheetNames.add(sheetName);
  const name = NAME_OVERRIDES[seed.slug] ?? seed.name;
  const adultsOnly = r0(f.adultsOnly);
  const url = new URL(seed.expediaUrl);
  if (NAME_OVERRIDES[seed.slug] && url.searchParams.has('hotel-name')) url.searchParams.set('hotel-name', name);
  return {
    id: seed.slug,
    name,
    destination: seed.destinationSlug,
    country: DEST[seed.destinationSlug][1],
    area: row?.area ?? null,
    origin: 'curated',
    status: HIDE[seed.slug] ? 'hidden' : 'active',
    ...(HIDE[seed.slug] ? { hiddenReason: HIDE[seed.slug] } : {}),
    images: [],
    summary: SUMMARY_OVERRIDES[seed.slug] ?? seed.verdict,
    allInclusive: r0(f.allInclusive),
    adultsOnly,
    minAge: adultsOnly ? r0(f.minAge) : null,
    couplesOnly: false,
    maxPerRoom: null,
    hasKidsClub: r0(f.hasKidsClub),
    hasWaterPark: r0(f.hasWaterPark),
    roomCount: r0(f.roomCount) ?? (row?.rooms ? Math.round(row.rooms) : null),
    restaurantsCount: r0(f.restaurantsCount),
    transfer: mergedTransfer(f, row),
    beach: { swimmable: r0(f.beachSwimmable), notes: r0(f.beachNotes) },
    inclusions: f.notableInclusions ?? [],
    exclusions: f.notableExclusions ?? [],
    sources: [...(f.sources ?? []), ...(row ? [SHEET_SOURCE] : [])],
    factsCheckedAt: FACTS_CHECKED_AT,
    ...(f.notes ? { factNotes: f.notes } : {}),
    features: row ? sheetFeatures(row) : [],
    guestRating: row ? guestRating(row) : null,
    atmosphere: PROVISIONAL[seed.slug] ? null : seedAtmosphere(seed),
    ratings: PROVISIONAL[seed.slug]
      ? { beach: null, food: null, pools: null, rooms: null, nightlife: null, value: null, family: adultsOnly ? 0 : null }
      : seedRatings(seed, adultsOnly),
    ratingSource: 'vacationpro',
    priceTier: seed.priceBand,
    priceTierBasis: 'editorial',
    editorialReviewedAt: SUMMARY_OVERRIDES[seed.slug] ? null : EDITORIAL_DATE,
    visitStatus: null,
    price: null,
    bookingSearchUrl: url.toString(),
  };
});

// ─── Community sheet resorts ─────────────────────────────────

// Sheet rows that duplicate a resort already in the catalog under another name.
const DUPLICATE_SHEET_NAMES = new Set([
  'Divi Aruba', // half of the researched divi-tamarijn-aruba record
  'Tamarijn Aruba All Inclusive', // the other half
  'Oceans At Divi Little Bay', // same resort as "Oceans at Divi Little Bay Beach Resort"
]);

// The sheet lists some resorts twice under the same name. Keep the row with
// the most reviews so each resort appears once.
const normName = (n) => cleanName(n).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '');
const bestRow = new Map();
for (const row of sheet.resorts) {
  const key = `${row.country}|${normName(row.name)}`;
  const prev = bestRow.get(key);
  if (!prev || (row.reviews ?? 0) > (prev.reviews ?? 0)) bestRow.set(key, row);
}
let skippedDuplicate = 0;

const ids = new Set(curated.map((r) => r.id));
let skippedScope = 0;
let skippedPlace = 0;
const imported = [];
for (const row of sheet.resorts) {
  if (usedSheetNames.has(row.name)) continue;
  if (DUPLICATE_SHEET_NAMES.has(row.name) || bestRow.get(`${row.country}|${normName(row.name)}`) !== row) {
    skippedDuplicate++;
    continue;
  }
  if (!row.country || OUT_OF_SCOPE.has(row.country)) {
    skippedScope++;
    continue;
  }
  const destination = destinationFor(row);
  if (!destination) {
    skippedPlace++;
    continue;
  }
  const name = cleanName(row.name).replace(/\s*[–—]\s*/g, ' - ');
  let id = slugify(name);
  for (let n = 2; ids.has(id); n++) id = `${slugify(name)}-${n}`;
  ids.add(id);
  const couplesOnly = row.policy.includes('Couples Only');
  const adultsOnly = couplesOnly ? true : row.category === 'Adults Only' ? true : row.category === 'Family' ? false : null;
  const known = row.amenities.length > 0;
  const hidden = hiddenReason(row);
  const [destName, country] = DEST[destination];
  const rooms = row.rooms ? Math.round(row.rooms) : null;
  const notes = sheetNotes(row);
  imported.push({
    id,
    name,
    destination,
    country,
    area: row.area,
    origin: 'sheet',
    status: hidden ? 'hidden' : 'active',
    ...(hidden ? { hiddenReason: hidden } : {}),
    images: [],
    summary: sheetSummary(row, destName, rooms).replace(/\s*[–—]\s*/g, ' - '),
    allInclusive: !row.policy.includes('Not All Inclusive'),
    adultsOnly,
    minAge: sheetMinAge(row.policy),
    couplesOnly,
    maxPerRoom: sheetMaxPerRoom(row.policy),
    hasKidsClub: known ? has(row.amenities, ...KIDS_CLUB) : null,
    hasWaterPark: known ? has(row.amenities, ...WATERPARK) : null,
    roomCount: rooms,
    restaurantsCount: null,
    transfer: row.airport
      ? { airport: AIRPORT_CODES[row.airport] ?? row.airport, minutes: row.transferMinutes ? { min: row.transferMinutes, max: row.transferMinutes } : null }
      : null,
    beach: { swimmable: null, notes: null },
    inclusions: [],
    exclusions: sheetExclusions(row),
    sources: [SHEET_SOURCE],
    factsCheckedAt: SHEET_DATE,
    ...(notes ? { factNotes: notes } : {}),
    features: sheetFeatures(row),
    guestRating: guestRating(row),
    atmosphere: sheetAtmosphere(row),
    ratings: sheetRatings(row, adultsOnly),
    ratingSource: 'community-sheet',
    priceTier: sheetTier(row.hotelClass),
    priceTierBasis: row.hotelClass === null ? null : 'hotel-class',
    editorialReviewedAt: null,
    visitStatus: null,
    price: null,
    bookingSearchUrl: expediaSearch(name, row.area ?? destName, country),
  });
}

// Sheet entries that are not separate resorts, or are not open, found during
// booking-link research (2026-10-27).
const SHEET_HIDE = {
  'premium-level-at-barcelo-maya-palace': 'A room category inside Barcelo Maya Palace, not a separate resort.',
  'royal-level-at-occidental-cozumel': 'A room category inside Occidental Cozumel, not a separate resort.',
  'tribe-resorts': 'Reported closed from February 2026 to January 2027.',
};
for (const r of imported) {
  if (SHEET_HIDE[r.id]) {
    r.status = 'hidden';
    r.hiddenReason = SHEET_HIDE[r.id];
  }
}

const all = [...curated, ...imported].map((r) => ({ ...r, expediaId: EXPEDIA_IDS[r.id]?.expediaId ?? null }));
const bad = all.filter((r) => /[–—]/.test(JSON.stringify(r)));
if (bad.length) console.warn(`Note: ${bad.length} records contain an en or em dash in source text (sources or names).`);

const destinations = Object.entries(DEST)
  .map(([slug, [name, country]]) => {
    const active = all.filter((r) => r.destination === slug && r.status === 'active');
    return { slug, name, country, count: active.length, researched: active.filter((r) => r.origin === 'curated').length };
  })
  .filter((d) => d.count > 0)
  .sort((a, b) => b.count - a.count);

mkdirSync('src/data/resorts', { recursive: true });
writeFileSync('src/data/resorts/catalog.generated.json', JSON.stringify(all) + '\n');
writeFileSync('src/data/resorts/destinations.generated.json', JSON.stringify(destinations, null, 1) + '\n');
console.log(
  `Wrote ${all.length} resorts (${all.filter((r) => r.status === 'active').length} active; ${curated.length} researched, ${imported.length} from the sheet; ` +
    `${all.filter((r) => r.status === 'active' && r.expediaId).length} active with exact booking links). ` +
    `Skipped ${skippedScope} out of scope, ${skippedPlace} without a placeable destination, ${skippedDuplicate} duplicates. ${destinations.length} destinations.`,
);
