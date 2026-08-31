import { QuizAnswers } from '@vacationpro/engine';

/**
 * Mirrors the trips table columns (sql/trip_hub.sql). Pure mapping, no I/O:
 * the claim route (src/app/api/claim-session/route.ts) builds this and
 * inserts it as the authenticated user via the RLS server client.
 */
export interface TripInsert {
  destination_slug: string;
  season: string | null;
  date_start: string | null;
  date_end: string | null;
  party: string | null;
  budget_band: number | null;
  vibes: string[];
  dealbreakers: string[];
}

/**
 * Builds the trip insert payload from a quiz session.
 *
 * Destination precedence: Path B's explicit `destinationSlug` wins, else the
 * session's stored top match slug, else this throws (a session can only be
 * claimed once it actually has a destination to save).
 */
export function sessionToTripPayload(
  answers: QuizAnswers,
  topMatch: { slug: string } | null,
  destinationSlug?: string
): TripInsert {
  const resolvedSlug = destinationSlug ?? topMatch?.slug;
  if (!resolvedSlug) {
    throw new Error('sessionToTripPayload: no destination slug (neither destinationSlug nor topMatch was provided).');
  }

  const dates = answers.dates;
  const season = dates && 'season' in dates ? dates.season : null;
  const dateStart = dates && 'start' in dates ? dates.start : null;
  const dateEnd = dates && 'end' in dates ? dates.end : null;

  return {
    destination_slug: resolvedSlug,
    season,
    date_start: dateStart,
    date_end: dateEnd,
    party: answers.party ?? null,
    budget_band: answers.budget?.band ?? null,
    vibes: answers.vibes,
    dealbreakers: answers.dealbreakers,
  };
}
