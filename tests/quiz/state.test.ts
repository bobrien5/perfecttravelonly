import { describe, it, expect } from 'vitest';
import { quizReducer, initialAnswers, QuizState } from '@/lib/quiz/state';

const s0: QuizState = { step: 1, answers: initialAnswers() };

describe('quizReducer', () => {
  it('caps vibes at 5', () => {
    let s: QuizState = { ...s0, answers: { ...s0.answers, party: 'couple' as const } };
    for (const v of ['beach', 'pool', 'luxury', 'value', 'food', 'nightlife'] as const) {
      s = quizReducer(s, { type: 'TOGGLE_VIBE', vibe: v });
    }
    expect(s.answers.vibes).toHaveLength(5);
  });
  it('SET_PARTY family prunes romantic vibe and adultsonly style', () => {
    let s: QuizState = { ...s0, answers: { ...s0.answers, vibes: ['romantic' as const], styles: ['adultsonly' as const] } };
    s = quizReducer(s, { type: 'SET_PARTY', party: 'family' });
    expect(s.answers.vibes).not.toContain('romantic');
    expect(s.answers.styles).not.toContain('adultsonly');
  });
  it('NEXT blocks on required empty screens', () => {
    const s = quizReducer({ step: 1, answers: initialAnswers() }, { type: 'NEXT' });
    expect(s.step).toBe(1); // party still null
  });
  it('nopref clears other styles', () => {
    let s: QuizState = { ...s0, answers: { ...s0.answers, styles: ['allinclusive' as const] } };
    s = quizReducer(s, { type: 'TOGGLE_STYLE', style: 'nopref' });
    expect(s.answers.styles).toEqual(['nopref']);
  });
});
