'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface DailyRow {
  date: string;
  users: number;
  sessions: number;
  pageviews: number;
}

export default function TrafficChart({ data }: { data: DailyRow[] }) {
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
      <AreaChart data={formatted}>
        <defs>
          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4ac850" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#4ac850" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorPageviews" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            fontSize: 13,
          }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="users"
          stroke="#4ac850"
          strokeWidth={2}
          fill="url(#colorUsers)"
          name="Users"
        />
        <Area
          type="monotone"
          dataKey="pageviews"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#colorPageviews)"
          name="Pageviews"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
