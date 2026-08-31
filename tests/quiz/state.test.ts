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
  it('HYDRATE replaces step and answers wholesale', () => {
    const restored: QuizState = {
      step: 4,
      answers: { ...initialAnswers(), party: 'family' as const, budget: { band: 3 as const, includesFlights: true } },
    };
    const s = quizReducer(s0, { type: 'HYDRATE', state: restored });
    expect(s).toEqual(restored);
  });
  it('SET_OCCASION sets answers.occasion', () => {
    const s = quizReducer(s0, { type: 'SET_OCCASION', occasion: 'Birthday' });
    expect(s.answers.occasion).toBe('Birthday');
  });

  describe('known path', () => {
    it('NEXT from destination (step 1) goes to dates (step 2)', () => {
      let s: QuizState = { step: 0, answers: initialAnswers() };
      s = quizReducer(s, { type: 'SET_PATH', path: 'known', destinationSlug: 'aruba' });
      s = quizReducer(s, { type: 'NEXT' }); // welcome -> step 1 (destination)
      expect(s.step).toBe(1);
      s = quizReducer(s, { type: 'NEXT' }); // destination -> step 2 (dates)
      expect(s.step).toBe(2);
    });

    it('known path completes at the vibes step (caps at 4, does not run to matches)', () => {
      let s: QuizState = { step: 0, answers: initialAnswers() };
      s = quizReducer(s, { type: 'SET_PATH', path: 'known', destinationSlug: 'aruba' });
      s = quizReducer(s, { type: 'NEXT' }); // -> 1 destination
      s = quizReducer(s, { type: 'NEXT' }); // -> 2 dates
      s = quizReducer(s, { type: 'NEXT' }); // -> 3 party (dates skippable)
      s = quizReducer(s, { type: 'SET_PARTY', party: 'couple' });
      s = quizReducer(s, { type: 'NEXT' }); // -> 4 vibes
      expect(s.step).toBe(4);
      s = quizReducer(s, { type: 'TOGGLE_VIBE', vibe: 'beach' });
      s = quizReducer(s, { type: 'NEXT' }); // caps at 4, no matches phase for known path
      expect(s.step).toBe(4);
    });
  });
});
