import { Dispatch, useMemo, useRef, useState } from 'react';
import { QuizAction, QuizAnswers } from '@vacationpro/engine';

interface OriginProps {
  answers: QuizAnswers;
  dispatch: Dispatch<QuizAction>;
}

const POPULAR_AIRPORTS = [
  { code: 'BOS', label: 'Boston Logan (BOS)' },
  { code: 'JFK', label: 'New York JFK (JFK)' },
  { code: 'EWR', label: 'Newark (EWR)' },
  { code: 'PHL', label: 'Philadelphia (PHL)' },
  { code: 'ATL', label: 'Atlanta (ATL)' },
  { code: 'ORD', label: 'Chicago O’Hare (ORD)' },
  { code: 'DFW', label: 'Dallas-Fort Worth (DFW)' },
  { code: 'MIA', label: 'Miami (MIA)' },
];

export default function Origin({ dispatch }: OriginProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return POPULAR_AIRPORTS;
    return POPULAR_AIRPORTS.filter(
      (a) => a.code.toLowerCase().includes(q) || a.label.toLowerCase().includes(q)
    );
  }, [query]);

  function chooseAirport(code: string, label: string) {
    dispatch({ type: 'SET_ORIGIN', origin: { code, label } });
    dispatch({ type: 'NEXT' });
  }

  function useFreeText() {
    const q = query.trim();
    if (!q) return;
    dispatch({ type: 'SET_ORIGIN', origin: { code: '', label: q } });
    dispatch({ type: 'NEXT' });
  }

  function useNearestAirport() {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => inputRef.current?.focus(),
        () => inputRef.current?.focus()
      );
    } else {
      inputRef.current?.focus();
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">Where are you flying from?</h1>
      <p className="text-gray-600 text-center mb-6">We use this to estimate flight cost and time.</p>

      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="City or airport code"
        className="w-full border-2 border-gray-200 rounded-xl p-4 font-semibold mb-4 focus:outline-none focus:border-brand-500"
      />

      <div className="grid grid-cols-2 gap-3 mb-4">
        {filtered.map((a) => (
          <button
            key={a.code}
            type="button"
            onClick={() => chooseAirport(a.code, a.label)}
            className="border-2 border-gray-200 rounded-xl p-4 text-center font-semibold hover:border-gray-300"
          >
            {a.label}
          </button>
        ))}
      </div>

      {query.trim() && filtered.length === 0 && (
        <button
          type="button"
          onClick={useFreeText}
          className="bg-brand-500 hover:bg-brand-600 text-white rounded-xl py-3.5 font-bold w-full mb-4"
        >
          Use &quot;{query.trim()}&quot;
        </button>
      )}

      <button
        type="button"
        onClick={useNearestAirport}
        className="text-sm font-semibold text-brand-600 hover:text-brand-700 block mx-auto mb-3"
      >
        Use my nearest airport
      </button>

      <button
        type="button"
        onClick={() => {
          dispatch({ type: 'SET_ORIGIN', origin: 'flexible' });
          dispatch({ type: 'NEXT' });
        }}
        className="text-sm font-semibold text-gray-500 hover:text-gray-700 block mx-auto"
      >
        I&apos;m flexible on airports
      </button>
    </div>
  );
}
