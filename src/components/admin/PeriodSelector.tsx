'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const PERIODS = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'ytd', label: 'YTD' },
] as const;

export type Period = (typeof PERIODS)[number]['value'];

export function getPeriodDates(period: Period): { start: string; end: string } {
  const now = new Date();
  const end = now.toISOString().split('T')[0];
  let start: Date;

  switch (period) {
    case 'week': {
      start = new Date(now);
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      break;
    }
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'quarter': {
      const q = Math.floor(now.getMonth() / 3) * 3;
      start = new Date(now.getFullYear(), q, 1);
      break;
    }
    case 'ytd':
      start = new Date(now.getFullYear(), 0, 1);
      break;
  }

  return { start: start.toISOString().split('T')[0], end };
}

export default function PeriodSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = (searchParams.get('period') as Period) || 'month';

  function handleChange(period: Period) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', period);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => handleChange(p.value)}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
            current === p.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
