'use client';

import { useEffect, useReducer, useRef, useState } from 'react';
import {
  RESORT_QUIZ_STORAGE_KEY,
  deserializeQuiz,
  firstIncompleteStep,
  initialResortQuizState,
  progressFor,
  resortQuizReducer,
  serializeQuiz,
  stepOrder,
  validateStep,
  type QuizContext,
  type ResortQuizAction,
  type ResortQuizState,
  type StepErrors,
} from '@vacationpro/engine';
import { trackFunnel } from '@/lib/analytics/journey';
import {
  AdultsOnlyStep,
  AirportStep,
  BudgetStep,
  DatesStep,
  DealbreakersStep,
  DestinationStep,
  PrioritiesStep,
  StartStep,
  TravelersStep,
  VibeStep,
} from './steps';
import Results from './Results';
import { primaryButton, secondaryButton } from './ui';

const HEADING_ID = 'quiz-step-heading';

function readStored(): ResortQuizState | null {
  try {
    return deserializeQuiz(window.localStorage.getItem(RESORT_QUIZ_STORAGE_KEY));
  } catch {
    return null;
  }
}

function writeStored(state: ResortQuizState) {
  try {
    window.localStorage.setItem(RESORT_QUIZ_STORAGE_KEY, serializeQuiz(state));
  } catch {
    // storage unavailable: the quiz still works, it just will not resume
  }
}

/**
 * Applies referring context (?destination=, ?resort=) to a restored session.
 * New context wins over a stale destination, but never wipes other answers.
 */
function withContext(state: ResortQuizState, ctx: QuizContext): ResortQuizState {
  if (!ctx.destination && !ctx.resortId) return state;
  const a = { ...state.answers };
  if (ctx.resortId) a.contextResortId = ctx.resortId;
  if (ctx.destination && a.destination !== ctx.destination) {
    a.destination = ctx.destination;
    a.entry = 'known';
    return { ...state, answers: a, step: state.step === 'results' ? 'results' : 'start', returnTo: null };
  }
  return { ...state, answers: a };
}

export default function ResortQuiz({ context, contextResortName = null }: { context: QuizContext; contextResortName?: string | null }) {
  const [state, rawDispatch] = useReducer(resortQuizReducer, context, initialResortQuizState);
  const [hydrated, setHydrated] = useState(false);
  const [errors, setErrors] = useState<StepErrors>({});
  const startedRef = useRef(false);
  const completedRef = useRef(false);
  const editingRef = useRef(false);
  const prevStep = useRef(state.step);

  // Restore after mount so server and first client render match.
  useEffect(() => {
    const stored = readStored();
    if (stored) {
      let next = withContext(stored, context);
      // A stored "results" step is only honored when every answer is still valid.
      if (next.step === 'results') {
        const missing = firstIncompleteStep(next.answers);
        if (missing) next = { ...next, step: missing };
      }
      rawDispatch({ type: 'HYDRATE', state: next });
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (hydrated) writeStored(state);
  }, [state, hydrated]);

  // Move focus to the new step's heading so keyboard and screen-reader users land on it.
  useEffect(() => {
    if (prevStep.current === state.step) return;
    prevStep.current = state.step;
    setErrors({});
    requestAnimationFrame(() => {
      document.getElementById(HEADING_ID)?.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    if (state.step === 'results') {
      if (!completedRef.current) {
        completedRef.current = true;
        trackFunnel('quiz_complete', { entry: state.answers.entry, destination: state.answers.destination });
      }
      if (editingRef.current) {
        editingRef.current = false;
        trackFunnel('recommendations_revised');
      }
    }
  }, [state.step, state.answers.entry, state.answers.destination]);

  function dispatch(action: ResortQuizAction) {
    if (action.type === 'CHOOSE_ENTRY' && !startedRef.current) {
      startedRef.current = true;
      trackFunnel('quiz_start', { entry: action.entry });
    }
    if (action.type === 'EDIT') editingRef.current = true;
    rawDispatch(action);
  }

  function next() {
    const errs = validateStep(state.step, state.answers);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      requestAnimationFrame(() => {
        const first = document.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]');
        first?.focus?.();
        first?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      });
      return;
    }
    trackFunnel('quiz_step_complete', { step: state.step });
    dispatch({ type: 'NEXT' });
  }

  const { step, answers } = state;
  const props = { answers, dispatch, errors, headingId: HEADING_ID };
  const progress = progressFor(state);
  const showNav = step !== 'results';

  // Until saved answers are read, show a neutral placeholder rather than the
  // start screen, so a returning visitor does not see a flash of step one.
  if (!hydrated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10" aria-busy="true">
        <p className="text-gray-600" role="status">Loading your trip…</p>
      </div>
    );
  }

  if (step === 'results') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
        <Results state={state} dispatch={dispatch} headingId={HEADING_ID} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      {step !== 'start' && (
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm font-semibold text-gray-600">
            <span>
              Question {progress.index} of {progress.total}
            </span>
            {state.returnTo === 'results' && <span className="text-brand-800">Editing your answers</span>}
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-gray-200"
            role="progressbar"
            aria-label="Quiz progress"
            aria-valuemin={1}
            aria-valuemax={progress.total}
            aria-valuenow={progress.index}
          >
            <div className="h-full rounded-full bg-brand-700 transition-all" style={{ width: `${(progress.index / progress.total) * 100}%` }} />
          </div>
        </div>
      )}

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
      >
        {step === 'start' && <StartStep {...props} contextResortName={answers.contextResortId === context.resortId ? contextResortName : null} />}
        {step === 'destination' && <DestinationStep {...props} />}
        {step === 'travelers' && <TravelersStep {...props} />}
        {step === 'dates' && <DatesStep {...props} />}
        {step === 'airport' && <AirportStep {...props} />}
        {step === 'budget' && <BudgetStep {...props} />}
        {step === 'adults-only' && <AdultsOnlyStep {...props} />}
        {step === 'vibe' && <VibeStep {...props} />}
        {step === 'priorities' && <PrioritiesStep {...props} />}
        {step === 'dealbreakers' && <DealbreakersStep {...props} />}

        {showNav && (
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            {step !== 'start' ? (
              <button type="button" onClick={() => dispatch({ type: 'BACK' })} className={secondaryButton}>
                {state.returnTo === 'results' ? 'Back to results' : 'Back'}
              </button>
            ) : (
              <span />
            )}
            <button type="submit" className={primaryButton}>
              {state.returnTo === 'results'
                ? 'Update my results'
                : stepOrder(answers).at(-2) === step
                  ? 'Show my resorts'
                  : 'Continue'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
