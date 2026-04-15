'use client';

import { useEffect, useState } from 'react';
import StatCard from '@/components/admin/StatCard';
import RevenueChart from '@/components/admin/charts/RevenueChart';
import { EmailQuickStats } from '@/components/admin/EmailStats';

const SOURCE_LABELS: Record<string, string> = {
  facebook_creator: 'FB Creator',
  sponsorship: 'Sponsorships',
  newsletter_ads: 'Newsletter Ads',
  affiliate_expedia: 'Expedia',
  affiliate_travelpayouts: 'Travelpayouts',
  affiliate_awin: 'Awin',
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(n);
}

interface RevenueData {
  entries: Array<{ date: string; source: string; amount: number }>;
  bySource: Record<string, number>;
  wowRevenue: number;
  webinarCount: number;
  total: number;
}

interface LeadsData {
  pipelines: Array<{ totalLeads: number }>;
}

export default function AdminDashboardPage() {
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [leads, setLeads] = useState<LeadsData | null>(null);

  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const end = now.toISOString().split('T')[0];

    Promise.all([
      fetch(`/api/admin/revenue?start=${start}&end=${end}`).then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/admin/leads').then((r) => r.ok ? r.json() : null).catch(() => null),
    ]).then(([rev, ld]) => {
      setRevenue(rev);
      setLeads(ld);
    });
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">VacationPro business overview</p>
      </div>

      {/* Revenue Overview */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h2>

        <div className="bg-brand-500 text-white rounded-xl p-6 mb-4">
          <p className="text-sm font-medium opacity-80">Total Revenue</p>
          <p className="text-4xl font-bold mt-1">
            {revenue ? formatCurrency(revenue.total) : '$0'}
          </p>
          {revenue && (
            <p className="text-sm opacity-70 mt-1">
              Including {revenue.webinarCount} billable webinar attendees ({formatCurrency(revenue.wowRevenue)})
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Object.entries(SOURCE_LABELS).map(([key, label]) => (
            <StatCard
              key={key}
              label={label}
              value={formatCurrency(revenue?.bySource?.[key] || 0)}
            />
          ))}
          <StatCard
            label="WOW Lead Gen"
            value={formatCurrency(revenue?.wowRevenue || 0)}
            subtitle={`${revenue?.webinarCount || 0} webinars @ $250`}
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Revenue by Source</h3>
          <RevenueChart
            entries={revenue?.entries || []}
            wowRevenue={revenue?.wowRevenue || 0}
          />
        </div>
      </section>

      {/* Quick Stats */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Leads"
            value={
              leads?.pipelines?.reduce(
                (s, p) => s + p.totalLeads,
                0
              ) || 0
            }
          />
          <EmailQuickStats />
        </div>
      </section>
    </div>
  );
}
