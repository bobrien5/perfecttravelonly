import { assessBudget, BUDGET_FIT_POINTS, priceIndex, travelerCount } from './budget';
import type {
  Atmosphere,
  BudgetAssessment,
  ExcludedResort,
  MatchResult,
  Priority,
  Recommendation,
  RecommendationRole,
  ResortRecord,
  TripAnswers,
} from './types';

/**
 * Deterministic resort matcher. No AI, no randomness, no commission input.
 *
 * 1. Hard constraints remove resorts the traveler cannot or will not book:
 *    scope (all-inclusive), destination, age eligibility, and dealbreakers.
 *    A constraint only excludes on a KNOWN fact. Unknown facts never exclude
 *    on a dealbreaker; they are surfaced as "confirm this" notes instead.
 *    The one exception is age eligibility, where an unconfirmed policy would
 *    send a family to a resort that may turn them away, so unknown excludes.
 * 2. Eligible resorts are ranked on stated priorities, atmosphere and party.
 * 3. Budget fit (always an estimate, see budget.ts) adjusts the rank.
 * 4. Up to three distinct roles are picked, never forced.
 */

export const PRIORITY_LABELS: Record<Priority, string> = {
  beach: 'the beach',
  food: 'food',
  pools: 'pools',
  rooms: 'rooms',
  nightlife: 'nightlife and entertainment',
  value: 'value',
  family: 'family amenities',
};

const ATMOSPHERE_LABELS: Record<Atmosphere, string> = {
  quiet: 'quiet and romantic',
  balanced: 'lively but relaxed',
  social: 'energetic and social',
};

export const LONG_TRANSFER_MINUTES = 45;
/** How close (in score points) an extra pick must be to the top pick. */
export const ALSO_STRONG_MARGIN = 4;
export const MEGA_RESORT_ROOMS = 600;

const PRIORITY_WEIGHTS = [3, 2];

function hasChildren(a: TripAnswers): boolean {
  return a.childAges.length > 0;
}

/** Returns a reason when a hard constraint excludes the resort, else null. */
export function exclusionReason(a: TripAnswers, r: ResortRecord): string | null {
  if (r.allInclusive !== true) {
    return r.allInclusive === 'optional'
      ? 'All-inclusive is an optional add-on here, not the standard plan.'
      : r.allInclusive === false
        ? 'Not an all-inclusive resort.'
        : 'We could not confirm it is all-inclusive.';
  }

  if (a.destination && a.destination !== 'open' && r.destination !== a.destination) {
    return 'Outside your chosen destination.';
  }

  if (r.couplesOnly && (hasChildren(a) || a.adults % 2 !== 0 || a.party === 'family' || a.party === 'solo')) {
    return 'Couples only.';
  }

  if (r.maxPerRoom !== null && Math.ceil((a.adults + a.childAges.length) / Math.max(1, a.rooms)) > r.maxPerRoom) {
    return `Allows at most ${r.maxPerRoom} people per room. Add a room or choose another resort.`;
  }

  if (hasChildren(a)) {
    const youngest = Math.min(...a.childAges);
    if (r.adultsOnly === null) return 'We could not confirm it accepts children.';
    if (r.adultsOnly) {
      if (r.minAge === null || youngest < r.minAge) {
        return r.minAge ? `Adults-only (${r.minAge}+).` : 'Adults-only.';
      }
    } else if (r.minAge !== null && youngest < r.minAge) {
      return `Guests must be ${r.minAge} or older.`;
    }
  } else if (a.adultsOnly === 'yes') {
    if (r.adultsOnly === null) return 'We could not confirm it is adults-only.';
    if (!r.adultsOnly) return 'Not adults-only.';
  }

  for (const db of a.dealbreakers) {
    switch (db) {
      case 'long-transfer':
        if (r.transfer?.minutes && r.transfer.minutes.max > LONG_TRANSFER_MINUTES) {
          return `Airport transfer can run ${r.transfer.minutes.max} minutes.`;
        }
        break;
      case 'mega-resort':
        if (r.roomCount !== null && r.roomCount > MEGA_RESORT_ROOMS) {
          return `Large resort (${r.roomCount.toLocaleString('en-US')} rooms).`;
        }
        break;
      case 'party-scene':
        if (r.atmosphere === 'social') return 'Known for an energetic, social scene.';
        break;
      case 'rough-beach':
        if (r.beach.swimmable === 'no') return 'The beach is not good for swimming.';
        break;
      case 'lots-of-kids':
        if (r.adultsOnly === false) return 'Welcomes children.';
        break;
    }
  }
  return null;
}

