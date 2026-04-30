import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  let query = supabase
    .from('revenue_entries')
    .select('*')
    .order('date', { ascending: false });

  if (start) query = query.gte('date', start);
  if (end) query = query.lte('date', end);

  const { data, error } = await query;

  if (error) {
    // Table doesn't exist yet — return empty data gracefully
    return NextResponse.json({
      entries: [],
      bySource: {},
      tristarRevenue: 0,
      webinarCount: 0,
      total: 0,
    });
  }

  // Aggregate by source
  const bySource: Record<string, number> = {};
  for (const entry of data || []) {
    bySource[entry.source] = (bySource[entry.source] || 0) + Number(entry.amount);
  }

  // Get webinar attendance for the period
  let attendanceQuery = supabase
    .from('webinar_attendance')
    .select('*', { count: 'exact' })
    .eq('billable', true);

  if (start) attendanceQuery = attendanceQuery.gte('attended_at', start);
  if (end) attendanceQuery = attendanceQuery.lte('attended_at', end);

  const { count: webinarCount } = await attendanceQuery;
  const tristarRevenue = (webinarCount || 0) * 250;

  const total = Object.values(bySource).reduce((s, v) => s + v, 0) + tristarRevenue;

  return NextResponse.json({
    entries: data || [],
    bySource,
    tristarRevenue,
    webinarCount: webinarCount || 0,
    total,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { source, amount, description, date } = body;

  if (!source || amount == null || !date) {
    return NextResponse.json(
      { error: 'source, amount, and date are required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('revenue_entries')
    .insert({ source, amount, description, date })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ entry: data });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const { error } = await supabase.from('revenue_entries').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
