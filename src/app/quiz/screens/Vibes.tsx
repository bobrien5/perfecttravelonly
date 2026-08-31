import { Dispatch, useRef, useState } from 'react';
import { track } from '@vercel/analytics';
import { QuizAction, QuizAnswers, vibeTilesFor, DESTINATION_PROFILES } from '@vacationpro/engine';
import OptionCard from '../components/OptionCard';
import SaveGate from '../components/SaveGate';
import { getSessionId, postSession } from '../lib/session';

interface VibesProps {
  answers: QuizAnswers;
  dispatch: Dispatch<QuizAction>;
}

const MAX_VIBES = 5;

export default function Vibes({ answers, dispatch }: VibesProps) {
  const tiles = vibeTilesFor(answers.party ?? 'couple');
  const count = answers.vibes.length;
  const isKnown = answers.path === 'known';
  const destination = isKnown
    ? DESTINATION_PROFILES.find((d) => d.slug === answers.destinationSlug)
    : undefined;
  const [gateOpen, setGateOpen] = useState(false);
  const firedRef = useRef(false);

  function handleContinue() {
    if (!isKnown) {
      dispatch({ type: 'NEXT' });
      return;
    }

    // Known path skips the matches phase: go straight to the SaveGate with the
    // single chosen destination as the only (100%) match.
    setGateOpen(true);
    if (!firedRef.current) {
      firedRef.current = true;
      track('quiz_complete');
      void postSession({
        sessionId: getSessionId(),
        answers,
        topMatches: destination ? [{ slug: destination.slug, pct: 100 }] : [],
      });
    }
  }

  function handleSaveEmail(email: string): Promise<boolean> {
    return postSession({
      sessionId: getSessionId(),
      answers,
      topMatches: destination ? [{ slug: destination.slug, pct: 100 }] : [],
      email,
    });
  }

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
        onClick={handleContinue}
        className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl py-3.5 font-bold w-full"
      >
        {isKnown ? `Build My ${destination?.name ?? 'Trip'} Trip` : 'Continue'}
      </button>

      {gateOpen && <SaveGate onClose={() => setGateOpen(false)} onSubmit={handleSaveEmail} />}
    </div>
  );
}
