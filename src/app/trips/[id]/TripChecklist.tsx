'use client';

import Link from 'next/link';

import type { Checklist } from '@/lib/trips/data';

interface Row {
  step: keyof Checklist;
  label: string;
  href: string | null;
  disabled: boolean;
}

interface TripChecklistProps {
  tripId: string;
  checklist: Checklist;
}

function buildRows(tripId: string, checklist: Checklist): Row[] {
  return [
    { step: 'destination', label: 'Choose destination', href: '/quiz', disabled: false },
    { step: 'resort', label: 'Pick your resort', href: `/trips/${tripId}/resort`, disabled: false },
    { step: 'flights', label: 'Add flights', href: null, disabled: true },
    { step: 'things', label: 'Add things to do', href: null, disabled: true },
    { step: 'itinerary', label: 'Build itinerary', href: null, disabled: true },
    {
      step: 'book',
      label: 'Book your trip',
      href: checklist.resort ? `/trips/${tripId}/resort` : null,
      disabled: !checklist.resort,
    },
  ];
}

export default function TripChecklist({ tripId, checklist }: TripChecklistProps) {
  const rows = buildRows(tripId, checklist);

  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const checked = checklist[row.step];
        const content = (
          <div
            className={`flex items-center gap-3 border-2 rounded-xl px-5 py-4 bg-white ${
              row.disabled ? 'border-gray-100 opacity-60' : 'border-gray-200 hover:border-brand-500 transition-colors'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                checked ? 'bg-brand-500 text-white' : 'border-2 border-gray-300 text-transparent'
              }`}
              aria-hidden="true"
            >
              ✓
            </span>
            <span className="flex-1 font-semibold text-gray-900">{row.label}</span>
            {row.disabled && <span className="text-xs font-semibold text-gray-400">Coming soon</span>}
          </div>
        );

        if (row.href && !row.disabled) {
          return (
            <Link key={row.step} href={row.href}>
              {content}
            </Link>
          );
        }

        return <div key={row.step}>{content}</div>;
      })}
    </div>
  );
}
