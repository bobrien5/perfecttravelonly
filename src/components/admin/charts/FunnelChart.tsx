'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface StageData {
  name: string;
  count: number;
}

interface FunnelChartProps {
  stages: StageData[];
}

const COLORS = ['#00bf63', '#33d87e', '#6beaa6', '#a6f4c8', '#d1fae2', '#edfdf4'];

export default function FunnelChart({ stages }: FunnelChartProps) {
  if (stages.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
        No pipeline data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={stages} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12 }}
          stroke="#94a3b8"
          width={120}
        />
        <Tooltip
          formatter={(value) => [String(value), 'Leads']}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {stages.map((_, index) => (
            <Cell
              key={index}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
