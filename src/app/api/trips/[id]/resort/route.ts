import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabase } from '@/lib/supabase/server';
import { toggleChecklist } from '@/lib/trips/data';

interface ResortPatchBody {
  resortSlug?: unknown;
}

/**
 * PATCH /api/trips/[id]/resort
 *
 * Body: { resortSlug: string }. Reads the trip via the RLS-scoped server
 * client (so a trip that is not the caller's own comes back as not found,
 * same as a truly missing id), sets resort_slug, and flips
 * checklist.resort to true in the same update.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: ResortPatchBody;
  try {
    body = (await req.json()) as ResortPatchBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body.' }, { status: 400 });
  }

  const { resortSlug } = body;
  if (typeof resortSlug !== 'string' || resortSlug.length === 0 || resortSlug.length > 100) {
    return NextResponse.json({ ok: false, error: 'Body must include a valid resortSlug.' }, { status: 400 });
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

  const nextChecklist = toggleChecklist(trip.checklist, 'resort', true);

  const { error: updateError } = await supabase
    .from('trips')
    .update({ resort_slug: resortSlug, checklist: nextChecklist, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ ok: false, error: 'Could not update resort.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, resortSlug, checklist: nextChecklist });
}
