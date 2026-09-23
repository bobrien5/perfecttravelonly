import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllDeals } from '@/sanity/lib/fetch';
import DealsFilter from './DealsFilter';

export const metadata: Metadata = {
  title: { absolute: 'Handpicked Vacation Deals | VacationPro' },
  description:
    'Handpicked all-inclusive and luxury vacation deals to the Caribbean and Mexico. We search the deals, you take the trip.',
  alternates: { canonical: '/deals' },
};

// Deals expire, and an expired deal on a live page is worse than no deal, so
// this revalidates hourly rather than being statically built once.
export const revalidate = 3600;

export default async function DealsPage() {
  const deals = await getAllDeals();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
          Handpicked vacations worth taking.
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          We search the deals. You take the trip.
        </p>
      </header>

      {deals.length === 0 ? (
        // A genuinely empty catalogue is possible: every deal carries an expiry
        // and they are filtered on it. Say so plainly rather than rendering an
        // empty grid that reads as a broken page.
        <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            No live deals right now
          </h2>
          <p className="mx-auto mt-2 max-w-md text-gray-600">
            Every deal here is checked and dated, so when they expire they come
            down. New ones go up regularly.
          </p>
          <Link
            href="/blog"
            className="mt-5 inline-flex rounded-xl bg-brand-700 px-5 py-3 font-semibold text-white transition hover:bg-brand-600"
          >
            Browse travel guides
          </Link>
        </div>
      ) : (
        <DealsFilter deals={deals} />
      )}
    </div>
  );
}
