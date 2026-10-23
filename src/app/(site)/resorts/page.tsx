import type { Metadata } from 'next';
import Link from 'next/link';
import Stay22Guard from '@/components/monetization/Stay22Guard';
import { ACTIVE_RESORTS, ageLabel, destinationName } from '@/lib/resorts/catalog';

export const metadata: Metadata = {
  title: { absolute: 'All-Inclusive Resorts in Mexico and the Caribbean | VacationPro' },
  description: 'The all-inclusive resorts VacationPro has researched in Cancun, Riviera Maya, Punta Cana and Aruba, with strengths, tradeoffs and sources.',
  alternates: { canonical: '/resorts' },
};

const ORDER = ['cancun', 'riviera-maya', 'punta-cana', 'aruba'] as const;

export default function ResortsIndex() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <Stay22Guard />
      <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Resorts we have researched</h1>
      <p className="mt-3 max-w-2xl text-lg text-gray-700">
        A smaller list we can stand behind, rather than every resort on the map. Not sure which fits?{' '}
        <Link href="/quiz" className="font-bold text-brand-800 underline">Take the resort quiz</Link>.
      </p>
      {ORDER.map((d) => {
        const list = ACTIVE_RESORTS.filter((r) => r.destination === d).sort((a, b) => a.name.localeCompare(b.name));
        return (
          <section key={d} className="mt-10" aria-labelledby={`dest-${d}`}>
            <div className="flex items-end justify-between gap-3">
              <h2 id={`dest-${d}`} className="text-xl font-extrabold text-gray-900">{destinationName(d)}</h2>
              <Link href={`/quiz?destination=${d}`} className="text-sm font-bold text-brand-800 underline">Match me in {destinationName(d)}</Link>
            </div>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {list.map((r) => (
                <li key={r.id}>
                  <Link href={`/resorts/${r.id}`} className="block min-h-16 rounded-xl border border-gray-200 bg-white p-4 hover:border-brand-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-300">
                    <span className="block font-bold text-gray-900">{r.name}</span>
                    <span className="text-sm text-gray-600">{ageLabel(r)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