function rating(r: ResortRecord, p: Priority): number {
  // Unrated counts as average so a missing rating neither wins nor loses.
  return r.ratings[p] ?? 1.5;
}

/** Score on the traveler's stated priorities alone (weighted). */
export function priorityScore(a: TripAnswers, r: ResortRecord): number {
  return a.priorities.reduce((sum, p, i) => sum + (PRIORITY_WEIGHTS[i] ?? 1) * rating(r, p), 0);
}

function atmospherePoints(a: TripAnswers, r: ResortRecord): number {
  if (!a.atmosphere || a.atmosphere === 'unsure' || !r.atmosphere) return 0;
  if (a.atmosphere === r.atmosphere) return 3;
  if (a.atmosphere === 'balanced' || r.atmosphere === 'balanced') return 0;
  return -4; // quiet vs social
}

/** Guest reviews as a quality signal: neutral around 90/100, capped both ways. */
export function guestRatingPoints(r: ResortRecord): number {
  const g = r.guestRating;
  if (!g || (g.reviews !== null && g.reviews < 50)) return 0;
  return Math.max(-3, Math.min(4, (g.score - 90) / 2));
}

function partyPoints(a: TripAnswers, r: ResortRecord): number {
  let pts = 0;
  if (hasChildren(a)) pts += rating(r, 'family');
  if (a.adultsOnly === 'no' && r.adultsOnly === true) pts -= 2;
  if (!hasChildren(a) && a.party === 'couple' && r.adultsOnly === true && a.adultsOnly !== 'no') pts += 1;
  return pts;
}

interface Scored {
  resort: ResortRecord;
  score: number;
  pScore: number;
  budget: BudgetAssessment;
}

export function scoreResortFit(a: TripAnswers, r: ResortRecord): Scored {
  const budget = assessBudget(a, r);
  const pScore = priorityScore(a, r);
  const score = pScore + atmospherePoints(a, r) + partyPoints(a, r) + BUDGET_FIT_POINTS[budget.fit] + guestRatingPoints(r);
  return { resort: r, score, pScore, budget };
}

function compareScored(x: Scored, y: Scored): number {
  if (y.score !== x.score) return y.score - x.score;
  if ((x.resort.priceTier ?? 2) !== (y.resort.priceTier ?? 2)) return (x.resort.priceTier ?? 2) - (y.resort.priceTier ?? 2);
  return x.resort.id.localeCompare(y.resort.id);
}

// ─── Explanations ────────────────────────────────────────────

function transferText(r: ResortRecord): string | null {
  const t = r.transfer;
  if (!t?.minutes) return null;
  const { min, max } = t.minutes;
  // Sources rarely agree to the minute; a near-identical range reads as false precision.
  return max - min <= 5 ? `about ${max} minutes from ${t.airport}` : `about ${min} to ${max} minutes from ${t.airport}`;
}

/** Where a rating came from, in words a traveler can read. */
export function ratingSourceLabel(r: ResortRecord): string {
  return r.ratingSource === 'vacationpro' ? 'VacationPro rating' : 'community resort guide';
}

function guestRatingText(r: ResortRecord): string | null {
  const g = r.guestRating;
  if (!g || (g.reviews !== null && g.reviews < 50)) return null;
  const n = g.reviews ? ` from about ${Math.round(g.reviews).toLocaleString('en-US')} reviews` : '';
  return `Guest reviews average ${Math.round(g.score)}/100${n}.`;
}

