import { Dispatch } from 'react';
import { QuizAction } from '@/lib/quiz/state';
import { QuizAnswers } from '@/lib/match/types';

interface WelcomeProps {
  answers: QuizAnswers;
  dispatch: Dispatch<QuizAction>;
}

export default function Welcome({ dispatch }: WelcomeProps) {
  return (
    <div className="text-center py-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
        Let&apos;s find your perfect vacation. 🌴
      </h1>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Tell us what you&apos;re looking for and we&apos;ll match you with the destinations, resorts and
        experiences that fit you best.
      </p>

      <button
        type="button"
        onClick={() => dispatch({ type: 'NEXT' })}
        className="bg-brand-500 hover:bg-brand-600 text-white rounded-xl py-3.5 font-bold w-full max-w-xs mx-auto block"
      >
        Find My Vacation
      </button>

      <button
        type="button"
        onClick={() => {
          dispatch({ type: 'SET_PATH', path: 'known' });
          dispatch({ type: 'NEXT' });
        }}
        className="mt-5 text-sm font-semibold text-gray-500 hover:text-gray-700"
      >
        I already know where I&apos;m going →
      </button>
    </div>
  );
}
