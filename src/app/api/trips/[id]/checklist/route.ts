import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabase } from '@/lib/supabase/server';
import { toggleChecklist, type StepKey } from '@/lib/trips/data';

const STEP_KEYS: StepKey[] = ['destination', 'resort', 'flights', 'things', 'itinerary', 'book'];

interface ChecklistPatchBody {
  step?: unknown;
  value?: unknown;
}

function isStepKey(value: unknown): value is StepKey {
  return typeof value === 'string' && (STEP_KEYS as string[]).includes(value);
}

/**
 * PATCH /api/trips/[id]/checklist
 *
 * Body: { step: StepKey, value: boolean }. Reads the trip via the
 * RLS-scoped server client (so a trip that is not the caller's own comes
 * back as not found, same as a truly missing id), toggles the checklist,
 * and writes it back with a fresh updated_at.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: ChecklistPatchBody;
  try {
    body = (await req.json()) as ChecklistPatchBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body.' }, { status: 400 });
  }

  const { step, value } = body;
  if (!isStepKey(step) || typeof value !== 'boolean') {
    return NextResponse.json(
      { ok: false, error: 'Body must include a valid step and a boolean value.' },
      { status: 400 }
    );
  }

  const supabase = await createServerSupabase();

  const { data: trip, error: fetchError } = await supabase
    .from('trips')
    .select('id, checklist')
    .eq('id', id)
    .maybeSingle();

  if (fetchError || !trip) {
    return NextResponse.json({ ok: false, error: 'Trip not found.' }, { status: 404 });
  }

  const nextChecklist = toggleChecklist(trip.checklist, step, value);

  const { error: updateError } = await supabase
    .from('trips')
    .update({ checklist: nextChecklist, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ ok: false, error: 'Could not update checklist.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, checklist: nextChecklist });
}
