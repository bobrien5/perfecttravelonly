'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { track } from '@vercel/analytics';
import { quizReducer, initialAnswers, saveQuiz, loadQuiz } from '@vacationpro/engine';
import { getSessionId } from './lib/session';
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
  // Steps whose quiz_step event has already fired this session, so mount
  // (step 0) and the post-HYDRATE re-render onto a restored step don't
  // double-fire the same step's event.
  const firedStepsRef = useRef<Set<number>>(new Set());
  // quiz_complete should fire once per session, not re-fire when a user
  // backs off the matches screen (step 9) and returns to it.
  const firedCompleteRef = useRef(false);
  // The /quiz?claim=1 effect below runs once per mount, guarded by this ref.
  const claimFiredRef = useRef(false);
  const [claimError, setClaimError] = useState(false);

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

  useEffect(() => {
    if (firedStepsRef.current.has(step)) return;
    firedStepsRef.current.add(step);
    track('quiz_step', { step, path: answers.path });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    if (!isKnown && step === 9 && !firedCompleteRef.current) {
      firedCompleteRef.current = true;
      track('quiz_complete');
    }
  }, [step, isKnown]);

  const runClaim = useCallback(async () => {
    setClaimError(false);
    try {
      const res = await fetch('/api/claim-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: getSessionId() }),
      });

      if (res.status === 401) {
        window.location.assign('/auth/signin?next=' + encodeURIComponent('/quiz?claim=1'));
        return;
      }

      if (!res.ok) {
        setClaimError(true);
        return;
      }

      const data = (await res.json()) as { ok: boolean; tripId?: string };
      if (data.ok && data.tripId) {
        // The claim response carries no destination field, so trip_created
        // fires with no payload rather than a fabricated one.
        track('trip_created');
        window.location.assign(`/trips/${data.tripId}`);
      } else {
        setClaimError(true);
      }
    } catch {
      setClaimError(true);
    }
  }, []);

  // /quiz?claim=1: the sign-in callback lands back here after the account
  // gate. Claim the anonymous session once and route to the new trip.
  useEffect(() => {
    if (claimFiredRef.current) return;
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('claim') !== '1') return;

    claimFiredRef.current = true;
    void runClaim();
  }, [runClaim]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {showProgress && (
        <ProgressBar step={step} totalSteps={totalSteps} onBack={() => dispatch({ type: 'BACK' })} />
      )}

      {claimError && (
        <div className="mb-6 rounded-xl border-2 border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm font-semibold text-red-700 mb-2">We could not save your trip. Try again.</p>
          <button
            type="button"
            onClick={() => void runClaim()}
            className="text-sm font-bold text-red-700 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
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
