import { Dispatch, useState } from 'react';
import { QuizAction, QuizAnswers } from '@vacationpro/engine';

interface SlidersProps {
  answers: QuizAnswers;
  dispatch: Dispatch<QuizAction>;
}

export default function Sliders({ answers, dispatch }: SlidersProps) {
  const [pace, setPace] = useState(answers.pace);
  const [exploration, setExploration] = useState(answers.exploration);

  function seeMatches() {
    dispatch({ type: 'SET_SLIDERS', pace, exploration });
    dispatch({ type: 'NEXT' });
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-8 text-center">
        How do you like to vacation?
      </h1>

      <div className="mb-8">
        <input
          type="range"
          min={0}
          max={100}
          value={pace}
          onChange={(e) => setPace(Number(e.target.value))}
          className="w-full accent-brand-500"
        />
        <div className="flex justify-between text-sm font-semibold text-gray-700 mt-2">
          <span>Relaxed</span>
          <span>Packed with activities</span>
        </div>
      </div>

      <div className="mb-8">
        <input
          type="range"
          min={0}
          max={100}
          value={exploration}
          onChange={(e) => setExploration(Number(e.target.value))}
          className="w-full accent-brand-500"
        />
        <div className="flex justify-between text-sm font-semibold text-gray-700 mt-2">
          <span>Stay at the resort</span>
          <span>Explore the destination</span>
        </div>
      </div>

      <button
        type="button"
        onClick={seeMatches}
        className="bg-brand-500 hover:bg-brand-600 text-white rounded-xl py-3.5 font-bold w-full"
      >
        See My Matches
      </button>
    </div>
  );
}
