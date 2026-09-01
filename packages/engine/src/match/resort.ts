import { Dealbreaker, ResortStyle, Vibe } from './types';
import { VIBE_LABELS } from './score';

/**
 * Mirrors the Sanity `resort` document shape (Task 6), flattened to plain
 * TypeScript values. `vibeScores` is the already-parsed JSON object (the
 * Sanity field itself is a stringified JSON text field; parsing happens in
 * the fetch helper, not here, so this module stays pure).
 */
export interface ResortAttrs {
  slug: string;
  name: string;
  destinationSlug: string;
  priceBand: 1 | 2 | 3;
  styles: ResortStyle[];
  vibeScores: Partial<Record<Vibe, number>>;
  adultsOnly: boolean;
  allInclusive: boolean;
  verdict: string;
  expediaUrl: string;
  heroImageUrl?: string;
}

/**
 * The subset of a trips row that resort scoring needs. Deliberately not
 * `Trip` from data.ts (which has DB-only fields like id/user_id) so this
 * module has no dependency on the app's Supabase types.
 */
export interface ResortTripInput {
  vibes: Vibe[];
  styles?: ResortStyle[];
  dealbreakers: Dealbreaker[];
  budgetBand: number | null;
  party: string | null;
}

export interface ScoredResort {
  pct: number;
  fitChips: string[];
}

/**
 * Maps a trip's 1-5 budget band onto the resort's 1-3 priceBand scale.
 * Bands 1-2 want the cheapest tier, 3 wants the middle tier, 4-5 want the
 * top tier.
 */
function targetPriceBand(budgetBand: number): 1 | 2 | 3 {
  if (budgetBand <= 2) return 1;
  if (budgetBand === 3) return 2;
  return 3;
}

/**
 * Scores how well a resort fits a trip. Returns null when a selected
 * dealbreaker (or the trip's party) excludes the resort outright.
 *
 * Rules (binding, see task-7-brief.md):
 * - base 50
 * - +6 * (vibeScores[v] ?? 0) / 3 per trip vibe
 * - budget: exact band fit +8, adjacent +3, mismatch -8; null band, no adjustment
 * - dealbreaker 'kids': honeymoon party excludes non-adults-only resorts;
 *   otherwise -6 for non-adults-only resorts
 * - dealbreaker 'party': excludes resorts with vibeScores.nightlife >= 3
 * - party 'family': excludes adultsOnly resorts
 * - clamp 40-99, rounded
 */
export function scoreResort(trip: ResortTripInput, resort: ResortAttrs): ScoredResort | null {
  const dealbreakers = trip.dealbreakers ?? [];

  if (trip.party === 'family' && resort.adultsOnly) return null;

  if (dealbreakers.includes('party') && (resort.vibeScores.nightlife ?? 0) >= 3) return null;

  const kidsIsDealbreaker = dealbreakers.includes('kids');
  if (kidsIsDealbreaker && trip.party === 'honeymoon' && !resort.adultsOnly) return null;

  let score = 50;

  for (const v of trip.vibes) {
    const weight = resort.vibeScores[v] ?? 0;
    score += (6 * weight) / 3;
  }

  let exactBudgetFit = false;
  if (trip.budgetBand !== null) {
    const target = targetPriceBand(trip.budgetBand);
    if (resort.priceBand === target) {
      score += 8;
      exactBudgetFit = true;
    } else if (Math.abs(resort.priceBand - target) === 1) {
      score += 3;
    } else {
      score -= 8;
    }
  }

  if (kidsIsDealbreaker && trip.party !== 'honeymoon' && !resort.adultsOnly) {
    score -= 6;
  }

  const pct = Math.max(40, Math.min(99, Math.round(score)));

  const fitChips: string[] = [];
  if (resort.adultsOnly) fitChips.push('Adults-only');
  if (resort.allInclusive) fitChips.push('All-inclusive');
  if (exactBudgetFit) fitChips.push('Fits your budget');

  if (fitChips.length < 4) {
    const matchedVibes = trip.vibes
      .map((v) => ({ v, weight: resort.vibeScores[v] ?? 0 }))
      .filter(({ weight }) => weight > 0)
      .sort((a, b) => b.weight - a.weight);

    for (const { v } of matchedVibes) {
      if (fitChips.length >= 4) break;
      const label = VIBE_LABELS[v];
      if (label && !fitChips.includes(label)) fitChips.push(label);
    }
  }

  return { pct, fitChips: fitChips.slice(0, 4) };
}

export interface RankedResort extends ScoredResort {
  slug: string;
  resort: ResortAttrs;
}

/**
 * Scores every resort against the trip, drops excluded (null) resorts, and
 * sorts by pct desc, then slug asc for deterministic ordering.
 */
export function rankResorts(trip: ResortTripInput, resorts: ResortAttrs[]): (ScoredResort & { slug: string; resort: ResortAttrs })[] {
  return resorts
    .map((resort) => {
      const scored = scoreResort(trip, resort);
      return scored ? { ...scored, slug: resort.slug, resort } : null;
    })
    .filter((r): r is ScoredResort & { slug: string; resort: ResortAttrs } => r !== null)
    .sort((a, b) => {
      if (b.pct !== a.pct) return b.pct - a.pct;
      return a.slug.localeCompare(b.slug);
    });
}
