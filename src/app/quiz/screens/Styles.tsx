import { Dispatch } from 'react';
import { QuizAction, QuizAnswers, stylesFor } from '@vacationpro/engine';
import OptionCard from '../components/OptionCard';
import Chip from '../components/Chip';

interface StylesProps {
  answers: QuizAnswers;
  dispatch: Dispatch<QuizAction>;
}

export default function Styles({ answers, dispatch }: StylesProps) {
  const tiles = stylesFor(answers.party ?? 'couple');

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">
        What kind of stay sounds best?
      </h1>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {tiles.map((t) => (
          <OptionCard
            key={t.style}
            label={t.label}
            emoji={t.emoji}
            selected={answers.styles.includes(t.style)}
            onClick={() => dispatch({ type: 'TOGGLE_STYLE', style: t.style })}
          />
        ))}
      </div>

      <div className="flex justify-center mb-6">
        <Chip
          label="No preference"
          selected={answers.styles.includes('nopref')}
          onClick={() => dispatch({ type: 'TOGGLE_STYLE', style: 'nopref' })}
        />
      </div>

      <button
        type="button"
        disabled={answers.styles.length === 0}
        onClick={() => dispatch({ type: 'NEXT' })}
        className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl py-3.5 font-bold w-full"
      >
        Continue
      </button>
    </div>
  );
}
