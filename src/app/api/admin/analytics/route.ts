import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsData } from '@/lib/admin/google';

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

  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) {
    return NextResponse.json(
      { error: 'GA4_PROPERTY_ID is not set' },
      { status: 500 }
    );
  }

  try {
    const data = await getAnalyticsData(propertyId, start, end);
    return NextResponse.json(data);
  } catch (err) {
    console.error('Analytics API error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch Analytics data' },
      { status: 500 }
    );
  }
}
