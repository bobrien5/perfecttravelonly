import type { Metadata } from 'next';
import Link from 'next/link';
import Stay22Guard from '@/components/monetization/Stay22Guard';
import { ACTIVE_RESORTS, ageLabel, destinationsByCountry } from '@/lib/resorts/catalog';

export const metadata: Metadata = {
  title: { absolute: 'All-Inclusive Resorts in Mexico and the Caribbean | VacationPro' },
  description: 'Browse all-inclusive resorts across Mexico and the Caribbean by destination, with who each suits, tradeoffs and sources.',
  alternates: { canonical: '/resorts' },
};

export default function ResortsIndex() {
  const groups = destinationsByCountry();
  const total = ACTIVE_RESORTS.length;
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <Stay22Guard />
      <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">All-inclusive resorts</h1>
      <p className="mt-3 max-w-2xl text-lg text-gray-700">
        {total.toLocaleString('en-US')} resorts across Mexico and the Caribbean. Not sure which fits?{' '}
        <Link href="/quiz" className="font-bold text-brand-800 underline">Take the resort quiz</Link>.
      </p>
      <p className="mt-2 max-w-2xl text-sm text-gray-600">
        Resorts marked Researched were fact-checked by VacationPro. The rest come from the community All Inclusive Resort Ratings guide.
      </p>
      {groups.map((g) => (
        <section key={g.country} className="mt-10" aria-labelledby={`c-${g.country}`}>
          <h2 id={`c-${g.country}`} className="text-xl font-extrabold text-gray-900">{g.country}</h2>
          <div className="mt-3 space-y-3">
            {g.destinations.map((d) => {
              const list = ACTIVE_RESORTS.filter((r) => r.destination === d.slug).sort(
                (a, b) => (a.origin === b.origin ? a.name.localeCompare(b.name) : a.origin === 'curated' ? -1 : 1),
              );
              return (
                <details key={d.slug} className="rounded-xl border border-gray-200 bg-white">
                  <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-3 px-4 py-3">
                    <span className="font-bold text-gray-900">{d.name}</span>
                    <span className="text-sm text-gray-600">{d.count} resorts</span>
                  </summary>
                  <div className="border-t border-gray-100 px-4 py-3">
                    <Link href={`/quiz?destination=${d.slug}&from=resorts-index`} className="text-sm font-bold text-brand-800 underline">
                      Match me in {d.name}
                    </Link>
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                      {list.map((r) => (
                        <li key={r.id}>
                          <Link href={`/resorts/${r.id}`} className="block rounded-lg p-2 hover:bg-gray-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-300">
                            <span className="block font-semibold text-gray-900">{r.name}</span>
                            <span className="text-xs text-gray-600">
                              {ageLabel(r)}
                              {r.origin === 'curated' ? ' · Researched' : ''}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
