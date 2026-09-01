import { createServerSupabase } from '@/lib/supabase/server';

/**
 * The six steps of a trip's checklist, in the fixed order they render on
 * /trips/[id]. Mirrors the jsonb keys on the trips.checklist column
 * (sql/trip_hub.sql).
 */
export type StepKey = 'destination' | 'resort' | 'flights' | 'things' | 'itinerary' | 'book';

export type Checklist = Record<StepKey, boolean>;

const STEP_KEYS: StepKey[] = ['destination', 'resort', 'flights', 'things', 'itinerary', 'book'];

/**
 * Row shape for a trip as read from Supabase. Matches the trips table
 * columns (sql/trip_hub.sql).
 */
export interface Trip {
  id: string;
  user_id: string;
  destination_slug: string;
  season: string | null;
  date_start: string | null;
  date_end: string | null;
  party: string | null;
  budget_band: number | null;
  vibes: string[];
  dealbreakers: string[];
  resort_slug: string | null;
  checklist: Checklist;
  created_at: string;
  updated_at: string;
}

/**
 * Toggles a single step of a checklist to the given value, returning a NEW
 * object. The input is never mutated. An unknown step is a no-op: the input
 * is returned unchanged (same values; a route validating against StepKey
 * should never reach this case, but data.ts stays defensive on its own).
 */
export function toggleChecklist(checklist: Checklist, step: StepKey, value: boolean): Checklist {
  if (!STEP_KEYS.includes(step)) {
    return checklist;
  }
  return { ...checklist, [step]: value };
}

/**
 * Counts how many of the six checklist steps are done.
 */
export function checklistProgress(checklist: Checklist): { done: number; total: 6 } {
  const done = STEP_KEYS.reduce((count, key) => (checklist[key] ? count + 1 : count), 0);
  return { done, total: 6 };
}

/**
 * Fetches all trips belonging to the signed-in user, newest first. Uses the
 * RLS-scoped server client, so a missing table or any read error is
 * swallowed and returns an empty array rather than crashing the page (the
 * trips table may not exist yet in every environment).
 */
export async function getTripsForUser(): Promise<Trip[]> {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as Trip[];
  } catch {
    return [];
  }
}

/**
 * Fetches a single trip by id via the RLS-scoped server client. Returns null
 * when the trip does not exist, does not belong to the signed-in user (RLS
 * hides it), or any read error occurs (including a missing table).
 */
export async function getTrip(id: string): Promise<Trip | null> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.from('trips').select('*').eq('id', id).maybeSingle();

    if (error || !data) return null;
    return data as Trip;
  } catch {
    return null;
  }
}
