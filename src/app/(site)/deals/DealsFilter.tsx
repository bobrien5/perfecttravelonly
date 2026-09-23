'use client';

import { useState } from 'react';
import DealCard from '@/components/deals/DealCard';
import { DEAL_FACETS, dealMatchesFacet, type Deal, type DealFacet } from '@/types/deal';

/**
 * Client-side faceting over the full deal set.
 *
 * Filtering in the browser rather than by route is deliberate at this
 * catalogue size: the whole set is a handful of deals, so shipping it once and
 * filtering locally is faster than a round trip per facet, and it keeps every
 * deal on one indexable URL instead of splitting the link equity across
 * /deals/luxury, /deals/family and so on. Revisit if the catalogue reaches the
 * point where the payload matters.
 */
export default function DealsFilter({ deals }: { deals: Deal[] }) {
  const [facet, setFacet] = useState<DealFacet>('all');
  const shown = deals.filter((d) => dealMatchesFacet(d, facet));

  const counts = Object.fromEntries(
    DEAL_FACETS.map((f) => [f.key, deals.filter((d) => dealMatchesFacet(d, f.key)).length])
  ) as Record<DealFacet, number>;

  return (
    <>
      <div
        className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        role="group"
        aria-label="Filter deals"
      >
        {DEAL_FACETS.map((f) => {
          const active = f.key === facet;
          // A facet with nothing in it is shown disabled rather than hidden, so
          // the categories stay stable as the catalogue changes.
          const empty = counts[f.key] === 0;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFacet(f.key)}
              disabled={empty}
              aria-pressed={active}
              className={[
                'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition',
                active
                  ? 'bg-brand-700 text-white'
                  : empty
                    ? 'cursor-not-allowed bg-gray-50 text-gray-300'
                    : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50',
              ].join(' ')}
            >
              {f.label}
              <span className={active ? 'ml-1.5 text-white/70' : 'ml-1.5 text-gray-400'}>
                {counts[f.key]}
              </span>
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <p className="rounded-2xl bg-white p-8 text-center text-gray-500 ring-1 ring-gray-100">
          Nothing in this category right now. New deals go up regularly.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </>
  );
}