function whyItFits(a: TripAnswers, s: Scored): string[] {
  const r = s.resort;
  const out: string[] = [];
  const src = ratingSourceLabel(r);
  for (const p of a.priorities) {
    const v = r.ratings[p];
    if (v === 3) out.push(`A standout for ${PRIORITY_LABELS[p]}, one of your top priorities (${src}).`);
    else if (v === 2) out.push(`Strong on ${PRIORITY_LABELS[p]}, one of your top priorities (${src}).`);
  }
  const gr = guestRatingText(r);
  if (gr && r.guestRating!.score >= 92) out.push(gr);
  if (a.atmosphere && a.atmosphere !== 'unsure' && r.atmosphere === a.atmosphere) {
    out.push(`Its ${ATMOSPHERE_LABELS[r.atmosphere]} atmosphere matches the vibe you asked for.`);
  }
  if (!hasChildren(a) && a.adultsOnly === 'yes' && r.adultsOnly) {
    out.push(r.minAge ? `Adults-only (${r.minAge}+), as you asked.` : 'Adults-only, as you asked.');
  }
  if (hasChildren(a)) {
    if (r.hasKidsClub) out.push('Has a kids club.');
    if (r.hasWaterPark) out.push('Has a water park or splash area on site.');
  }
  const tt = transferText(r);
  if (tt && r.transfer!.minutes!.max <= 30) out.push(`Short transfer, ${tt}.`);
  if (s.budget.fit === 'comfortable' || s.budget.fit === 'workable') out.push('Estimated to fit your budget.');
  if (out.length === 0) out.push('Meets every requirement you set, with no conflicts on your dealbreakers.');
  return out.slice(0, 4);
}

function tradeoff(a: TripAnswers, s: Scored): string {
  const r = s.resort;
  const weak = a.priorities.find((p) => r.ratings[p] !== null && (r.ratings[p] as number) <= 1);
  if (weak) return `Weaker on ${PRIORITY_LABELS[weak]}, which is one of your priorities.`;
  if (r.transfer?.minutes && r.transfer.minutes.max > LONG_TRANSFER_MINUTES) {
    return `Longer airport transfer, ${transferText(r)}.`;
  }
  if (s.budget.fit === 'stretch' || s.budget.fit === 'over') return s.budget.explanation;
  if (r.guestRating && r.guestRating.score < 85 && (r.guestRating.reviews ?? 0) >= 50) {
    return `Guest reviews are mixed, averaging ${Math.round(r.guestRating.score)}/100.`;
  }
  if (r.beach.swimmable === 'mixed') return r.beach.notes ?? 'Beach swimming conditions vary.';
  if (r.exclusions.length > 0) return `Not everything is included: ${r.exclusions[0]}.`;
  const candidates = (Object.keys(r.ratings) as Priority[])
    .filter((p) => r.ratings[p] !== null && !(p === 'family' && !hasChildren(a)))
    .sort((x, y) => (r.ratings[x] as number) - (r.ratings[y] as number));
  if (candidates.length > 0 && (r.ratings[candidates[0]] as number) <= 1) {
    return `Less of a standout for ${PRIORITY_LABELS[candidates[0]]}.`;
  }
  return 'No major tradeoff on file. Ask for current guest feedback before you book.';
}

