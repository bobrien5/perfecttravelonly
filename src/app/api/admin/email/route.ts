import { NextRequest, NextResponse } from 'next/server';
import { getGlobalStats, getContactCount } from '@/lib/beehiiv/stats';

export const revalidate = 900; // 15-minute cache

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const start = searchParams.get('start') || getDefaultStart();
  const end = searchParams.get('end') || today();

  try {
    const [stats, contactInfo] = await Promise.all([
      getGlobalStats(start, end),
      getContactCount(),
    ]);

    // Compute aggregate metrics
    const totals = stats.reduce(
      (acc, day) => ({
        delivered: acc.delivered + day.delivered,
        opens: acc.opens + day.opens,
        uniqueOpens: acc.uniqueOpens + day.uniqueOpens,
        clicks: acc.clicks + day.clicks,
        uniqueClicks: acc.uniqueClicks + day.uniqueClicks,
        bounces: acc.bounces + day.bounces,
        unsubscribes: acc.unsubscribes + day.unsubscribes,
        spamReports: acc.spamReports + day.spamReports,
      }),
      {
        delivered: 0,
        opens: 0,
        uniqueOpens: 0,
        clicks: 0,
        uniqueClicks: 0,
        bounces: 0,
        unsubscribes: 0,
        spamReports: 0,
      }
    );

    const openRate = totals.delivered > 0
      ? ((totals.uniqueOpens / totals.delivered) * 100).toFixed(1)
      : '0';
    const clickRate = totals.delivered > 0
      ? ((totals.uniqueClicks / totals.delivered) * 100).toFixed(1)
      : '0';
    const bounceRate = totals.delivered > 0
      ? ((totals.bounces / (totals.delivered + totals.bounces)) * 100).toFixed(1)
      : '0';

    return NextResponse.json({
      subscribers: contactInfo.contactCount,
      billableContacts: contactInfo.billableCount,
      stats,
      totals,
      rates: {
        openRate: Number(openRate),
        clickRate: Number(clickRate),
        bounceRate: Number(bounceRate),
      },
    });
  } catch (error) {
    console.error('Email stats error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch email stats' },
      { status: 500 }
    );
  }
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function getDefaultStart(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split('T')[0];
}
