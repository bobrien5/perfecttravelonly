'use client';

import { useEffect, useState } from 'react';
import StatCard from '@/components/admin/StatCard';
import GrowthChart from '@/components/admin/charts/GrowthChart';

interface DayStat {
  date: string;
  delivered: number;
  opens: number;
  uniqueOpens: number;
  clicks: number;
  uniqueClicks: number;
  bounces: number;
  unsubscribes: number;
}

interface EmailData {
  subscribers: number;
  billableContacts: number;
  stats: DayStat[];
  totals: {
    delivered: number;
    opens: number;
    uniqueOpens: number;
    clicks: number;
    uniqueClicks: number;
    bounces: number;
    unsubscribes: number;
    spamReports: number;
  };
  rates: { openRate: number; clickRate: number; bounceRate: number };
}

export function EmailQuickStats() {
  const [data, setData] = useState<EmailData | null>(null);

  useEffect(() => {
    fetch('/api/admin/email')
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => setData(null));
  }, []);

  return (
    <>
      <StatCard
        label="Email Subscribers"
        value={data?.subscribers?.toLocaleString() || '—'}
      />
      <StatCard
        label="Open Rate"
        value={data?.rates?.openRate ? `${data.rates.openRate}%` : '—'}
      />
      <StatCard
        label="Click Rate"
        value={data?.rates?.clickRate ? `${data.rates.clickRate}%` : '—'}
      />
    </>
  );
}

export function EmailDashboard({ start, end }: { start?: string; end?: string }) {
  const [data, setData] = useState<EmailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (start) params.set('start', start);
    if (end) params.set('end', end);
    const qs = params.toString() ? `?${params}` : '';

    fetch(`/api/admin/email${qs}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [start, end]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-20 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const deliveryData = data?.stats?.map((s) => ({
    date: s.date,
    value: s.delivered,
    label: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  })) || [];

  const openData = data?.stats?.map((s) => ({
    date: s.date,
    value: s.uniqueOpens,
    label: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  })) || [];

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Subscribers"
          value={data?.subscribers ? data.subscribers.toLocaleString() : '—'}
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
        <GrowthChart data={deliveryData} color="#4ac850" valueLabel="Delivered" />
      </div>

      {/* Opens Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Unique Opens</h3>
        <GrowthChart data={openData} color="#1877F2" valueLabel="Opens" />
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
                .map((s) => (
                  <tr key={s.date} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-900">{new Date(s.date).toLocaleDateString()}</td>
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
