'use client';

import { useEffect, useReducer, useRef } from 'react';
import { quizReducer, initialAnswers, saveQuiz, loadQuiz } from '@/lib/quiz/state';
import ProgressBar from './components/ProgressBar';
import Welcome from './screens/Welcome';
import Destination from './screens/Destination';
import Party from './screens/Party';
import Origin from './screens/Origin';
import Dates from './screens/Dates';
import Budget from './screens/Budget';
import Vibes from './screens/Vibes';
import Styles from './screens/Styles';
import Dealbreakers from './screens/Dealbreakers';
import Sliders from './screens/Sliders';
import Matches from './screens/Matches';

const DISCOVER_TOTAL_STEPS = 8;
const KNOWN_TOTAL_STEPS = 4;

export default function QuizWizard() {
  const [state, dispatch] = useReducer(quizReducer, { step: 0, answers: initialAnswers() });
  const isFirstRender = useRef(true);

  // Hydrate from localStorage after mount only, so the client's first render
  // matches the server-rendered Welcome screen (no hydration mismatch), then
  // snaps to the restored step.
  useEffect(() => {
    const loaded = loadQuiz();
    if (loaded) {
      dispatch({ type: 'HYDRATE', state: loaded });
    }
  }, []);

  useEffect(() => {
    // Skip the very first commit: it's the pre-hydration state, and saving it
    // here would clobber a previously saved mid-quiz state before HYDRATE runs.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveQuiz(state);
  }, [state]);

  const { step, answers } = state;
  const isKnown = answers.path === 'known';
  const totalSteps = isKnown ? KNOWN_TOTAL_STEPS : DISCOVER_TOTAL_STEPS;
  const showProgress = step !== 0 && step !== 9;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {showProgress && (
        <ProgressBar step={step} totalSteps={totalSteps} onBack={() => dispatch({ type: 'BACK' })} />
      )}

      {step === 0 && <Welcome answers={answers} dispatch={dispatch} />}

      {isKnown ? (
        <>
          {step === 1 && <Destination answers={answers} dispatch={dispatch} />}
          {step === 2 && <Dates answers={answers} dispatch={dispatch} />}
          {step === 3 && <Party answers={answers} dispatch={dispatch} />}
          {step === 4 && <Vibes answers={answers} dispatch={dispatch} />}
        </>
      ) : (
        <>
          {step === 1 && <Party answers={answers} dispatch={dispatch} />}
          {step === 2 && <Origin answers={answers} dispatch={dispatch} />}
          {step === 3 && <Dates answers={answers} dispatch={dispatch} />}
          {step === 4 && <Budget answers={answers} dispatch={dispatch} />}
          {step === 5 && <Vibes answers={answers} dispatch={dispatch} />}
          {step === 6 && <Styles answers={answers} dispatch={dispatch} />}
          {step === 7 && <Dealbreakers answers={answers} dispatch={dispatch} />}
          {step === 8 && <Sliders answers={answers} dispatch={dispatch} />}
          {step === 9 && <Matches answers={answers} dispatch={dispatch} />}
        </>
      )}
    </div>
  );
}
