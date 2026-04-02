export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import StatCard from '@/components/admin/StatCard';
import PeriodSelector, { getPeriodDates, type Period } from '@/components/admin/PeriodSelector';
import RevenueChart from '@/components/admin/charts/RevenueChart';
import { getBaseUrl } from '@/lib/utils';

const SOURCE_LABELS: Record<string, string> = {
  facebook_creator: 'FB Creator',
  sponsorship: 'Sponsorships',
  newsletter_ads: 'Newsletter Ads',
  affiliate_expedia: 'Expedia',
  affiliate_travelpayouts: 'Travelpayouts',
  affiliate_awin: 'Awin',
};

async function getRevenueData(period: Period) {
  const { start, end } = getPeriodDates(period);
  const baseUrl = getBaseUrl();

  try {
    const res = await fetch(
      `${baseUrl}/api/admin/revenue?start=${start}&end=${end}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getLeadsSummary() {
  const baseUrl = getBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/admin/leads`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getEmailSummary() {
  const baseUrl = getBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/admin/email`, {
      next: { revalidate: 900 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const period = (params.period as Period) || 'month';

  const [revenue, leads, email] = await Promise.all([
    getRevenueData(period),
    getLeadsSummary(),
    getEmailSummary(),
  ]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(n);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">VacationPro business overview</p>
        </div>
        <Suspense>
          <PeriodSelector />
        </Suspense>
      </div>

      {/* Revenue Overview */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h2>

        {/* Total Revenue Banner */}
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

        {/* Revenue Source Cards */}
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

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Revenue by Source</h3>
          <RevenueChart
            entries={revenue?.entries || []}
            wowRevenue={revenue?.wowRevenue || 0}
          />
        </div>
      </section>

      {/* Quick Stats Row */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Leads"
            value={
              leads?.pipelines?.reduce(
                (s: number, p: { totalLeads: number }) => s + p.totalLeads,
                0
              ) || 0
            }
          />
          <StatCard
            label="Email Subscribers"
            value={email?.subscribers?.toLocaleString() || '—'}
          />
          <StatCard
            label="Open Rate"
            value={email?.rates?.openRate ? `${email.rates.openRate}%` : '—'}
          />
          <StatCard
            label="Click Rate"
            value={email?.rates?.clickRate ? `${email.rates.clickRate}%` : '—'}
          />
        </div>
      </section>
    </div>
  );
}
