import { Dispatch } from 'react';
import { QuizAction } from '@/lib/quiz/state';
import { QuizAnswers } from '@/lib/match/types';
import { dealbreakersFor } from '@/lib/quiz/variants';
import Chip from '../components/Chip';

interface DealbreakersProps {
  answers: QuizAnswers;
  dispatch: Dispatch<QuizAction>;
}

export default function Dealbreakers({ answers, dispatch }: DealbreakersProps) {
  const tiles = dealbreakersFor(answers.party ?? 'couple');

  function skip() {
    dispatch({ type: 'CLEAR_DEALBREAKERS' });
    dispatch({ type: 'NEXT' });
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">
        Anything you definitely DON&apos;T want?
      </h1>

      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {tiles.map((t) => (
          <Chip
            key={t.db}
            label={t.label}
            selected={answers.dealbreakers.includes(t.db)}
            onClick={() => dispatch({ type: 'TOGGLE_DEALBREAKER', db: t.db })}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => dispatch({ type: 'NEXT' })}
        className="bg-brand-500 hover:bg-brand-600 text-white rounded-xl py-3.5 font-bold w-full mb-4"
      >
        Continue
      </button>

      <button
        type="button"
        onClick={skip}
        className="text-gray-500 hover:text-gray-700 text-sm font-semibold w-full text-center"
      >
        Nothing, I&apos;m flexible
      </button>
    </div>
  );
}
