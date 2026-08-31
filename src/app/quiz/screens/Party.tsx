import { Dispatch } from 'react';
import { QuizAction } from '@/lib/quiz/state';
import { Party as PartyType, QuizAnswers } from '@/lib/match/types';
import OptionCard from '../components/OptionCard';
import Chip from '../components/Chip';

interface PartyProps {
  answers: QuizAnswers;
  dispatch: Dispatch<QuizAction>;
}

const PARTY_OPTIONS: { party: PartyType; emoji: string; label: string }[] = [
  { party: 'couple', emoji: '💑', label: 'Couple' },
  { party: 'family', emoji: '👨‍👩‍👧‍👦', label: 'Family' },
  { party: 'friends', emoji: '🎉', label: 'Friends' },
  { party: 'solo', emoji: '🧳', label: 'Solo' },
  { party: 'honeymoon', emoji: '💍', label: 'Honeymoon' },
  { party: 'celebration', emoji: '🥳', label: 'Celebration' },
];

const KIDS_COUNT_OPTIONS: { count: '1' | '2' | '3+'; label: string }[] = [
  { count: '1', label: '1' },
  { count: '2', label: '2' },
  { count: '3+', label: '3+' },
];

const KIDS_AGE_OPTIONS: { age: 'under5' | '5-12' | 'teens'; label: string }[] = [
  { age: 'under5', label: 'Under 5' },
  { age: '5-12', label: '5-12' },
  { age: 'teens', label: 'Teens' },
];

const OCCASION_OPTIONS = ['Birthday', 'Anniversary', 'Bachelorette', 'Girls trip', 'Guys trip', 'Reunion'];

export default function Party({ answers, dispatch }: PartyProps) {
  const needsExtraStep = answers.party === 'family' || answers.party === 'celebration';

  function selectParty(party: PartyType) {
    dispatch({ type: 'SET_PARTY', party });
    if (party !== 'family' && party !== 'celebration') {
      dispatch({ type: 'NEXT' });
    }
  }

  function toggleKidsAge(age: 'under5' | '5-12' | 'teens') {
    const current = answers.kidsAges ?? [];
    const ages = current.includes(age) ? current.filter((a) => a !== age) : [...current, age];
    dispatch({ type: 'SET_KIDS', count: answers.kidsCount, ages });
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">Who&apos;s coming along?</h1>

      <div className="grid grid-cols-2 gap-3">
        {PARTY_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.party}
            label={opt.label}
            emoji={opt.emoji}
            selected={answers.party === opt.party}
            onClick={() => selectParty(opt.party)}
          />
        ))}
      </div>

      {answers.party === 'family' && (
        <div className="mt-6">
          <p className="font-semibold text-gray-900 mb-2">How many kids?</p>
          <div className="flex gap-2 mb-4">
            {KIDS_COUNT_OPTIONS.map((opt) => (
              <Chip
                key={opt.count}
                label={opt.label}
                selected={answers.kidsCount === opt.count}
                onClick={() => dispatch({ type: 'SET_KIDS', count: opt.count, ages: answers.kidsAges })}
              />
            ))}
          </div>

          <p className="font-semibold text-gray-900 mb-2">How old?</p>
          <div className="flex flex-wrap gap-2">
            {KIDS_AGE_OPTIONS.map((opt) => (
              <Chip
                key={opt.age}
                label={opt.label}
                selected={(answers.kidsAges ?? []).includes(opt.age)}
                onClick={() => toggleKidsAge(opt.age)}
              />
            ))}
          </div>
        </div>
      )}

      {answers.party === 'celebration' && (
        <div className="mt-6">
          <p className="font-semibold text-gray-900 mb-2">What are you celebrating?</p>
          <div className="flex flex-wrap gap-2">
            {OCCASION_OPTIONS.map((label) => (
              <Chip
                key={label}
                label={label}
                selected={answers.occasion === label}
                onClick={() => dispatch({ type: 'SET_OCCASION', occasion: label })}
              />
            ))}
          </div>
        </div>
      )}

      {needsExtraStep && (
        <button
          type="button"
          onClick={() => dispatch({ type: 'NEXT' })}
          className="bg-brand-500 hover:bg-brand-600 text-white rounded-xl py-3.5 font-bold w-full mt-6"
        >
          Continue
        </button>
      )}
    </div>
  );
}
