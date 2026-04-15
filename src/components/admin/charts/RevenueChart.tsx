'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const SOURCE_COLORS: Record<string, string> = {
  facebook_creator: '#1877F2',
  sponsorship: '#4ac850',
  newsletter_ads: '#f59e0b',
  affiliate_expedia: '#003580',
  affiliate_travelpayouts: '#FF6B35',
  affiliate_awin: '#2E3191',
  wow_leads: '#8B5CF6',
};

const SOURCE_LABELS: Record<string, string> = {
  facebook_creator: 'FB Creator',
  sponsorship: 'Sponsorships',
  newsletter_ads: 'Newsletter Ads',
  affiliate_expedia: 'Expedia',
  affiliate_travelpayouts: 'Travelpayouts',
  affiliate_awin: 'Awin',
  wow_leads: 'WOW Leads',
};

interface RevenueEntry {
  source: string;
  amount: number;
  date: string;
}

interface RevenueChartProps {
  entries: RevenueEntry[];
  wowRevenue: number;
}

export default function RevenueChart({ entries, wowRevenue }: RevenueChartProps) {
  // Group entries by week
  const weekMap: Record<string, Record<string, number>> = {};

  for (const entry of entries) {
    const d = new Date(entry.date);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().split('T')[0];

    if (!weekMap[key]) weekMap[key] = {};
    weekMap[key][entry.source] =
      (weekMap[key][entry.source] || 0) + Number(entry.amount);
  }

  // Add WOW revenue to the current week
  const now = new Date();
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - now.getDay());
  const currentWeekKey = thisWeekStart.toISOString().split('T')[0];
  if (!weekMap[currentWeekKey]) weekMap[currentWeekKey] = {};
  weekMap[currentWeekKey].wow_leads = (weekMap[currentWeekKey].wow_leads || 0) + wowRevenue;

  const chartData = Object.entries(weekMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, sources]) => ({
      week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ...sources,
    }));

  const activeSources = new Set<string>();
  for (const entry of entries) activeSources.add(entry.source);
  if (wowRevenue > 0) activeSources.add('wow_leads');

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
        No revenue data for this period
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#94a3b8" />
        <YAxis
          tick={{ fontSize: 12 }}
          stroke="#94a3b8"
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip
          formatter={(value, name) => [
            `$${Number(value).toLocaleString()}`,
            SOURCE_LABELS[String(name)] || name,
          ]}
        />
        <Legend
          formatter={(value) => SOURCE_LABELS[String(value)] || value}
        />
        {Array.from(activeSources).map((source) => (
          <Bar
            key={source}
            dataKey={source}
            stackId="revenue"
            fill={SOURCE_COLORS[source] || '#94a3b8'}
            radius={[2, 2, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
