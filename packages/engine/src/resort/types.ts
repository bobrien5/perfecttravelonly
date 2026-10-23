/**
 * Resort recommendation types (2026-10 resort platform).
 *
 * Everything here separates three kinds of information, because the matcher
 * and the UI treat them differently:
 *
 * - Verified facts (adults-only, minimum age, transfer time, inclusions) come
 *   from a cited source and carry `sources` + `factsCheckedAt`. `null` always
 *   means "we do not know", never "no".
 * - Editorial ratings (how strong the food or pool scene is, the atmosphere)
 *   are VacationPro's own assessments, reused from the original Sanity seed.
 *   They are labeled as editorial wherever they are shown.
 * - Prices are only ever an editorial tier unless a dated, sourced quote is
 *   attached. Budget fit computed from a tier is always described as estimated.
 */

/** Destination slug, e.g. 'cancun' or 'jamaica-negril'. The catalog defines the set. */
export type CatalogDestination = string;

export type TravelParty = 'couple' | 'friends' | 'family' | 'solo';
export type Atmosphere = 'quiet' | 'balanced' | 'social';
export type Priority = 'beach' | 'food' | 'pools' | 'rooms' | 'nightlife' | 'value' | 'family';
export type TripDealbreaker = 'long-transfer' | 'mega-resort' | 'party-scene' | 'rough-beach' | 'lots-of-kids';
export type Currency = 'USD' | 'CAD' | 'GBP' | 'EUR';

export const PRIORITIES: Priority[] = ['beach', 'food', 'pools', 'rooms', 'nightlife', 'value', 'family'];
export const TRIP_DEALBREAKERS: TripDealbreaker[] = ['long-transfer', 'mega-resort', 'party-scene', 'rough-beach', 'lots-of-kids'];
export const CURRENCIES: Currency[] = ['USD', 'CAD', 'GBP', 'EUR'];
export const MAX_PRIORITIES = 2;

export type TripDates =
  | { mode: 'exact'; checkIn: string; checkOut: string }
  | { mode: 'flexible'; month: string | null; nights: number };

export interface TripBudget {
  /** Total for the whole trip and every traveler. null when the traveler is unsure. */
  amount: number | null;
  currency: Currency;
  /** Whether `amount` also has to cover flights. null = not answered yet. */
  includesFlights: boolean | 'unsure' | null;
}

/** Answers collected by the resort quiz. Versioned so stored sessions stay readable. */
export interface TripAnswers {
  version: 2;
  entry: 'discover' | 'known' | null;
  /** A catalog or site destination slug, or 'open' for "open to suggestions". */
  destination: string | null;
  /** Resort the visitor arrived from (a resort page or an article), if any. */
  contextResortId?: string | null;
  party: TravelParty | null;
  adults: number;
  childAges: number[];
  rooms: number;
  dates: TripDates | null;
  /** Free text: city or airport code. 'skip' when undecided. */
  airport: string | 'skip' | null;
  budget: TripBudget | null;
  adultsOnly: 'yes' | 'no' | 'either' | null;
  atmosphere: Atmosphere | 'unsure' | null;
  priorities: Priority[];
  dealbreakers: TripDealbreaker[];
  notes: string;
}

export interface SourceRef {
  label: string;
  url: string;
}

/** 0-3 editorial rating, null when VacationPro has not rated it. */
export type Rating = 0 | 1 | 2 | 3 | null;

export interface ResortImage {
  src: string;
  alt: string;
  credit?: string;
}

/**
 * A dated reference price from a named source. Never a live rate: it says
 * what a stay cost when it was checked, for a stated occupancy and dates.
 */
export interface ReferencePrice {
  /** Total for the whole stay described by `nights` and `occupancy`. */
  amount: number;
  currency: Currency;
  nights: number;
  basis: string;
  travelDates: string;
  occupancy: string;
  /** Adults and children the price was quoted for. */
  occupancyCounts: { adults: number; children: number };
  includes: string;
  source: string;
  sourceUrl: string | null;
  checkedAt: string;
}

export interface GuestRating {
  /** 0-100 average across review sites. */
  score: number;
  reviews: number | null;
  source: string;
}

export interface ResortRecord {
  id: string;
  name: string;
  destination: CatalogDestination;
  country: string;
  area: string | null;
  /** 'curated': researched by VacationPro. 'sheet': imported from the community resort sheet. */
  origin: 'curated' | 'sheet';
  /** Hidden records stay in the data for reference but never match. */
  status: 'active' | 'hidden';
  hiddenReason?: string;
  images: ResortImage[];
  /** One or two sentences, editorial. */
  summary: string;

  // Verified facts
  allInclusive: boolean | 'optional' | null;
  adultsOnly: boolean | null;
  /** Minimum guest age, for adults-only and age-restricted family resorts alike. */
  minAge: number | null;
  couplesOnly: boolean;
  /** Most people allowed in one room, when the resort restricts it. */
  maxPerRoom: number | null;
  hasKidsClub: boolean | null;
  hasWaterPark: boolean | null;
  roomCount: number | null;
  restaurantsCount: number | null;
  transfer: { airport: string; minutes: { min: number; max: number } | null } | null;
  beach: { swimmable: 'yes' | 'mixed' | 'no' | null; notes: string | null };
  inclusions: string[];
  exclusions: string[];
  sources: SourceRef[];
  factsCheckedAt: string | null;
  factNotes?: string;

  /** Notable amenities and room types worth showing (from the source data). */
  features: string[];
  guestRating: GuestRating | null;

  // Editorial
  atmosphere: Atmosphere | null;
  ratings: Record<Priority, Rating>;
  /** Who produced `ratings` and `atmosphere`. */
  ratingSource: 'vacationpro' | 'community-sheet';
  /** 1 = lower cost, 2 = mid, 3 = upper. An estimate, never a price. null when unknown. */
  priceTier: 1 | 2 | 3 | null;
  priceTierBasis: 'editorial' | 'hotel-class' | null;
  editorialReviewedAt: string | null;
  /** Only set when Brendan has confirmed it. */
  visitStatus: 'visited' | 'researched' | null;
  price: ReferencePrice | null;

  // Booking
  /** OTA search or property URL that the Stay22 allez link wraps. */
  bookingSearchUrl: string;
}

export type BudgetFit = 'comfortable' | 'workable' | 'stretch' | 'over' | 'unknown';

export interface BudgetAssessment {
  fit: BudgetFit;
  /** Always says how the estimate was made. */
  explanation: string;
  /** Estimated hotel-only money per room per night, when computable. */
  perRoomNightEstimate: number | null;
}

export type RecommendationRole = 'best-overall' | 'best-value' | 'worth-the-upgrade' | 'also-strong';

export interface Recommendation {
  role: RecommendationRole;
  resort: ResortRecord;
  whyItFits: string[];
  tradeoff: string;
  skipIf: string;
  roomGuidance: string;
  budget: BudgetAssessment;
  /** Facts the traveler should confirm because we do not know them. */
  unknowns: string[];
}

export interface ExcludedResort {
  resort: ResortRecord;
  reason: string;
}

export interface MatchResult {
  recommendations: Recommendation[];
  /** Eligible resorts in ranked order (ids), for comparison and quotes. */
  rankedIds: string[];
  excluded: ExcludedResort[];
  /** Plain-language notes when fewer than three results came back. */
  limitations: string[];
}
