'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface DailyRow {
  date: string;
  clicks: number;
  impressions: number;
}

export default function SEOChart({ data }: { data: DailyRow[] }) {
  if (!data.length) {
    return (
      <p className="text-center text-gray-400 py-12">No data available</p>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formatted}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            fontSize: 13,
          }}
        />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="clicks"
          stroke="#00bf63"
          strokeWidth={2}
          dot={false}
          name="Clicks"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="impressions"
          stroke="#6366f1"
          strokeWidth={2}
          dot={false}
          name="Impressions"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
