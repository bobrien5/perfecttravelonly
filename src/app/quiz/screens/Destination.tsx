import { Dispatch, useMemo, useState } from 'react';
import { QuizAction } from '@/lib/quiz/state';
import { QuizAnswers } from '@/lib/match/types';
import { DESTINATION_PROFILES } from '@/lib/match/destinations';
import OptionCard from '../components/OptionCard';

interface DestinationProps {
  answers: QuizAnswers;
  dispatch: Dispatch<QuizAction>;
}

const POPULAR_SLUGS = [
  'aruba',
  'punta-cana',
  'cancun',
  'riviera-maya',
  'jamaica-montego-bay',
  'turks-and-caicos',
  'st-lucia',
  'bahamas-nassau',
];

const POPULAR_DESTINATIONS = POPULAR_SLUGS.map(
  (slug) => DESTINATION_PROFILES.find((d) => d.slug === slug)!
).filter(Boolean);

export default function Destination({ dispatch }: DestinationProps) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];
    return DESTINATION_PROFILES.filter((d) => d.name.toLowerCase().includes(trimmed)).slice(0, 8);
  }, [query]);

  function choose(slug: string) {
    dispatch({ type: 'SET_PATH', path: 'known', destinationSlug: slug });
    dispatch({ type: 'NEXT' });
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">Where are you headed?</h1>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search destinations..."
        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 mb-6 text-gray-900 focus:border-brand-500 focus:outline-none"
      />

      {query.trim() ? (
        <div className="grid grid-cols-2 gap-3">
          {results.length === 0 && (
            <p className="col-span-2 text-center text-gray-500">No destinations match &quot;{query}&quot;.</p>
          )}
          {results.map((d) => (
            <OptionCard
              key={d.slug}
              label={`${d.name} ${d.flag}`}
              onClick={() => choose(d.slug)}
            />
          ))}
        </div>
      ) : (
        <>
          <p className="text-sm font-semibold text-gray-700 mb-3">Popular destinations</p>
          <div className="grid grid-cols-2 gap-3">
            {POPULAR_DESTINATIONS.map((d) => (
              <OptionCard
                key={d.slug}
                label={`${d.name} ${d.flag}`}
                onClick={() => choose(d.slug)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
