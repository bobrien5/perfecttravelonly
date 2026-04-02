import { google } from 'googleapis';

function getAuth() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!credentials) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not set');
  }

  const parsed = JSON.parse(credentials);
  return new google.auth.GoogleAuth({
    credentials: parsed,
    scopes: [
      'https://www.googleapis.com/auth/webmasters.readonly',
      'https://www.googleapis.com/auth/analytics.readonly',
    ],
  });
}

// --- Search Console ---

export async function getSearchConsoleData(
  siteUrl: string,
  startDate: string,
  endDate: string
) {
  const auth = getAuth();
  const searchconsole = google.searchconsole({ version: 'v1', auth });

  const [performanceRes, queryRes, pageRes] = await Promise.all([
    // Overall performance
    searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['date'],
        rowLimit: 500,
      },
    }),
    // Top queries
    searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: 20,
      },
    }),
    // Top pages
    searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['page'],
        rowLimit: 20,
      },
    }),
  ]);

  const dailyData = performanceRes.data.rows || [];
  let totalClicks = 0;
  let totalImpressions = 0;
  let positionSum = 0;

  for (const row of dailyData) {
    totalClicks += row.clicks ?? 0;
    totalImpressions += row.impressions ?? 0;
    positionSum += row.position ?? 0;
  }

  const totals = {
    clicks: totalClicks,
    impressions: totalImpressions,
    ctr: totalImpressions > 0 ? totalClicks / totalImpressions : 0,
    position: dailyData.length > 0 ? positionSum / dailyData.length : 0,
  };

  return {
    totals,
    daily: dailyData.map((row) => ({
      date: row.keys?.[0] || '',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0,
    })),
    topQueries: (queryRes.data.rows || []).map((row) => ({
      query: row.keys?.[0] || '',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0,
    })),
    topPages: (pageRes.data.rows || []).map((row) => ({
      page: row.keys?.[0] || '',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0,
    })),
  };
}

// --- Google Analytics (GA4) ---

export async function getAnalyticsData(
  propertyId: string,
  startDate: string,
  endDate: string
) {
  const auth = getAuth();
  const analyticsData = google.analyticsdata({ version: 'v1beta', auth });
  const property = `properties/${propertyId}`;

  const [overviewRes, pagesRes, sourcesRes, dailyRes, deviceRes] =
    await Promise.all([
      // Overview metrics
      analyticsData.properties.runReport({
        property,
        requestBody: {
          dateRanges: [{ startDate, endDate }],
          metrics: [
            { name: 'activeUsers' },
            { name: 'sessions' },
            { name: 'screenPageViews' },
            { name: 'bounceRate' },
            { name: 'averageSessionDuration' },
            { name: 'newUsers' },
          ],
        },
      }),
      // Top pages
      analyticsData.properties.runReport({
        property,
        requestBody: {
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'pagePath' }],
          metrics: [
            { name: 'screenPageViews' },
            { name: 'activeUsers' },
            { name: 'bounceRate' },
            { name: 'averageSessionDuration' },
          ],
          orderBys: [
            { metric: { metricName: 'screenPageViews' }, desc: true },
          ],
          limit: '20',
        },
      }),
      // Traffic sources
      analyticsData.properties.runReport({
        property,
        requestBody: {
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'sessionDefaultChannelGroup' }],
          metrics: [
            { name: 'sessions' },
            { name: 'activeUsers' },
            { name: 'bounceRate' },
          ],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
          limit: '10',
        },
      }),
      // Daily trend
      analyticsData.properties.runReport({
        property,
        requestBody: {
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'date' }],
          metrics: [
            { name: 'activeUsers' },
            { name: 'sessions' },
            { name: 'screenPageViews' },
          ],
          orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
        },
      }),
      // Device breakdown
      analyticsData.properties.runReport({
        property,
        requestBody: {
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'deviceCategory' }],
          metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        },
      }),
    ]);

  // Parse overview
  const overviewRow = overviewRes.data.rows?.[0]?.metricValues || [];
  const overview = {
    activeUsers: parseInt(overviewRow[0]?.value || '0'),
    sessions: parseInt(overviewRow[1]?.value || '0'),
    pageviews: parseInt(overviewRow[2]?.value || '0'),
    bounceRate: parseFloat(overviewRow[3]?.value || '0'),
    avgSessionDuration: parseFloat(overviewRow[4]?.value || '0'),
    newUsers: parseInt(overviewRow[5]?.value || '0'),
  };

  // Parse top pages
  const topPages = (pagesRes.data.rows || []).map((row) => ({
    path: row.dimensionValues?.[0]?.value || '',
    pageviews: parseInt(row.metricValues?.[0]?.value || '0'),
    users: parseInt(row.metricValues?.[1]?.value || '0'),
    bounceRate: parseFloat(row.metricValues?.[2]?.value || '0'),
    avgDuration: parseFloat(row.metricValues?.[3]?.value || '0'),
  }));

  // Parse traffic sources
  const trafficSources = (sourcesRes.data.rows || []).map((row) => ({
    channel: row.dimensionValues?.[0]?.value || '',
    sessions: parseInt(row.metricValues?.[0]?.value || '0'),
    users: parseInt(row.metricValues?.[1]?.value || '0'),
    bounceRate: parseFloat(row.metricValues?.[2]?.value || '0'),
  }));

  // Parse daily trend
  const daily = (dailyRes.data.rows || []).map((row) => {
    const dateStr = row.dimensionValues?.[0]?.value || '';
    const formatted = dateStr
      ? `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
      : '';
    return {
      date: formatted,
      users: parseInt(row.metricValues?.[0]?.value || '0'),
      sessions: parseInt(row.metricValues?.[1]?.value || '0'),
      pageviews: parseInt(row.metricValues?.[2]?.value || '0'),
    };
  });

  // Parse devices
  const devices = (deviceRes.data.rows || []).map((row) => ({
    device: row.dimensionValues?.[0]?.value || '',
    sessions: parseInt(row.metricValues?.[0]?.value || '0'),
    users: parseInt(row.metricValues?.[1]?.value || '0'),
  }));

  return { overview, topPages, trafficSources, daily, devices };
}
