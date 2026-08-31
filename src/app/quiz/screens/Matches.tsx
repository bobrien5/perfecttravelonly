import { Dispatch, useEffect, useMemo, useRef, useState } from 'react';
import { QuizAction, QuizAnswers, rankMatches } from '@vacationpro/engine';
import MatchCard from '../components/MatchCard';
import SaveGate from '../components/SaveGate';
import { getSessionId, postSession } from '../lib/session';

interface MatchesProps {
  answers: QuizAnswers;
  dispatch: Dispatch<QuizAction>;
}

const ANTICIPATION_LINES = [
  'Comparing 40+ Caribbean and Mexico destinations...',
  'Checking your travel dates...',
  'Matching your resort style...',
  'Factoring in your budget...',
  'Looking at your flight options...',
];

const LINE_DELAY_MS = 500;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function Matches({ dispatch, answers }: MatchesProps) {
  const matches = useMemo(() => rankMatches(answers), [answers]);

  const reducedMotion = useMemo(() => prefersReducedMotion(), []);
  const [phase, setPhase] = useState<'anticipation' | 'reveal'>(reducedMotion ? 'reveal' : 'anticipation');
  const [visibleLines, setVisibleLines] = useState(reducedMotion ? ANTICIPATION_LINES.length : 0);

  useEffect(() => {
    if (reducedMotion) return;

    if (visibleLines < ANTICIPATION_LINES.length) {
      const timer = setTimeout(() => setVisibleLines((n) => n + 1), LINE_DELAY_MS);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => setPhase('reveal'), LINE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [visibleLines, reducedMotion]);

  function adjustDealbreakers() {
    dispatch({ type: 'BACK' });
    dispatch({ type: 'BACK' });
  }

  if (phase === 'anticipation') {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-8">We found your best matches. 🌴</h1>
        <ul className="space-y-3 max-w-sm mx-auto">
          {ANTICIPATION_LINES.slice(0, visibleLines).map((line) => (
            <li key={line} className="text-gray-600 font-semibold">
              {line}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (matches.length < 2) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-4">Your Vacation Matches</h1>
        <p className="text-gray-600 mb-8 max-w-sm mx-auto">
          You filtered out almost everything. Loosen a dealbreaker and we&apos;ll look again.
        </p>
        <button
          type="button"
          onClick={adjustDealbreakers}
          className="bg-brand-500 hover:bg-brand-600 text-white rounded-xl py-3.5 font-bold w-full max-w-xs mx-auto block"
        >
          Adjust my dealbreakers
        </button>
      </div>
    );
  }

  return <MatchReveal matches={matches} answers={answers} />;
}

function MatchReveal({
  matches,
  answers,
}: {
  matches: ReturnType<typeof rankMatches>;
  answers: QuizAnswers;
}) {
  const [heroIndex, setHeroIndex] = useState(0);
  const [gateOpen, setGateOpen] = useState(false);
  const firedRef = useRef(false);
  const hero = matches[heroIndex];
  const runnerUps = matches.filter((_, i) => i !== heroIndex).slice(0, 3);

  const topMatches = useMemo(
    () => matches.map((m) => ({ slug: m.profile.slug, pct: m.pct })),
    [matches]
  );

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    void postSession({ sessionId: getSessionId(), answers, topMatches });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">Your Vacation Matches</h1>

      <MatchCard
        match={hero}
        onSeeTrip={() => setGateOpen(true)}
        onSaveMatches={() => setGateOpen(true)}
      />

      {gateOpen && <SaveGate onClose={() => setGateOpen(false)} />}

      {runnerUps.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-bold text-gray-700 mb-3 text-center">Other strong matches</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {runnerUps.map((m) => {
              const index = matches.indexOf(m);
              return (
                <button
                  key={m.profile.slug}
                  type="button"
                  onClick={() => setHeroIndex(index)}
                  className="border-2 border-gray-200 hover:border-brand-500 rounded-xl p-4 text-center transition-colors"
                >
                  <span className="block text-brand-500 font-extrabold text-sm mb-1">{m.pct}% MATCH</span>
                  <span className="font-semibold text-gray-900">
                    {m.profile.name} <span aria-hidden="true">{m.profile.flag}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
