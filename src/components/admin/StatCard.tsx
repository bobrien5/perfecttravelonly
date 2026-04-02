import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export default function StatCard({
  label,
  value,
  subtitle,
  trend,
  className,
}: StatCardProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 p-5', className)}>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {subtitle && (
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      )}
      {trend && (
        <p
          className={cn(
            'text-xs font-medium mt-2',
            trend.value >= 0 ? 'text-green-600' : 'text-red-500'
          )}
        >
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
        </p>
      )}
    </div>
  );
}
