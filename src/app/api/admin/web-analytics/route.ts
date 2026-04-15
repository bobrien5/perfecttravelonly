import { NextRequest, NextResponse } from 'next/server';

const VERCEL_TOKEN = process.env.VP_ANALYTICS_TOKEN;
const PROJECT_ID = 'prj_484MAOmla9rDu10AjqCRE6GlBgx1';
const TEAM_ID = 'team_VRTTXRGQ872f1SBAZkyqfmer';
const BASE = 'https://vercel.com/api/web-analytics/timeseries';

async function fetchTimeseries(
  from: string,
  to: string,
  groupBy?: string
) {
  const params = new URLSearchParams({
    projectId: PROJECT_ID,
    teamId: TEAM_ID,
    from,
    to,
    metric: 'pageViews',
  });
  if (groupBy) params.set('groupBy', groupBy);

  const res = await fetch(`${BASE}?${params}`, {
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data?.groups || null;
}

function sumGroup(
  groups: Record<string, { total: number; devices: number; bounceRate: number }[]>
) {
  const result: Record<string, { pageviews: number; visitors: number; bounceRate: number }> = {};
  for (const [key, entries] of Object.entries(groups)) {
    let pageviews = 0;
    let visitors = 0;
    let bounceSum = 0;
    let bounceCount = 0;
    for (const e of entries) {
      pageviews += e.total;
      visitors += e.devices;
      if (e.total > 0) {
        bounceSum += e.bounceRate;
        bounceCount++;
      }
    }
    result[key] = {
      pageviews,
      visitors,
      bounceRate: bounceCount > 0 ? Math.round(bounceSum / bounceCount) : 0,
    };
  }
  return result;
}

export async function GET(req: NextRequest) {
  if (!VERCEL_TOKEN) {
    return NextResponse.json(
      { error: 'VERCEL_API_TOKEN not configured' },
      { status: 500 }
    );
  }

  const { searchParams } = req.nextUrl;
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  if (!start || !end) {
    return NextResponse.json(
      { error: 'start and end query params required' },
      { status: 400 }
    );
  }

  try {
    const [overview, pages, referrers, countries, devices, browsers] =
      await Promise.all([
        fetchTimeseries(start, end),
        fetchTimeseries(start, end, 'path'),
        fetchTimeseries(start, end, 'referrer'),
        fetchTimeseries(start, end, 'country'),
        fetchTimeseries(start, end, 'device_type'),
        fetchTimeseries(start, end, 'client_name'),
      ]);

    // Parse overview (the "all" group)
    const allData = overview?.all || [];
    let totalPageviews = 0;
    let totalVisitors = 0;
    let bounceSum = 0;
    let bounceCount = 0;
    for (const entry of allData) {
      totalPageviews += entry.total;
      totalVisitors += entry.devices;
      if (entry.total > 0) {
        bounceSum += entry.bounceRate;
        bounceCount++;
      }
    }

    // Daily trend
    const daily = allData
      .filter((e: { total: number; devices: number }) => e.total > 0 || e.devices > 0)
      .map((e: { key: string; total: number; devices: number }) => ({
        date: e.key,
        pageviews: e.total,
        visitors: e.devices,
      }));

    // Top pages
    const pagesSummed = pages ? sumGroup(pages) : {};
    const topPages = Object.entries(pagesSummed)
      .sort((a, b) => b[1].pageviews - a[1].pageviews)
      .slice(0, 15)
      .map(([path, data]) => ({ path, ...data }));

    // Top referrers
    const refsSummed = referrers ? sumGroup(referrers) : {};
    const topReferrers = Object.entries(refsSummed)
      .sort((a, b) => b[1].pageviews - a[1].pageviews)
      .slice(0, 10)
      .map(([referrer, data]) => ({
        referrer: referrer || '(direct)',
        ...data,
      }));

    // Countries
    const countriesSummed = countries ? sumGroup(countries) : {};
    const topCountries = Object.entries(countriesSummed)
      .sort((a, b) => b[1].visitors - a[1].visitors)
      .slice(0, 10)
      .map(([country, data]) => ({ country, ...data }));

    // Devices
    const devicesSummed = devices ? sumGroup(devices) : {};
    const deviceBreakdown = Object.entries(devicesSummed)
      .sort((a, b) => b[1].visitors - a[1].visitors)
      .map(([device, data]) => ({ device: device || 'unknown', ...data }));

    // Browsers
    const browsersSummed = browsers ? sumGroup(browsers) : {};
    const topBrowsers = Object.entries(browsersSummed)
      .sort((a, b) => b[1].visitors - a[1].visitors)
      .slice(0, 8)
      .map(([browser, data]) => ({ browser: browser || 'unknown', ...data }));

    return NextResponse.json({
      overview: {
        pageviews: totalPageviews,
        visitors: totalVisitors,
        bounceRate: bounceCount > 0 ? Math.round(bounceSum / bounceCount) : 0,
      },
      daily,
      topPages,
      topReferrers,
      topCountries,
      deviceBreakdown,
      topBrowsers,
    });
  } catch (err) {
    console.error('Vercel Analytics API error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
