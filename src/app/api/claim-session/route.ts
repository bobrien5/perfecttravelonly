import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { supabase as serviceSupabase } from '@/lib/supabase/client';
import { sessionToTripPayload } from '@/lib/trips/mapping';
import { UUID_RE } from '@/app/api/quiz-session/validate';
import { QuizAnswers } from '@vacationpro/engine';

interface ClaimSessionBody {
  sessionId?: unknown;
}

interface QuizSessionRow {
  session_id: string;
  answers: QuizAnswers;
  top_matches: { slug: string; pct: number }[];
  claimed_by: string | null;
  trip_id: string | null;
}

/**
 * POST /api/claim-session
 *
 * Claims an anonymous quiz session for the signed-in user and creates the
 * trip from it. Order matters (per the Task 4 brief): authenticate, read the
 * session, insert the trip AS THE USER, then mark claimed_by last, so a
 * failed insert never leaves the session claimed.
 *
 * Idempotent for the owning user: if the session is already claimed by this
 * user and has a stored trip_id, that trip is returned with no new insert.
 * This covers a direct revisit of /quiz?claim=1, a back/forward remount, or
 * the retry banner all firing this route more than once for the same trip.
 */
export async function POST(req: NextRequest) {
  let body: ClaimSessionBody;
  try {
    body = (await req.json()) as ClaimSessionBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body.' }, { status: 400 });
  }

  const sessionId = body.sessionId;
  if (typeof sessionId !== 'string' || !UUID_RE.test(sessionId)) {
    return NextResponse.json({ ok: false, error: 'sessionId must be a valid UUID.' }, { status: 400 });
  }

  const serverSupabase = await createServerSupabase();
  const {
    data: { user },
    error: userError,
  } = await serverSupabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ ok: false, error: 'Not authenticated.' }, { status: 401 });
  }

  const { data: session, error: sessionError } = await serviceSupabase
    .from('quiz_sessions')
    .select('session_id, answers, top_matches, claimed_by, trip_id')
    .eq('session_id', sessionId)
    .maybeSingle<QuizSessionRow>();

  if (sessionError) {
    console.error('claim-session: session lookup error:', sessionError);
    return NextResponse.json({ ok: false, error: 'storage' }, { status: 500 });
  }

  if (!session) {
    return NextResponse.json({ ok: false, error: 'Session not found.' }, { status: 404 });
  }

  if (session.claimed_by && session.claimed_by !== user.id) {
    return NextResponse.json({ ok: false, error: 'Session already claimed.' }, { status: 409 });
  }

  // Already claimed by this same user with a trip on record: short-circuit,
  // no re-insert. Covers a direct revisit, a remount that re-fires the
  // ref-guarded effect, or the retry banner after a prior success.
  if (session.claimed_by === user.id && session.trip_id) {
    return NextResponse.json({ ok: true, tripId: session.trip_id });
  }

  const topMatch = session.top_matches?.[0] ?? null;
  const destinationSlug = session.answers?.destinationSlug;

  let payload;
  try {
    payload = sessionToTripPayload(session.answers, topMatch, destinationSlug);
  } catch (err) {
    console.error('claim-session: mapping error:', err);
    return NextResponse.json({ ok: false, error: 'No destination to save yet.' }, { status: 400 });
  }

  const { data: trip, error: insertError } = await serverSupabase
    .from('trips')
    .insert({ ...payload, user_id: user.id })
    .select('id')
    .single();

  if (insertError || !trip) {
    console.error('claim-session: trip insert error:', insertError);
    return NextResponse.json({ ok: false, error: 'Could not save your trip.' }, { status: 500 });
  }

  // Insert succeeded: mark the session claimed and record the trip last, so
  // a failed insert above never leaves the session claimed with no trip to
  // show for it, and a future call can short-circuit on trip_id.
  const { error: claimError } = await serviceSupabase
    .from('quiz_sessions')
    .update({ claimed_by: user.id, trip_id: trip.id })
    .eq('session_id', sessionId)
    .is('claimed_by', null);

  if (claimError) {
    // The trip was created; this is a non-fatal bookkeeping failure (a retry
    // will hit the 409 path harmlessly if a different account claims later,
    // or just re-run this update). Log and continue.
    console.error('claim-session: claim update error:', claimError);
  }

  return NextResponse.json({ ok: true, tripId: trip.id as string });
}
