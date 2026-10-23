import type { BudgetAssessment, BudgetFit, ResortRecord, TripAnswers } from './types';

/**
 * Planning assumptions behind every budget estimate. These are VacationPro
 * editorial estimates, not prices: there is no live rate feed. They are kept
 * in one place so they can be tuned without touching the matcher, and every
 * assessment the UI shows says it is an estimate.
 *
 * TIER_NIGHTLY_USD: typical all-inclusive cost per room per night for two
 * adults, by the resort's editorial price tier.
 * FLIGHT_ALLOWANCE_USD: amount set aside per traveler when the traveler's
 * budget also has to cover flights. Deliberately a flat assumption; we have no
 * airfare data and say so.
 */
export const BUDGET_ASSUMPTIONS = {
  tierNightlyUsd: {
    1: { low: 300, high: 500 },
    2: { low: 500, high: 800 },
    3: { low: 800, high: 1400 },
  } as Record<1 | 2 | 3, { low: number; high: number }>,
  flightAllowanceUsdPerTraveler: 600,
  basis: 'per room, per night, two adults',
} as const;

export function tripNights(dates: TripAnswers['dates']): number | null {
  if (!dates) return null;
  if (dates.mode === 'flexible') return dates.nights > 0 ? dates.nights : null;
  const start = Date.parse(`${dates.checkIn}T00:00:00Z`);
  const end = Date.parse(`${dates.checkOut}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  const nights = Math.round((end - start) / 86_400_000);
  return nights > 0 ? nights : null;
}

export function travelerCount(answers: Pick<TripAnswers, 'adults' | 'childAges'>): number {
  return answers.adults + answers.childAges.length;
}

export interface HotelBudget {
  perRoomNight: number;
  flightsDeducted: number;
  flightsAssumed: boolean;
}

/**
 * Works out how much of the stated budget is plausibly left for the resort,
 * per room per night. Returns a reason string instead when it cannot.
 */
export function hotelBudget(answers: TripAnswers): HotelBudget | { unknown: string } {
  const b = answers.budget;
  if (!b || b.amount === null) return { unknown: 'No budget given, so budget fit is not assessed.' };
  if (b.currency !== 'USD') {
    return { unknown: `Budget fit is only estimated in USD for now, so we did not assess your ${b.currency} budget.` };
  }
  const nights = tripNights(answers.dates);
  if (!nights) return { unknown: 'Without a trip length we cannot estimate budget fit.' };

  // Unsure whether flights are in the budget: assume they are. Treating the
  // whole amount as hotel money would overstate what the traveler can afford.
  const flightsAssumed = b.includesFlights !== false;
  const flightsDeducted = flightsAssumed
    ? travelerCount(answers) * BUDGET_ASSUMPTIONS.flightAllowanceUsdPerTraveler
    : 0;
  const hotelMoney = b.amount - flightsDeducted;
  const rooms = Math.max(1, answers.rooms);
  return { perRoomNight: hotelMoney / rooms / nights, flightsDeducted, flightsAssumed };
}

function fitAgainstTier(perRoomNight: number, tier: 1 | 2 | 3): BudgetFit {
  const { low, high } = BUDGET_ASSUMPTIONS.tierNightlyUsd[tier];
  if (perRoomNight >= high) return 'comfortable';
  if (perRoomNight >= (low + high) / 2) return 'workable';
  if (perRoomNight >= low * 0.85) return 'stretch';
  return 'over';
}

const FIT_WORDS: Record<BudgetFit, string> = {
  comfortable: 'Estimated to fit your budget comfortably',
  workable: 'Estimated to fit your budget',
  stretch: 'Estimated to be a stretch for your budget',
  over: 'Estimated to be over your budget',
  unknown: 'Budget fit not estimated',
};

function usd(n: number): string {
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

export function assessBudget(answers: TripAnswers, resort: ResortRecord): BudgetAssessment {
  const hb = hotelBudget(answers);
  if ('unknown' in hb) {
    return { fit: 'unknown', explanation: hb.unknown, perRoomNightEstimate: null };
  }
  if (hb.perRoomNight <= 0) {
    return {
      fit: 'over',
      explanation: `After setting aside about ${usd(hb.flightsDeducted)} for flights, there is little left for the resort. Estimate only.`,
      perRoomNightEstimate: 0,
    };
  }

  let available = `That leaves roughly ${usd(hb.perRoomNight)} per room per night for the resort`;
  if (hb.flightsAssumed) available += ` after setting aside about ${usd(hb.flightsDeducted)} for flights`;

  const ref = referenceNightly(resort);
  if (ref !== null && resort.price) {
    // A dated reference price beats the tier guess, but it is still a past
    // price for a stated occupancy, so the explanation says exactly that.
    const fit = fitAgainstReference(hb.perRoomNight, ref);
    const p = resort.price;
    const parts = [
      `${FIT_WORDS[fit]}.`,
      `${available}, against a reference rate of about ${usd(ref)} per night (${usd(p.amount)} for ${p.nights} nights, ${p.occupancy}, ${p.travelDates}, checked ${p.checkedAt}).`,
    ];
    const perRoomAdults = answers.adults / Math.max(1, answers.rooms);
    const perRoomKids = answers.childAges.length / Math.max(1, answers.rooms);
    if (perRoomAdults !== p.occupancyCounts.adults || perRoomKids !== p.occupancyCounts.children) {
      parts.push('Your group differs from that occupancy, so your rate will too.');
    }
    parts.push('Estimate only, not a live rate.');
    return { fit, explanation: parts.join(' '), perRoomNightEstimate: Math.round(hb.perRoomNight) };
  }

  const fit = fitAgainstTier(hb.perRoomNight, resort.priceTier);
  const { low, high } = BUDGET_ASSUMPTIONS.tierNightlyUsd[resort.priceTier];
  const parts = [
    `${FIT_WORDS[fit]}.`,
    `${available}, against a typical ${usd(low)} to ${usd(high)} for resorts in this price range.`,
    'This is our planning estimate, not a live rate.',
  ];
  return { fit, explanation: parts.join(' '), perRoomNightEstimate: Math.round(hb.perRoomNight) };
}

/** Reference price per night in USD, when a USD reference price exists. */
export function referenceNightly(resort: ResortRecord): number | null {
  const p = resort.price;
  if (!p || p.currency !== 'USD' || p.nights <= 0) return null;
  return p.amount / p.nights;
}

function fitAgainstReference(perRoomNight: number, refNightly: number): BudgetFit {
  const ratio = perRoomNight / refNightly;
  if (ratio >= 1.3) return 'comfortable';
  if (ratio >= 1.0) return 'workable';
  if (ratio >= 0.8) return 'stretch';
  return 'over';
}

/**
 * Comparable cost index for picking "best value" and "worth the upgrade":
 * the reference nightly price when known, else the tier's midpoint.
 */
export function priceIndex(resort: ResortRecord): number {
  const ref = referenceNightly(resort);
  if (ref !== null) return ref;
  const { low, high } = BUDGET_ASSUMPTIONS.tierNightlyUsd[resort.priceTier];
  return (low + high) / 2;
}

/** Penalty/bonus the ranker applies for budget fit. Unknown is neutral. */
export const BUDGET_FIT_POINTS: Record<BudgetFit, number> = {
  comfortable: 2,
  workable: 2,
  stretch: -2,
  over: -8,
  unknown: 0,
};
