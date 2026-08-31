import { Dispatch, useState } from 'react';
import { QuizAction } from '@/lib/quiz/state';
import { QuizAnswers, BUDGET_BANDS } from '@/lib/match/types';
import { travelerLabel } from '@/lib/quiz/variants';

interface BudgetProps {
  answers: QuizAnswers;
  dispatch: Dispatch<QuizAction>;
}

function originIsAirport(origin: QuizAnswers['origin']): boolean {
  return origin !== null && origin !== 'flexible';
}

export default function Budget({ answers, dispatch }: BudgetProps) {
  const [includesFlights, setIncludesFlights] = useState(originIsAirport(answers.origin));

  function chooseBand(band: 1 | 2 | 3 | 4 | 5) {
    dispatch({ type: 'SET_BUDGET', budget: { band, includesFlights } });
    dispatch({ type: 'NEXT' });
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">What do you want to spend?</h1>
      <p className="text-gray-600 text-center mb-6">{travelerLabel(answers)}</p>

      <div className="flex flex-col gap-3 mb-6">
        {BUDGET_BANDS.map((b) => (
          <button
            key={b.band}
            type="button"
            onClick={() => chooseBand(b.band)}
            className={`border-2 rounded-xl p-4 text-center font-semibold transition-colors ${
              answers.budget?.band === b.band
                ? 'border-brand-500 bg-brand-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      <label className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-700">
        <input
          type="checkbox"
          checked={includesFlights}
          onChange={(e) => setIncludesFlights(e.target.checked)}
          className="w-4 h-4 accent-brand-500"
        />
        Include flights in budget
      </label>
    </div>
  );
}
