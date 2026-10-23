import type { Metadata } from 'next';
import Link from 'next/link';
import { describeResort, ratingWord, type ResortRecord } from '@vacationpro/engine';
import BookingActions from '@/components/booking/BookingActions';
import Stay22Guard from '@/components/monetization/Stay22Guard';
import { ageLabel, destinationName, getActiveResort, priceRangeLabel, transferLabel } from '@/lib/resorts/catalog';
import { quoteHref, resortBookHref } from '@/lib/resorts/links';
import CompareTracker from './CompareTracker';

export const metadata: Metadata = {
  title: { absolute: 'Compare Resorts | VacationPro' },
  robots: { index: false, follow: true },
  alternates: { canonical: '/compare' },
};

const ATMOSPHERE: Record<string, string> = { quiet: 'Quiet and romantic', balanced: 'Lively but relaxed', social: 'Energetic and social' };

function beach(r: ResortRecord): string {
  const swim = r.beach.swimmable === null ? 'swimming not confirmed' : r.beach.swimmable === 'yes' ? 'good for swimming' : r.beach.swimmable === 'mixed' ? 'swimming varies' : 'not good for swimming';
  return `${ratingWord(r.ratings.beach)}, ${swim}`;
}

function price(r: ResortRecord): string {
  return priceRangeLabel(r);
}

function family(r: ResortRecord): string {
  if (r.adultsOnly === null) return 'Age policy not confirmed';
  if (r.adultsOnly) return ageLabel(r);
  const extras = [r.hasKidsClub ? 'kids club' : null, r.hasWaterPark ? 'water park or splash area' : null].filter(Boolean).join(', ');
  return `${ratingWord(r.ratings.family)} for families${extras ? `, ${extras}` : ''}`;
}

const CRITERIA: { label: string; value: (r: ResortRecord) => string }[] = [
  { label: 'Atmosphere', value: (r) => (r.atmosphere ? ATMOSPHERE[r.atmosphere] : 'Not rated yet') },
  { label: 'Beach and swimming', value: beach },
  { label: 'Food', value: (r) => ratingWord(r.ratings.food) },
  { label: 'Pools and entertainment', value: (r) => `Pools: ${ratingWord(r.ratings.pools)}. Nightlife: ${ratingWord(r.ratings.nightlife)}.` },
  { label: 'Rooms', value: (r) => ratingWord(r.ratings.rooms) },
  { label: 'Family suitability', value: family },
  { label: 'Airport transfer', value: (r) => transferLabel(r) ?? 'Not confirmed' },
  { label: 'Price context', value: price },
  {
    label: 'Guest reviews',
    value: (r) => (r.guestRating ? `${Math.round(r.guestRating.score)}/100${r.guestRating.reviews ? ` from about ${Math.round(r.guestRating.reviews).toLocaleString('en-US')} reviews` : ''}` : 'Not available'),
  },
  { label: 'Main tradeoff', value: (r) => describeResort(r).tradeoffs[0] ?? 'No major tradeoff on file' },
  { label: 'Best fit', value: (r) => describeResort(r).bestFor },
];

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const { ids = '' } = await searchParams;
  const resorts = Array.from(new Set(ids.split(',').map((s) => s.trim())))
    .map((id) => getActiveResort(id))
    .filter((r): r is ResortRecord => r !== null)
    .slice(0, 3);

  if (resorts.length < 2) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-extrabold text-gray-900">Compare resorts</h1>
        <p className="mt-3 text-gray-700">Choose two or three resorts from your results to compare them side by side.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/quiz" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-700 px-6 font-bold text-white">Go to my results</Link>
          <Link href="/resorts" className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-brand-700 px-6 font-bold text-brand-800">Browse resorts</Link>
        </div>
      </div>
    );
  }

  const alts = (id: string) => resorts.filter((r) => r.id !== id).map((r) => r.id).join(',');

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <Stay22Guard />
      <CompareTracker ids={resorts.map((r) => r.id)} />
      <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Compare resorts</h1>
      <p className="mt-2 text-gray-700">
        Same criteria for each. Price ranges are estimates, not live rates.
      </p>

      {/* Phones: one criterion at a time, every resort listed under it. */}
      <div className="mt-6 space-y-4 md:hidden">
        <ol className="space-y-1 rounded-xl bg-gray-50 p-4 text-sm">
          {resorts.map((r, i) => (
            <li key={r.id}>
              <span className="font-bold">{i + 1}.</span>{' '}
              <Link href={`/resorts/${r.id}`} className="font-bold text-gray-900 underline">{r.name}</Link>{' '}
              <span className="text-gray-600">({destinationName(r.destination)})</span>
            </li>
          ))}
        </ol>
        {CRITERIA.map((c) => (
          <section key={c.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-gray-700">{c.label}</h2>
            <dl className="mt-2 space-y-2">
              {resorts.map((r, i) => (
                <div key={r.id}>
                  <dt className="text-xs font-bold text-gray-500">{i + 1}. {r.name}</dt>
                  <dd className="text-sm text-gray-900">{c.value(r)}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      {/* Wider screens: a table. */}
      <div className="mt-6 hidden overflow-x-auto md:block">
        <table className="w-full table-fixed border-collapse text-sm">
          <caption className="sr-only">Resort comparison</caption>
          <thead>
            <tr>
              <th scope="col" className="w-44 p-3 text-left text-gray-500">Criteria</th>
              {resorts.map((r) => (
                <th key={r.id} scope="col" className="p-3 text-left align-bottom">
                  <Link href={`/resorts/${r.id}`} className="text-base font-extrabold text-gray-900 underline-offset-2 hover:underline">{r.name}</Link>
                  <span className="block font-normal text-gray-600">{destinationName(r.destination)} · {ageLabel(r)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CRITERIA.map((c) => (
              <tr key={c.label} className="border-t border-gray-100 align-top">
                <th scope="row" className="p-3 text-left font-bold text-gray-700">{c.label}</th>
                {resorts.map((r) => (
                  <td key={r.id} className="p-3 text-gray-900">{c.value(r)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-gray-600">
        {resorts.some((r) => r.ratingSource === 'community-sheet')
          ? 'Ratings for resorts we have not researched ourselves come from the community All Inclusive Resort Ratings guide (its tags, amenities and hotel class). Guest reviews are its average of TripAdvisor, Google, Costco and Expedia.'
          : 'Ratings are VacationPro editorial assessments.'}
      </p>

      <section className="mt-8 grid gap-4 md:grid-cols-3" aria-label="Booking options">
        {resorts.map((r) => (
          <div key={r.id} className="rounded-2xl border border-gray-200 bg-white p-4">
            <h2 className="mb-3 font-extrabold text-gray-900">{r.name}</h2>
            <BookingActions
              bookHref={resortBookHref(r, 'compare')}
              quoteHref={`/concierge-planning?${new URLSearchParams({ resort: r.id, alts: alts(r.id), from: 'compare' }).toString()}#quote`}
              placement="compare"
              resortId={r.id}
              compact
            />
          </div>
        ))}
      </section>
      <p className="mt-6 text-sm text-gray-600">
        Still deciding?{' '}
        <Link href={quoteHref({ from: 'compare' })} className="font-bold text-brand-800 underline">Ask Brendan to weigh in</Link>.
      </p>
    </div>
  );
}
