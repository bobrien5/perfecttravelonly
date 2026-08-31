import { describe, it, expect, afterEach } from 'vitest';
import { quizReducer, initialAnswers, loadQuiz, QuizState } from '@/lib/quiz/state';

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

    it('backing out of the known path and choosing discover resets path and destinationSlug, and NEXT can advance past step 4', () => {
      let s: QuizState = { step: 0, answers: initialAnswers() };
      s = quizReducer(s, { type: 'SET_PATH', path: 'known', destinationSlug: 'aruba' });
      s = quizReducer(s, { type: 'NEXT' }); // welcome -> step 1 (destination)
      expect(s.step).toBe(1);
      s = quizReducer(s, { type: 'BACK' }); // destination -> welcome (path is still stale 'known' here)
      expect(s.step).toBe(0);

      s = quizReducer(s, { type: 'SET_PATH', path: 'discover' }); // Welcome's "Find My Vacation"
      expect(s.answers.path).toBe('discover');
      expect(s.answers.destinationSlug).toBeUndefined();

      s = quizReducer(s, { type: 'NEXT' }); // welcome -> step 1 (party, discover sequence)
      expect(s.step).toBe(1);

      s = quizReducer(s, { type: 'SET_PARTY', party: 'couple' });
      s = quizReducer(s, { type: 'NEXT' }); // party -> 2 origin
      s = quizReducer(s, { type: 'NEXT' }); // origin -> 3 dates
      s = quizReducer(s, { type: 'NEXT' }); // dates -> 4 budget
      s = quizReducer(s, { type: 'SET_BUDGET', budget: { band: 3, includesFlights: true } });
      s = quizReducer(s, { type: 'NEXT' }); // budget -> 5 vibes, proving NEXT advances past the known-path cap of 4
      expect(s.step).toBe(5);
    });
  });
});

describe('loadQuiz', () => {
  const STORAGE_KEY = 'vacationpro.quiz.v1';

  function withStoredValue(raw: string | null): QuizState | null {
    const store = new Map<string, string>();
    if (raw !== null) store.set(STORAGE_KEY, raw);

    const fakeLocalStorage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => { store.set(key, value); },
    };

    // node test environment has no `window`; stub just enough for loadQuiz.
    (globalThis as unknown as { window: unknown }).window = { localStorage: fakeLocalStorage };
    try {
      return loadQuiz();
    } finally {
      delete (globalThis as unknown as { window?: unknown }).window;
    }
  }

  afterEach(() => {
    delete (globalThis as unknown as { window?: unknown }).window;
  });

  it('returns null when nothing is stored', () => {
    expect(withStoredValue(null)).toBeNull();
  });

  it('returns null for malformed JSON', () => {
    expect(withStoredValue('not json{{{')).toBeNull();
  });

  it('returns null when the shape does not match QuizState (missing arrays, bad step)', () => {
    expect(withStoredValue(JSON.stringify({ step: 1, answers: { vibes: [], styles: [] } }))).toBeNull(); // missing dealbreakers
    expect(withStoredValue(JSON.stringify({ step: 'oops', answers: { vibes: [], styles: [], dealbreakers: [] } }))).toBeNull();
    expect(withStoredValue(JSON.stringify({ step: 999, answers: { vibes: [], styles: [], dealbreakers: [] } }))).toBeNull();
    expect(withStoredValue(JSON.stringify({ step: 1, answers: null }))).toBeNull();
    expect(withStoredValue('null')).toBeNull();
    expect(withStoredValue('"a string"')).toBeNull();
  });

  it('returns the parsed state for a well-formed value', () => {
    const valid: QuizState = { step: 2, answers: initialAnswers() };
    expect(withStoredValue(JSON.stringify(valid))).toEqual(valid);
  });
});
