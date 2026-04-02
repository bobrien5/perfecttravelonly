import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  let query = supabase
    .from('webinar_attendance')
    .select('*')
    .order('attended_at', { ascending: false });

  if (start) query = query.gte('attended_at', start);
  if (end) query = query.lte('attended_at', end);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const billable = (data || []).filter((d) => d.billable);

  return NextResponse.json({
    attendance: data || [],
    totalAttended: data?.length || 0,
    billableCount: billable.length,
    revenue: billable.length * 250,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { contact_name, contact_email, attended_at, lead_source, billable, notes } = body;

  if (!attended_at) {
    return NextResponse.json(
      { error: 'attended_at is required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('webinar_attendance')
    .insert({
      contact_name,
      contact_email,
      attended_at,
      lead_source: lead_source || 'wow_vacations',
      billable: billable !== false,
      notes,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ attendance: data });
}