function skipIf(a: TripAnswers, r: ResortRecord): string {
  if (r.couplesOnly) return 'You are not traveling as a couple. It is couples only.';
  if (r.adultsOnly) {
    return r.minAge
      ? `You are traveling with anyone under ${r.minAge}.`
      : 'You are traveling with children.';
  }
  if (r.atmosphere === 'social') return 'You want a quiet, low-key week.';
  if (r.atmosphere === 'quiet') return 'You want nightlife and a busy pool scene.';
  if (r.roomCount !== null && r.roomCount > MEGA_RESORT_ROOMS) return 'Big resorts with long walks bother you.';
  if (r.adultsOnly === false && r.minAge !== null) return `You are traveling with anyone under ${r.minAge}.`;
  if (r.adultsOnly === false && (r.ratings.family ?? 0) >= 2) return 'You want a kid-free atmosphere.';
  const weakest = (Object.keys(r.ratings) as Priority[])
    .filter((p) => r.ratings[p] !== null)
    .sort((x, y) => (r.ratings[x] as number) - (r.ratings[y] as number))[0];
  return weakest ? `${capitalize(PRIORITY_LABELS[weakest])} matters more to you than anything else.` : 'Something about it does not suit you after reading the details.';
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function roomGuidance(a: TripAnswers): string {
  const people = travelerCount(a);
  if (a.rooms > 1) {
    return `Ask about connecting or adjacent rooms for your ${a.rooms} rooms, and check each category's maximum occupancy.`;
  }
  if (a.childAges.length > 0) {
    return `Check the room category's maximum occupancy for ${people} travelers before you book. Family and suite categories vary a lot by resort.`;
  }
  if (a.priorities.includes('rooms')) {
    return 'Since rooms matter to you, compare categories on size, view, and building location. Higher categories can add club-level perks, so ask what each one includes.';
  }
  return 'Entry-level rooms usually work well. Higher categories can add views, swim-up access, or club perks, so ask what each one includes before paying more.';
}

function unknowns(a: TripAnswers, r: ResortRecord): string[] {
  const out: string[] = [];
  if (!r.transfer?.minutes) out.push('Airport transfer time');
  if (r.beach.swimmable === null && (a.priorities.includes('beach') || a.dealbreakers.includes('rough-beach'))) {
    out.push('Beach swimming conditions');
  }
  if (r.roomCount === null && a.dealbreakers.includes('mega-resort')) out.push('Resort size');
  if (r.adultsOnly === null) out.push('Age policy');
  for (const p of a.priorities) if (r.ratings[p] === null) out.push(`How it rates for ${PRIORITY_LABELS[p]}`);
  if (r.priceTier === null) out.push('Price range');
  return out;
}

function toRecommendation(role: RecommendationRole, a: TripAnswers, s: Scored): Recommendation {
  return {
    role,
    resort: s.resort,
    whyItFits: whyItFits(a, s),
    tradeoff: tradeoff(a, s),
    skipIf: skipIf(a, s.resort),
    roomGuidance: roomGuidance(a),
    budget: s.budget,
    unknowns: unknowns(a, s.resort),
  };
}

// ─── Main entry ──────────────────────────────────────────────

export function matchResorts(a: TripAnswers, catalog: ResortRecord[]): MatchResult {
  const excluded: ExcludedResort[] = [];
  const eligible: Scored[] = [];

  for (const r of catalog) {
    if (r.status !== 'active') continue;
    const reason = exclusionReason(a, r);
    if (reason) excluded.push({ resort: r, reason });
    else eligible.push(scoreResortFit(a, r));
  }
  eligible.sort(compareScored);

  const limitations: string[] = [];
  const recommendations: Recommendation[] = [];

  if (eligible.length === 0) {
    const inDestination = a.destination && a.destination !== 'open'
      ? catalog.filter((r) => r.status === 'active' && r.destination === a.destination).length
      : null;
    if (inDestination === 0) {
      limitations.push('We do not have verified resort details for that destination yet. Brendan can still quote it for you.');
    } else {
      limitations.push('No resort in our catalog meets every requirement you set. Try relaxing a dealbreaker or the adults-only setting.');
    }
    return { recommendations, rankedIds: [], excluded, limitations };
  }

  const overall = eligible[0];
  recommendations.push(toRecommendation('best-overall', a, overall));
  const used = new Set([overall.resort.id]);
  const notOver = (s: Scored) => s.budget.fit !== 'over';

  // Cost comparisons use the dated reference price when we have one, else
  // the editorial tier midpoint (see priceIndex). A 10% gap is required so
  // near-identical prices are not presented as a value or upgrade choice.
  // Roles that compare cost need a cost estimate on both sides; unknown
  // prices never count as "cheaper" or "pricier".
  const overallCost = priceIndex(overall.resort);
  const cost = (s: Scored) => priceIndex(s.resort);
  const cheaper = overallCost === null ? undefined : eligible.find((s) => {
    const c = cost(s);
    return !used.has(s.resort.id) && c !== null && c < overallCost * 0.9 && notOver(s);
  });
  const betterValue = overallCost === null ? undefined : eligible.find((s) => {
    const c = cost(s);
    return !used.has(s.resort.id) && c !== null && c <= overallCost &&
      (s.resort.ratings.value ?? 0) > (overall.resort.ratings.value ?? 0) && notOver(s);
  });
  const value = cheaper ?? betterValue;
  if (value) {
    recommendations.push(toRecommendation('best-value', a, value));
    used.add(value.resort.id);
  }

  // An upgrade is only "worth it" when it is stronger on what the traveler
  // said matters and is not estimated to blow the budget.
  const upgrade = overallCost === null ? undefined : eligible.find((s) => {
    const c = cost(s);
    return !used.has(s.resort.id) && c !== null && c > overallCost * 1.1 && s.pScore > overall.pScore && notOver(s);
  });
  if (upgrade) {
    recommendations.push(toRecommendation('worth-the-upgrade', a, upgrade));
    used.add(upgrade.resort.id);
  }

  // Remaining slots go to the next-best distinct resorts, but only when they
  // genuinely score close to the top pick. Not forced: a weak fourth-place
  // resort is left out rather than padded in.
  for (const s of eligible) {
    if (recommendations.length >= 3) break;
    if (used.has(s.resort.id) || s.score < overall.score - ALSO_STRONG_MARGIN) continue;
    recommendations.push(toRecommendation('also-strong', a, s));
    used.add(s.resort.id);
  }

  if (recommendations.length < 3) {
    if (eligible.length === 1) {
      limitations.push('Only one resort in our catalog meets all of your requirements.');
    } else {
      limitations.push('Other eligible resorts were a noticeably weaker fit, so we kept the list short. You can still compare them below.');
    }
  }

  return {
    recommendations,
    rankedIds: eligible.map((s) => s.resort.id),
    excluded,
    limitations,
  };
}

// ─── Trip-independent profile (resort pages, comparisons) ────

export interface ResortProfile {
  strengths: string[];
  tradeoffs: string[];
  skipIf: string;
  bestFor: string;
}

const RATING_WORD: Record<number, string> = { 3: 'Standout', 2: 'Strong', 1: 'Average', 0: 'Not a focus' };

export function ratingWord(v: number | null): string {
  return v === null ? 'Not rated yet' : RATING_WORD[v] ?? 'Not rated yet';
}

/** Strengths, tradeoffs and fit, from stored facts and editorial ratings only. */
export function describeResort(r: ResortRecord): ResortProfile {
  const rated = (Object.keys(r.ratings) as Priority[]).filter((p) => r.ratings[p] !== null && !(p === 'family' && r.adultsOnly));
  const src = ratingSourceLabel(r);
  const strengths = rated.filter((p) => r.ratings[p] === 3).map((p) => `Standout for ${PRIORITY_LABELS[p]} (${src}).`);
  if (strengths.length === 0) {
    strengths.push(...rated.filter((p) => r.ratings[p] === 2).slice(0, 2).map((p) => `Strong on ${PRIORITY_LABELS[p]} (${src}).`));
  }
  const gr = guestRatingText(r);
  if (gr && r.guestRating!.score >= 92) strengths.push(gr);
  if (r.transfer?.minutes && r.transfer.minutes.max <= 30) strengths.push(`Short transfer, ${transferText(r)}.`);
  if (r.hasKidsClub && !r.adultsOnly) strengths.push('Has a kids club.');

  const tradeoffs: string[] = [];
  for (const p of rated) if ((r.ratings[p] as number) <= 1) tradeoffs.push(`Less of a standout for ${PRIORITY_LABELS[p]}.`);
  if (r.transfer?.minutes && r.transfer.minutes.max > LONG_TRANSFER_MINUTES) tradeoffs.push(`Longer transfer, ${transferText(r)}.`);
  if (r.roomCount !== null && r.roomCount > MEGA_RESORT_ROOMS) tradeoffs.push(`Large resort with about ${r.roomCount.toLocaleString('en-US')} rooms.`);
  for (const x of r.exclusions.slice(0, 2)) tradeoffs.push(`Not included: ${x}.`);
  if (r.guestRating && r.guestRating.score < 85 && (r.guestRating.reviews ?? 0) >= 50) tradeoffs.push(`Guest reviews are mixed, averaging ${Math.round(r.guestRating.score)}/100.`);

  const who = r.couplesOnly
    ? 'Couples who want a couples-only resort'
    : r.adultsOnly
    ? r.atmosphere === 'social'
      ? 'Couples and friends who want an adults-only resort with energy'
      : 'Couples who want an adults-only, calmer stay'
    : (r.ratings.family ?? 0) >= 2
      ? 'Families who want kid-friendly amenities'
      : r.atmosphere === 'social'
        ? 'Groups who want a busy, social resort'
        : 'Travelers who want an easygoing all-ages resort';

  const standouts = rated
    .filter((p) => p !== 'family' && (r.ratings[p] as number) >= 2)
    .sort((x, y) => (r.ratings[y] as number) - (r.ratings[x] as number))
    .slice(0, 2)
    .map((p) => PRIORITY_LABELS[p]);
  const bestFor = standouts.length ? `${who}, with strong ${standouts.join(' and ')}` : who;

  return { strengths: strengths.slice(0, 4), tradeoffs: tradeoffs.slice(0, 4), skipIf: skipIf({ childAges: [], adultsOnly: null } as unknown as TripAnswers, r), bestFor };
}
