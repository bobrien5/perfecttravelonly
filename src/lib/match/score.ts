import { BUDGET_BANDS, DestinationProfile, Match, MatchReason, QuizAnswers } from './types';
import { DESTINATION_PROFILES } from './destinations';

type Dates = QuizAnswers['dates'];

function monthsBetween(startStr: string, endStr: string): number[] {
  const start = new Date(`${startStr}T00:00:00Z`);
  const end = new Date(`${endStr}T00:00:00Z`);
  const months = new Set<number>();

  let y = start.getUTCFullYear();
  let m = start.getUTCMonth(); // 0-indexed
  const endY = end.getUTCFullYear();
  const endM = end.getUTCMonth();

  // Guard against inverted ranges or unparseable dates.
  if (Number.isNaN(y) || Number.isNaN(endY)) return [];

  let guard = 0;
  while ((y < endY || (y === endY && m <= endM)) && guard < 24) {
    months.add((m % 12) + 1);
    m++;
    if (m > 11) {
      m = 0;
      y++;
    }
    guard++;
  }
  return Array.from(months);
}

/**
 * Derives the list of target calendar months (1-12) implied by the
 * quiz's date answer. `now` is injected so 'next3' is deterministic in tests.
 */
export function targetMonths(dates: Dates, now: Date = new Date()): number[] {
  if (!dates) return [];

  if ('start' in dates && 'end' in dates) {
    return monthsBetween(dates.start, dates.end);
  }

  if ('season' in dates) {
    switch (dates.season) {
      case 'winter':
        return [12, 1, 2];
      case 'spring':
        return [3, 4, 5];
      case 'summer':
        return [6, 7, 8];
      case 'fall':
        return [9, 10, 11];
      case 'next3': {
        const cur = now.getMonth(); // 0-indexed current month
        const result: number[] = [];
        for (let i = 1; i <= 3; i++) {
          result.push(((cur + i) % 12) + 1);
        }
        return result;
      }
      case 'anytime':
        return [];
      default:
        return [];
    }
  }

  return [];
}

const VIBE_LABELS: Record<string, string> = {
  beach: 'Beautiful beaches',
  nightlife: 'Plenty of nightlife',
  food: 'Standout food scene',
  luxury: 'True luxury resorts',
  value: 'Strong value for money',
  snorkeling: 'Great snorkeling',
  relaxing: 'Easy to fully unwind',
  romantic: 'Built for a romantic trip',
  kids: 'Great for kids',
  kidsclub: 'Great for kids',
  waterpark: 'Great for kids',
  explore: 'Lots to explore nearby',
  nature: 'Beautiful nature',
  pool: 'Lively pool scene',
  entertainment: 'Entertainment every night',
  easytravel: 'Easy to get to and around',
  seclusion: 'Feels secluded',
  privatepools: 'Private pool suites',
  familysuites: 'Rooms that fit the family',
};

