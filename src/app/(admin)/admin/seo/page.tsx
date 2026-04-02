import { Suspense } from 'react';
import StatCard from '@/components/admin/StatCard';
import PeriodSelector, {
  getPeriodDates,
  type Period,
} from '@/components/admin/PeriodSelector';
import SEOChart from '@/components/admin/charts/SEOChart';
import TrafficChart from '@/components/admin/charts/TrafficChart';

async function getSearchConsoleData(period: Period) {
  const { start, end } = getPeriodDates(period);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  try {
    const res = await fetch(
      `${baseUrl}/api/admin/search-console?start=${start}&end=${end}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getAnalyticsData(period: Period) {
  const { start, end } = getPeriodDates(period);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  try {
    const res = await fetch(
      `${baseUrl}/api/admin/analytics?start=${start}&end=${end}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default async function SEODashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const period = (params.period as Period) || 'month';

  const [gsc, ga] = await Promise.all([
    getSearchConsoleData(period),
    getAnalyticsData(period),
  ]);

  const notConfigured = !gsc && !ga;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            SEO & Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Google Search Console & Analytics overview
          </p>
        </div>
        <Suspense>
          <PeriodSelector />
        </Suspense>
      </div>

      {notConfigured && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="font-semibold text-amber-900 mb-2">
            Setup Required
          </h3>
          <p className="text-sm text-amber-800 mb-3">
            To connect Google Search Console and Analytics, add these env vars
            in Vercel:
          </p>
          <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
            <li>
              <code className="bg-amber-100 px-1 rounded">
                GOOGLE_SERVICE_ACCOUNT_JSON
              </code>{' '}
              — Full JSON key from your Google Cloud service account
            </li>
            <li>
              <code className="bg-amber-100 px-1 rounded">
                GA4_PROPERTY_ID
              </code>{' '}
              — Your GA4 property ID (numeric, e.g. 123456789)
            </li>
            <li>
              <code className="bg-amber-100 px-1 rounded">
                GOOGLE_SEARCH_CONSOLE_SITE_URL
              </code>{' '}
              — Optional, defaults to https://vacationpro.co
            </li>
          </ul>
          <p className="text-sm text-amber-800 mt-3">
            Make sure the service account email has access to both your Search
            Console property and GA4 property.
          </p>
        </div>
      )}

      {/* --- Google Search Console --- */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Search Console
        </h2>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Clicks"
            value={gsc?.totals?.clicks?.toLocaleString() || '—'}
          />
          <StatCard
            label="Impressions"
            value={gsc?.totals?.impressions?.toLocaleString() || '—'}
          />
          <StatCard
            label="Avg CTR"
            value={
              gsc?.totals?.ctr != null
                ? `${(gsc.totals.ctr * 100).toFixed(1)}%`
                : '—'
            }
          />
          <StatCard
            label="Avg Position"
            value={
              gsc?.totals?.position != null
                ? gsc.totals.position.toFixed(1)
                : '—'
            }
          />
        </div>

        {/* Clicks & Impressions Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Clicks & Impressions
          </h3>
          <SEOChart data={gsc?.daily || []} />
        </div>

        {/* Top Queries & Top Pages side by side */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Queries */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Top Search Queries
            </h3>
            {gsc?.topQueries?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <th className="pb-2 font-medium">Query</th>
                      <th className="pb-2 font-medium text-right">Clicks</th>
                      <th className="pb-2 font-medium text-right">Impr.</th>
                      <th className="pb-2 font-medium text-right">CTR</th>
                      <th className="pb-2 font-medium text-right">Pos.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gsc.topQueries.map(
                      (
                        q: {
                          query: string;
                          clicks: number;
                          impressions: number;
                          ctr: number;
                          position: number;
                        },
                        i: number
                      ) => (
                        <tr
                          key={i}
                          className="border-b border-gray-50 hover:bg-gray-50"
                        >
                          <td className="py-2 pr-4 text-gray-900 max-w-[200px] truncate">
                            {q.query}
                          </td>
                          <td className="py-2 text-right text-gray-700">
                            {q.clicks.toLocaleString()}
                          </td>
                          <td className="py-2 text-right text-gray-700">
                            {q.impressions.toLocaleString()}
                          </td>
                          <td className="py-2 text-right text-gray-700">
                            {(q.ctr * 100).toFixed(1)}%
                          </td>
                          <td className="py-2 text-right text-gray-700">
                            {q.position.toFixed(1)}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No data</p>
            )}
          </div>

          {/* Top Pages */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Top Pages (Search)
            </h3>
            {gsc?.topPages?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <th className="pb-2 font-medium">Page</th>
                      <th className="pb-2 font-medium text-right">Clicks</th>
                      <th className="pb-2 font-medium text-right">Impr.</th>
                      <th className="pb-2 font-medium text-right">Pos.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gsc.topPages.map(
                      (
                        p: {
                          page: string;
                          clicks: number;
                          impressions: number;
                          position: number;
                        },
                        i: number
                      ) => {
                        const shortPath =
                          new URL(p.page).pathname || p.page;
                        return (
                          <tr
                            key={i}
                            className="border-b border-gray-50 hover:bg-gray-50"
                          >
                            <td className="py-2 pr-4 text-gray-900 max-w-[200px] truncate">
                              {shortPath}
                            </td>
                            <td className="py-2 text-right text-gray-700">
                              {p.clicks.toLocaleString()}
                            </td>
                            <td className="py-2 text-right text-gray-700">
                              {p.impressions.toLocaleString()}
                            </td>
                            <td className="py-2 text-right text-gray-700">
                              {p.position.toFixed(1)}
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No data</p>
            )}
          </div>
        </div>
      </section>

      {/* --- Google Analytics --- */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Site Analytics (GA4)
        </h2>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <StatCard
            label="Active Users"
            value={ga?.overview?.activeUsers?.toLocaleString() || '—'}
          />
          <StatCard
            label="New Users"
            value={ga?.overview?.newUsers?.toLocaleString() || '—'}
          />
          <StatCard
            label="Sessions"
            value={ga?.overview?.sessions?.toLocaleString() || '—'}
          />
          <StatCard
            label="Pageviews"
            value={ga?.overview?.pageviews?.toLocaleString() || '—'}
          />
          <StatCard
            label="Bounce Rate"
            value={
              ga?.overview?.bounceRate != null
                ? `${(ga.overview.bounceRate * 100).toFixed(1)}%`
                : '—'
            }
          />
          <StatCard
            label="Avg Session"
            value={
              ga?.overview?.avgSessionDuration != null
                ? formatDuration(ga.overview.avgSessionDuration)
                : '—'
            }
          />
        </div>

        {/* Traffic Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Users & Pageviews
          </h3>
          <TrafficChart data={ga?.daily || []} />
        </div>

        {/* Traffic Sources & Top Pages & Devices */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Traffic Sources */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Traffic Sources
            </h3>
            {ga?.trafficSources?.length ? (
              <div className="space-y-3">
                {ga.trafficSources.map(
                  (
                    s: {
                      channel: string;
                      sessions: number;
                      users: number;
                    },
                    i: number
                  ) => {
                    const maxSessions = ga.trafficSources[0].sessions;
                    const pct =
                      maxSessions > 0
                        ? (s.sessions / maxSessions) * 100
                        : 0;
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-900 font-medium">
                            {s.channel}
                          </span>
                          <span className="text-gray-500">
                            {s.sessions.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No data</p>
            )}
          </div>

          {/* Top Pages by Views */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Top Pages (GA4)
            </h3>
            {ga?.topPages?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <th className="pb-2 font-medium">Page</th>
                      <th className="pb-2 font-medium text-right">Views</th>
                      <th className="pb-2 font-medium text-right">Users</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ga.topPages
                      .slice(0, 10)
                      .map(
                        (
                          p: {
                            path: string;
                            pageviews: number;
                            users: number;
                          },
                          i: number
                        ) => (
                          <tr
                            key={i}
                            className="border-b border-gray-50 hover:bg-gray-50"
                          >
                            <td className="py-2 pr-3 text-gray-900 max-w-[180px] truncate">
                              {p.path}
                            </td>
                            <td className="py-2 text-right text-gray-700">
                              {p.pageviews.toLocaleString()}
                            </td>
                            <td className="py-2 text-right text-gray-700">
                              {p.users.toLocaleString()}
                            </td>
                          </tr>
                        )
                      )}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No data</p>
            )}
          </div>

          {/* Device Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Devices
            </h3>
            {ga?.devices?.length ? (
              <div className="space-y-3">
                {ga.devices.map(
                  (
                    d: { device: string; sessions: number; users: number },
                    i: number
                  ) => {
                    const totalSessions = ga.devices.reduce(
                      (
                        sum: number,
                        x: { sessions: number }
                      ) => sum + x.sessions,
                      0
                    );
                    const pct =
                      totalSessions > 0
                        ? (d.sessions / totalSessions) * 100
                        : 0;
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-900 font-medium capitalize">
                            {d.device}
                          </span>
                          <span className="text-gray-500">
                            {pct.toFixed(0)}% ({d.sessions.toLocaleString()})
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No data</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
