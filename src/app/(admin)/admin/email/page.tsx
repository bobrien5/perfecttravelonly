export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import StatCard from '@/components/admin/StatCard';
import PeriodSelector, { getPeriodDates, type Period } from '@/components/admin/PeriodSelector';
import GrowthChart from '@/components/admin/charts/GrowthChart';
import { getBaseUrl } from '@/lib/utils';

interface EmailStat {
  date: string;
  delivered: number;
  opens: number;
  uniqueOpens: number;
  clicks: number;
  uniqueClicks: number;
  bounces: number;
  unsubscribes: number;
}

async function getEmailData(period: Period) {
  const { start, end } = getPeriodDates(period);
  const baseUrl = getBaseUrl();
  try {
    const res = await fetch(
      `${baseUrl}/api/admin/email?start=${start}&end=${end}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function EmailPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const period = (params.period as Period) || 'month';
  const data = await getEmailData(period);

  const deliveryData: { date: string; value: number; label: string }[] =
    data?.stats?.map((s: EmailStat) => ({
      date: s.date,
      value: s.delivered,
      label: new Date(s.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    })) || [];

  const openData: { date: string; value: number; label: string }[] =
    data?.stats?.map((s: EmailStat) => ({
      date: s.date,
      value: s.uniqueOpens,
      label: new Date(s.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    })) || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Growth</h1>
          <p className="text-sm text-gray-500 mt-1">SendGrid newsletter performance</p>
        </div>
        <Suspense>
          <PeriodSelector />
        </Suspense>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Subscribers"
          value={data?.subscribers?.toLocaleString() || '—'}
          className="lg:col-span-1"
        />
        <StatCard
          label="Open Rate"
          value={data?.rates?.openRate ? `${data.rates.openRate}%` : '—'}
        />
        <StatCard
          label="Click Rate"
          value={data?.rates?.clickRate ? `${data.rates.clickRate}%` : '—'}
        />
        <StatCard
          label="Bounce Rate"
          value={data?.rates?.bounceRate ? `${data.rates.bounceRate}%` : '—'}
        />
        <StatCard
          label="Unsubscribes"
          value={data?.totals?.unsubscribes?.toLocaleString() || '0'}
        />
      </div>

      {/* Delivery Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Emails Delivered</h3>
        <GrowthChart
          data={deliveryData}
          color="#00bf63"
          valueLabel="Delivered"
        />
      </div>

      {/* Opens Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Unique Opens</h3>
        <GrowthChart
          data={openData}
          color="#1877F2"
          valueLabel="Opens"
        />
      </div>

      {/* Detailed Stats Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Daily Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-5 py-3 font-medium text-gray-500">Date</th>
                <th className="px-5 py-3 font-medium text-gray-500">Delivered</th>
                <th className="px-5 py-3 font-medium text-gray-500">Opens</th>
                <th className="px-5 py-3 font-medium text-gray-500">Clicks</th>
                <th className="px-5 py-3 font-medium text-gray-500">Bounces</th>
                <th className="px-5 py-3 font-medium text-gray-500">Unsubs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.stats
                ?.slice()
                .reverse()
                .slice(0, 14)
                .map((s: EmailStat) => (
                  <tr key={s.date} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-900">
                      {new Date(s.date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{s.delivered}</td>
                    <td className="px-5 py-3 text-gray-600">{s.uniqueOpens}</td>
                    <td className="px-5 py-3 text-gray-600">{s.uniqueClicks}</td>
                    <td className="px-5 py-3 text-gray-600">{s.bounces}</td>
                    <td className="px-5 py-3 text-gray-600">{s.unsubscribes}</td>
                  </tr>
                ))}
              {(!data?.stats || data.stats.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                    No email data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