const STYLE_LABELS: Record<string, string> = {
  allinclusive: 'all-inclusive',
  luxuryresort: 'luxury resort',
  boutique: 'boutique hotel',
  beachfront: 'beachfront',
  adultsonly: 'adults-only',
  familyresort: 'family resort',
  nearnightlife: 'near the nightlife',
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface ScoredReason extends MatchReason {
  points: number;
}

function hitsDealbreaker(answers: QuizAnswers, profile: DestinationProfile): boolean {
  for (const db of answers.dealbreakers) {
    switch (db) {
      case 'party':
        if (profile.flags.party) return true;
        break;
      case 'seaweed':
        if (profile.flags.seaweed) return true;
        break;
      case 'mega':
        if (profile.flags.mega) return true;
        break;
      case 'remote':
        if (profile.flags.remote) return true;
        break;
      case 'touristy':
        if (profile.flags.touristy) return true;
        break;
      case 'cruise':
        if (profile.flags.cruise) return true;
        break;
      case 'longtransfer':
        if (profile.flags.longtransfer) return true;
        break;
      case 'connection':
        if (!profile.nonstopEastCoast) return true;
        break;
      case 'tooquiet':
        if (profile.flags.quiet) return true;
        break;
      case 'kids':
        if ((profile.vibes.kids ?? 0) >= 2) return true;
        break;
    }
  }
  return false;
}

/**
 * Scores how well a destination profile fits the quiz answers.
 * Returns null when a selected dealbreaker excludes the destination.
 * `reasons` is left empty here; Task 4 attaches human-readable reasons.
 */
export function scoreDestination(
  answers: QuizAnswers,
  profile: DestinationProfile,
  now: Date = new Date(),
): Match | null {
  if (hitsDealbreaker(answers, profile)) return null;

  let score = 50;
  const scoredReasons: ScoredReason[] = [];

  // Vibes: up to 6 points per selected vibe, scaled by the profile's fit strength (0-3).
  for (const v of answers.vibes) {
    const weight = profile.vibes[v] ?? 0;
    const points = (6 * weight) / 3;
    score += points;
    if (weight > 0) {
      const label = VIBE_LABELS[v];
      if (label) scoredReasons.push({ text: label, source: 'vibes', points });
    }
  }

  // Resort style: +5 per selected style the profile offers. Skip entirely on 'nopref'.
  let styleHitLogged = false;
  if (!answers.styles.includes('nopref')) {
    for (const s of answers.styles) {
      if (profile.styles.includes(s as DestinationProfile['styles'][number])) {
        score += 5;
        if (!styleHitLogged) {
          const label = STYLE_LABELS[s];
          if (label) {
            scoredReasons.push({ text: `Strong ${label} options`, source: 'styles', points: 5 });
            styleHitLogged = true;
          }
        }
      }
    }
  }

  // Budget: exact band match, adjacent band, or mismatch.
  if (answers.budget) {
    const band = answers.budget.band;
    if (profile.budgetBands.includes(band)) {
      score += 8;
      const bandInfo = BUDGET_BANDS.find((b) => b.band === band);
      if (bandInfo) {
        scoredReasons.push({ text: `Fits your ${bandInfo.label} budget`, source: 'budget', points: 8 });
      }
    } else if (profile.budgetBands.some((b) => Math.abs(b - band) === 1)) {
      score += 3;
    } else {
      score -= 10;
    }
  }

  // Season: bonus for landing in the destination's best months, penalty for hurricane months.
  const months = targetMonths(answers.dates, now);
  if (months.length > 0) {
    const bestHits = months.filter((m) => profile.bestMonths.includes(m));
    if (bestHits.length > 0) {
      score += 6;
      let label: string;
      if (answers.dates && 'season' in answers.dates && answers.dates.season !== 'next3') {
        label = answers.dates.season.charAt(0).toUpperCase() + answers.dates.season.slice(1);
      } else {
        label = MONTH_NAMES[bestHits[0] - 1];
      }
      scoredReasons.push({ text: `Great ${label} weather`, source: 'dates', points: 6 });
    }
    if (months.some((m) => profile.hurricaneMonths.includes(m))) score -= 8;
  }

  // Flights: only relevant when an origin airport was given.
  if (answers.origin && answers.origin !== 'flexible') {
    let flightPoints = 0;
    const isNonstop = profile.nonstopEastCoast;
    if (isNonstop) {
      score += 5;
      flightPoints += 5;
    }
    if (profile.typicalFlightHours <= 4) {
      score += 3;
      flightPoints += 3;
    }
    if (isNonstop) {
      scoredReasons.push({ text: 'Easy flight options', source: 'origin', points: flightPoints });
    }
  }

  // Sliders: pace and exploration nudge the score toward matching vibe strengths.
  const entertainment = profile.vibes.entertainment ?? 0;
  const nightlife = profile.vibes.nightlife ?? 0;
  const explore = profile.vibes.explore ?? 0;
  const relaxing = profile.vibes.relaxing ?? 0;
  const pool = profile.vibes.pool ?? 0;

  if (answers.pace > 70 && entertainment + nightlife + explore >= 5) score += 3;
  if (answers.pace < 30 && relaxing >= 2) score += 3;
  if (answers.exploration > 70 && explore >= 2) score += 3;
  if (answers.exploration < 30 && (pool >= 2 || relaxing >= 2)) score += 3;

  const pct = Math.max(40, Math.min(99, Math.round(score)));

  const reasons = scoredReasons
    .sort((a, b) => b.points - a.points)
    .slice(0, 5)
    .map(({ text, source }) => ({ text, source }));

  return { profile, pct, reasons };
}

export function rankMatches(answers: QuizAnswers, now: Date = new Date()): Match[] {
  return DESTINATION_PROFILES
    .map((p) => scoreDestination(answers, p, now))
    .filter((m): m is Match => m !== null)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 8);
}
