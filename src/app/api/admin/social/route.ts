import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const platform = searchParams.get('platform');
  const limit = Number(searchParams.get('limit')) || 30;

  let query = supabase
    .from('social_stats')
    .select('*')
    .order('date', { ascending: false })
    .limit(limit);

  if (platform) {
    query = query.eq('platform', platform);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get latest stats per platform
  const latest: Record<string, typeof data[number]> = {};
  for (const row of data || []) {
    if (!latest[row.platform]) {
      latest[row.platform] = row;
    }
  }

  return NextResponse.json({
    stats: data || [],
    latest,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { platform, date, followers, impressions, reach, engagement, video_views } = body;

  if (!platform || !date) {
    return NextResponse.json(
      { error: 'platform and date are required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('social_stats')
    .upsert(
      { platform, date, followers, impressions, reach, engagement, video_views },
      { onConflict: 'platform,date' }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ stat: data });
}
