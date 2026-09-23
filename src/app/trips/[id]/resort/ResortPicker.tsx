'use client';

import { useState } from 'react';
import Link from 'next/link';
import { track } from '@vercel/analytics';

import type { RankedResort } from '@vacationpro/engine';

import { stay22Url } from '@/lib/monetization/stay22';
import { heroImageSrc } from '@/sanity/lib/image';

interface ResortPickerProps {
  tripId: string;
  destination: string;
  ranked: RankedResort[];
  initialResortSlug: string | null;
}

export default function ResortPicker({ tripId, destination, ranked, initialResortSlug }: ResortPickerProps) {
  const [pickedSlug, setPickedSlug] = useState<string | null>(initialResortSlug);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function choose(slug: string) {
    setError(null);
    setSavingSlug(slug);
    try {
      const res = await fetch(`/api/trips/${tripId}/resort`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resortSlug: slug }),
      });
      if (!res.ok) throw new Error('Request failed');
      track('resort_selected', { resort: slug });
      setPickedSlug(slug);
    } catch {
      setError('Could not save your pick. Please try again.');
    } finally {
      setSavingSlug(null);
    }
  }

  if (ranked.length === 0) {
    return (
      <div className="border-2 border-gray-200 rounded-2xl p-8 bg-white text-center">
        <p className="text-gray-700 font-semibold mb-5">
          Resort picks for {destination} are coming soon. Our advisor can build your shortlist today.
        </p>
        <Link
          href={`/concierge-planning?trip=${tripId}`}
          onClick={() => track('advisor_click', { resort: 'none' })}
          className="inline-block bg-brand-500 hover:bg-brand-600 text-white rounded-xl py-3.5 px-6 font-bold"
        >
          Ask our advisor
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {ranked.map(({ slug, pct, fitChips, resort }) => {
        const isPicked = pickedSlug === slug;
        const isSaving = savingSlug === slug;

        return (
          <div key={slug} className="border-2 border-gray-200 rounded-2xl bg-white overflow-hidden">
            {heroImageSrc(resort) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroImageSrc(resort) ?? ''} alt={resort.name} className="w-full h-40 object-cover" />
            ) : (
              <div className="w-full h-40 bg-brand-500" aria-hidden="true" />
            )}

            <div className="p-6">
              <span className="inline-block bg-brand-500 text-white text-xs font-extrabold rounded-full px-3 py-1 mb-3">
                {pct}% FIT
              </span>

              <h2 className="text-xl font-extrabold text-gray-900 mb-2">{resort.name}</h2>

              <div className="flex flex-wrap gap-2 mb-3">
                {fitChips.map((chip) => (
                  <span
                    key={chip}
                    className="inline-block border-2 border-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-600"
                  >
                    {chip}
                  </span>
                ))}
              </div>

              <p className="text-sm font-semibold text-gray-700 mb-3">{'$'.repeat(resort.priceBand)}</p>

              <p className="text-gray-600 mb-5">{resort.verdict}</p>

              {isPicked ? (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-brand-600 font-bold mb-3">Your pick</p>
                  <Link
                    href={`/trips/${tripId}`}
                    className="inline-block text-gray-500 hover:text-gray-700 text-sm font-semibold"
                  >
                    Back to your trip
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                  <a
                    href={stay22Url(resort.expediaUrl, 'triphub-resort')}
                    target="_blank"
                    rel="noopener sponsored"
                    onClick={() => track('check_rates_click', { resort: slug })}
                    className="text-center bg-brand-500 hover:bg-brand-600 text-white rounded-xl py-3 font-bold"
                  >
                    Check rates
                  </a>
                  <Link
                    href={`/concierge-planning?resort=${slug}&trip=${tripId}`}
                    onClick={() => track('advisor_click', { resort: slug })}
                    className="text-center border-2 border-brand-500 text-brand-600 hover:bg-brand-50 rounded-xl py-3 font-bold"
                  >
                    Ask our advisor
                  </Link>
                  <button
                    type="button"
                    onClick={() => choose(slug)}
                    disabled={isSaving}
                    className="sm:col-span-2 text-gray-500 hover:text-gray-700 text-sm font-semibold py-2 disabled:opacity-60"
                  >
                    {isSaving ? 'Saving...' : 'Choose this resort'}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
    </div>
  );
}
