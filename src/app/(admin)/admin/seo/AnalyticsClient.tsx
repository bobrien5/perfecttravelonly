'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import StatCard from '@/components/admin/StatCard';
import TrafficChart from '@/components/admin/charts/TrafficChart';
import { getPeriodDates, type Period } from '@/components/admin/PeriodSelector';

type AnalyticsData = {
  overview: { pageviews: number; visitors: number; bounceRate: number };
  daily: { date: string; visitors: number; pageviews: number }[];
  topPages: { path: string; pageviews: number; visitors: number }[];
  topReferrers: { referrer: string; pageviews: number; visitors: number }[];
  topCountries: { country: string; visitors: number; pageviews: number }[];
  deviceBreakdown: { device: string; visitors: number; pageviews: number }[];
  topBrowsers: { browser: string; visitors: number; pageviews: number }[];
};

export default function AnalyticsClient() {
  const searchParams = useSearchParams();
  const period = (searchParams.get('period') as Period) || 'month';
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const { start, end } = getPeriodDates(period);

    async function load() {
      try {
        const res = await fetch(
          `/api/admin/web-analytics?start=${start}&end=${end}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const d = await res.json();
        if (!cancelled) {
          setData(d);
          setError(null);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load');
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [period]);

  if (loading) {
    return (
      <div className="text-center py-16 text-gray-400">Loading analytics…</div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="font-semibold text-red-900 mb-2">Error loading data</h3>
        <p className="text-sm text-red-800">{error || 'No data returned'}</p>
      </div>
    );
  }

  return (
    <>
      {/* Overview KPIs */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard
            label="Pageviews"
            value={data.overview.pageviews.toLocaleString()}
          />
          <StatCard
            label="Unique Visitors"
            value={data.overview.visitors.toLocaleString()}
          />
          <StatCard
            label="Bounce Rate"
            value={`${data.overview.bounceRate}%`}
          />
        </div>

        {/* Traffic Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Visitors & Pageviews
          </h3>
          <TrafficChart
            data={data.daily.map((d) => ({
              date: d.date,
              users: d.visitors,
              sessions: 0,
              pageviews: d.pageviews,
            }))}
          />
        </div>
      </section>

      {/* Details Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Pages */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Top Pages</h3>
          {data.topPages.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-2 font-medium">Page</th>
                    <th className="pb-2 font-medium text-right">Views</th>
                    <th className="pb-2 font-medium text-right">Visitors</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPages.slice(0, 10).map((p, i) => (
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
                        {p.visitors.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No data</p>
          )}
        </div>

        {/* Top Referrers */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Top Referrers
          </h3>
          {data.topReferrers.length ? (
            <div className="space-y-3">
              {data.topReferrers.map((r, i) => {
                const max = data.topReferrers[0].pageviews;
                const pct = max > 0 ? (r.pageviews / max) * 100 : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-900 font-medium truncate max-w-[160px]">
                        {r.referrer}
                      </span>
                      <span className="text-gray-500 ml-2 shrink-0">
                        {r.pageviews.toLocaleString()}
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
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No data</p>
          )}
        </div>

        {/* Devices */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Devices</h3>
          {data.deviceBreakdown.length ? (
            <div className="space-y-3">
              {data.deviceBreakdown.map((d, i) => {
                const totalVisitors = data.deviceBreakdown.reduce(
                  (sum, x) => sum + x.visitors,
                  0
                );
                const pct =
                  totalVisitors > 0
                    ? (d.visitors / totalVisitors) * 100
                    : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-900 font-medium capitalize">
                        {d.device}
                      </span>
                      <span className="text-gray-500">
                        {pct.toFixed(0)}% ({d.visitors.toLocaleString()})
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
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No data</p>
          )}
        </div>
      </div>

      {/* Countries & Browsers */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Countries */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Top Countries
          </h3>
          {data.topCountries.length ? (
            <div className="space-y-3">
              {data.topCountries.map((c, i) => {
                const max = data.topCountries[0].visitors;
                const pct = max > 0 ? (c.visitors / max) * 100 : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-900 font-medium">
                        {c.country}
                      </span>
                      <span className="text-gray-500">
                        {c.visitors.toLocaleString()} visitors
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No data</p>
          )}
        </div>

        {/* Browsers */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Top Browsers
          </h3>
          {data.topBrowsers.length ? (
            <div className="space-y-3">
              {data.topBrowsers.map((b, i) => {
                const max = data.topBrowsers[0].visitors;
                const pct = max > 0 ? (b.visitors / max) * 100 : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-900 font-medium">
                        {b.browser}
                      </span>
                      <span className="text-gray-500">
                        {b.visitors.toLocaleString()} visitors
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No data</p>
          )}
        </div>
      </div>
    </>
  );
}
