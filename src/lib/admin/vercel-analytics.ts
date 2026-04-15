const PROJECT_ID = 'prj_484MAOmla9rDu10AjqCRE6GlBgx1';
const TEAM_ID = 'team_VRTTXRGQ872f1SBAZkyqfmer';
const BASE = 'https://vercel.com/api/web-analytics/timeseries';

type TimeseriesEntry = { key: string; total: number; devices: number; bounceRate: number };
type Groups = Record<string, TimeseriesEntry[]>;

async function fetchTimeseries(
  token: string,
  from: string,
  to: string,
  groupBy?: string
): Promise<Groups | null> {
  const params = new URLSearchParams({
    projectId: PROJECT_ID,
    teamId: TEAM_ID,
    from,
    to,
    metric: 'pageViews',
  });
  if (groupBy) params.set('groupBy', groupBy);

  const res = await fetch(`${BASE}?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data?.groups || null;
}

function sumGroup(groups: Groups) {
  const result: Record<
    string,
    { pageviews: number; visitors: number; bounceRate: number }
  > = {};
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

export async function getVercelAnalytics(start: string, end: string) {
  const token = process.env.VP_ANALYTICS_TOKEN;
  if (!token) {
    throw new Error('VP_ANALYTICS_TOKEN is not set');
  }

  const [overview, pages, referrers, countries, devices, browsers] =
    await Promise.all([
      fetchTimeseries(token, start, end),
      fetchTimeseries(token, start, end, 'path'),
      fetchTimeseries(token, start, end, 'referrer'),
      fetchTimeseries(token, start, end, 'country'),
      fetchTimeseries(token, start, end, 'device_type'),
      fetchTimeseries(token, start, end, 'client_name'),
    ]);

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

  const daily = allData
    .filter((e) => e.total > 0 || e.devices > 0)
    .map((e) => ({ date: e.key, pageviews: e.total, visitors: e.devices }));

  const pagesSummed = pages ? sumGroup(pages) : {};
  const topPages = Object.entries(pagesSummed)
    .sort((a, b) => b[1].pageviews - a[1].pageviews)
    .slice(0, 15)
    .map(([path, d]) => ({ path, ...d }));

  const refsSummed = referrers ? sumGroup(referrers) : {};
  const topReferrers = Object.entries(refsSummed)
    .sort((a, b) => b[1].pageviews - a[1].pageviews)
    .slice(0, 10)
    .map(([referrer, d]) => ({ referrer: referrer || '(direct)', ...d }));

  const countriesSummed = countries ? sumGroup(countries) : {};
  const topCountries = Object.entries(countriesSummed)
    .sort((a, b) => b[1].visitors - a[1].visitors)
    .slice(0, 10)
    .map(([country, d]) => ({ country, ...d }));

  const devicesSummed = devices ? sumGroup(devices) : {};
  const deviceBreakdown = Object.entries(devicesSummed)
    .sort((a, b) => b[1].visitors - a[1].visitors)
    .map(([device, d]) => ({ device: device || 'unknown', ...d }));

  const browsersSummed = browsers ? sumGroup(browsers) : {};
  const topBrowsers = Object.entries(browsersSummed)
    .sort((a, b) => b[1].visitors - a[1].visitors)
    .slice(0, 8)
    .map(([browser, d]) => ({ browser: browser || 'unknown', ...d }));

  return {
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
  };
}