import { NextRequest, NextResponse } from 'next/server';
import { getSearchConsoleData } from '@/lib/admin/google';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  if (!start || !end) {
    return NextResponse.json(
      { error: 'start and end query params required' },
      { status: 400 }
    );
  }

  const siteUrl =
    process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || 'https://vacationpro.co';

  try {
    const data = await getSearchConsoleData(siteUrl, start, end);
    return NextResponse.json(data);
  } catch (err) {
    console.error('Search Console API error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch Search Console data' },
      { status: 500 }
    );
  }
}
