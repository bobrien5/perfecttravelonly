import { Dispatch, useState } from 'react';
import { QuizAction } from '@/lib/quiz/state';
import { QuizAnswers, Season } from '@/lib/match/types';
import OptionCard from '../components/OptionCard';
import Chip from '../components/Chip';

interface DatesProps {
  answers: QuizAnswers;
  dispatch: Dispatch<QuizAction>;
}

const SEASON_OPTIONS: { season: Season; label: string }[] = [
  { season: 'next3', label: 'Next 3 months' },
  { season: 'winter', label: 'Winter' },
  { season: 'spring', label: 'Spring' },
  { season: 'summer', label: 'Summer' },
  { season: 'fall', label: 'Fall' },
  { season: 'anytime', label: 'Anytime, find me the best deal' },
];

type Mode = 'dates' | 'flexible' | null;

export default function Dates({ answers, dispatch }: DatesProps) {
  const [mode, setMode] = useState<Mode>(null);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  function confirmDates() {
    if (!start || !end) return;
    dispatch({ type: 'SET_DATES', dates: { start, end } });
    dispatch({ type: 'NEXT' });
  }

  function chooseSeason(season: Season) {
    dispatch({ type: 'SET_DATES', dates: { season } });
    dispatch({ type: 'NEXT' });
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">When are you thinking?</h1>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <OptionCard
          label="I know my dates"
          emoji="📅"
          selected={mode === 'dates'}
          onClick={() => setMode('dates')}
        />
        <OptionCard label="I'm flexible" selected={mode === 'flexible'} onClick={() => setMode('flexible')} />
      </div>

      {mode === 'dates' && (
        <div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="border-2 border-gray-200 rounded-xl p-3 font-semibold focus:outline-none focus:border-brand-500"
            />
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="border-2 border-gray-200 rounded-xl p-3 font-semibold focus:outline-none focus:border-brand-500"
            />
          </div>
          <button
            type="button"
            onClick={confirmDates}
            disabled={!start || !end}
            className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl py-3.5 font-bold w-full"
          >
            Continue
          </button>
        </div>
      )}

      {mode === 'flexible' && (
        <div className="flex flex-wrap gap-2 justify-center">
          {SEASON_OPTIONS.map((opt) => (
            <Chip
              key={opt.season}
              label={opt.label}
              selected={
                answers.dates !== null && 'season' in answers.dates && answers.dates.season === opt.season
              }
              onClick={() => chooseSeason(opt.season)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
