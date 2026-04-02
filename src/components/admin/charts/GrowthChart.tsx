'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

interface GrowthChartProps {
  data: DataPoint[];
  color?: string;
  valueLabel?: string;
  height?: number;
}

export default function GrowthChart({
  data,
  color = '#00bf63',
  valueLabel = 'Value',
  height = 250,
}: GrowthChartProps) {
  if (data.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center text-gray-400 text-sm"
      >
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.15} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11 }}
          stroke="#94a3b8"
        />
        <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
        <Tooltip
          formatter={(value) => [Number(value).toLocaleString(), valueLabel]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#gradient-${color})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
