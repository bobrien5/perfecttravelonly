import { Dispatch } from 'react';
import { QuizAction } from '@/lib/quiz/state';
import { QuizAnswers } from '@/lib/match/types';
import { vibeTilesFor } from '@/lib/quiz/variants';
import OptionCard from '../components/OptionCard';

interface VibesProps {
  answers: QuizAnswers;
  dispatch: Dispatch<QuizAction>;
}

const MAX_VIBES = 5;

export default function Vibes({ answers, dispatch }: VibesProps) {
  const tiles = vibeTilesFor(answers.party ?? 'couple');
  const count = answers.vibes.length;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1 text-center">
        What does your perfect vacation feel like?
      </h1>
      <p className="text-gray-600 text-center mb-2">Choose up to 5.</p>
      <p className="text-sm font-semibold text-gray-700 text-center mb-6">
        <span className="font-bold">{count}</span> of {MAX_VIBES} selected
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {tiles.map((t) => (
          <OptionCard
            key={t.vibe}
            label={t.label}
            emoji={t.emoji}
            selected={answers.vibes.includes(t.vibe)}
            onClick={() => dispatch({ type: 'TOGGLE_VIBE', vibe: t.vibe })}
          />
        ))}
      </div>

      <button
        type="button"
        disabled={count === 0}
        onClick={() => dispatch({ type: 'NEXT' })}
        className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl py-3.5 font-bold w-full"
      >
        Continue
      </button>
    </div>
  );
}
