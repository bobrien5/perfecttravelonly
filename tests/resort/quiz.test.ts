import { describe, it, expect } from 'vitest';
import {
  deserializeQuiz,
  initialResortQuizState,
  resortQuizReducer as r,
  serializeQuiz,
  stepOrder,
  validateStep,
  type ResortQuizAction,
  type ResortQuizState,
} from '@vacationpro/engine';

const TODAY = '2026-10-23';

function run(state: ResortQuizState, actions: ResortQuizAction[]): ResortQuizState {
  return actions.reduce((s, a) => r(s, a.type === 'NEXT' ? { ...a, today: TODAY } : a), state);
}

function completeDiscover(): ResortQuizState {
  return run(initialResortQuizState(), [
    { type: 'CHOOSE_ENTRY', entry: 'discover' },
    { type: 'NEXT' },
    { type: 'SET', patch: { party: 'couple', adults: 2, rooms: 1 } },
    { type: 'NEXT' },
    { type: 'SET', patch: { dates: { mode: 'flexible', month: '2027-02', nights: 6 } } },
    { type: 'NEXT' },
    { type: 'SET', patch: { airport: 'skip' } },
    { type: 'NEXT' },
    { type: 'SET', patch: { budget: { amount: 6000, currency: 'USD', includesFlights: true } } },
    { type: 'NEXT' },
    { type: 'SET', patch: { adultsOnly: 'yes' } },
    { type: 'NEXT' },
    { type: 'SET', patch: { atmosphere: 'quiet' } },
    { type: 'NEXT' },
    { type: 'TOGGLE_PRIORITY', priority: 'beach' },
    { type: 'TOGGLE_PRIORITY', priority: 'food' },
    { type: 'NEXT' },
    { type: 'NEXT' },
  ]);
}

describe('resort quiz state', () => {
  it('reaches results without email or login', () => {
    expect(completeDiscover().step).toBe('results');
  });

  it('only shows the destination step on the known path', () => {
    const s = initialResortQuizState();
    expect(stepOrder({ ...s.answers, entry: 'discover' })).not.toContain('destination');
    expect(stepOrder({ ...s.answers, entry: 'known' })).toContain('destination');
  });

  it('carries destination context into the known path', () => {
    const s = initialResortQuizState({ destination: 'aruba', resortId: 'riu-palace-antillas' });
    expect(s.answers.entry).toBe('known');
    expect(s.answers.destination).toBe('aruba');
    expect(s.answers.contextResortId).toBe('riu-palace-antillas');
  });

  it('preserves answers when navigating backward', () => {
    let s = completeDiscover();
    s = run(s, [{ type: 'BACK' }, { type: 'BACK' }, { type: 'BACK' }]);
    expect(s.step).toBe('vibe');
    expect(s.answers.priorities).toEqual(['beach', 'food']);
    expect(s.answers.budget?.amount).toBe(6000);
  });

  it('returns to results after editing a step', () => {
    let s = completeDiscover();
    s = run(s, [{ type: 'EDIT', step: 'budget' }]);
    expect(s.step).toBe('budget');
    s = run(s, [{ type: 'SET', patch: { budget: { amount: 9000, currency: 'USD', includesFlights: true } } }, { type: 'NEXT' }]);
    expect(s.step).toBe('results');
    expect(s.answers.budget?.amount).toBe(9000);
    expect(s.answers.atmosphere).toBe('quiet');
  });

  it('routes an edit through a newly required step', () => {
    let s = run(completeDiscover(), [{ type: 'EDIT', step: 'travelers' }, { type: 'SET_CHILD_COUNT', count: 1 }]);
    expect(s.answers.adultsOnly).toBeNull(); // stale "yes" dropped once children are added
    s = run(s, [{ type: 'NEXT' }]);
    expect(s.step).toBe('travelers'); // child age missing
    s = run(s, [{ type: 'SET_CHILD_AGE', index: 0, age: 7 }, { type: 'NEXT' }]);
    expect(s.step).toBe('results');
    expect(stepOrder(s.answers)).not.toContain('adults-only');
  });

  it('blocks Continue on invalid input', () => {
    const s = run(initialResortQuizState(), [{ type: 'NEXT' }]);
    expect(s.step).toBe('start');
  });

  it('caps priorities at two', () => {
    const s = run(initialResortQuizState(), [
      { type: 'TOGGLE_PRIORITY', priority: 'beach' },
      { type: 'TOGGLE_PRIORITY', priority: 'food' },
      { type: 'TOGGLE_PRIORITY', priority: 'pools' },
    ]);
    expect(s.answers.priorities).toEqual(['beach', 'food']);
  });

  it('keeps entered child ages when the count changes', () => {
    const s = run(initialResortQuizState(), [
      { type: 'SET_CHILD_COUNT', count: 2 },
      { type: 'SET_CHILD_AGE', index: 0, age: 9 },
      { type: 'SET_CHILD_COUNT', count: 3 },
    ]);
    expect(s.answers.childAges).toEqual([9, -1, -1]);
  });

  it('round-trips through storage and rejects foreign data', () => {
    const s = completeDiscover();
    expect(deserializeQuiz(serializeQuiz(s))).toEqual(s);
    expect(deserializeQuiz('{"step":0,"answers":{}}')).toBeNull();
    expect(deserializeQuiz('not json')).toBeNull();
  });
});

describe('step validation', () => {
  const base = initialResortQuizState().answers;

  it('validates dates', () => {
    expect(validateStep('dates', { ...base, dates: { mode: 'exact', checkIn: '2026-10-01', checkOut: '2026-10-05' } }, TODAY).checkIn).toMatch(/past/);
    expect(validateStep('dates', { ...base, dates: { mode: 'exact', checkIn: '2026-12-10', checkOut: '2026-12-10' } }, TODAY).checkOut).toMatch(/after/);
    expect(validateStep('dates', { ...base, dates: { mode: 'exact', checkIn: '2026-12-10', checkOut: '2027-02-10' } }, TODAY).checkOut).toMatch(/30 nights/);
    expect(validateStep('dates', { ...base, dates: { mode: 'flexible', month: null, nights: 5 } }, TODAY)).toEqual({});
    expect(validateStep('dates', { ...base, dates: { mode: 'flexible', month: '2026-01', nights: 5 } }, TODAY).month).toMatch(/passed/);
  });

  it('validates occupancy', () => {
    expect(validateStep('travelers', { ...base, party: 'friends', adults: 1, rooms: 2 }).rooms).toMatch(/at least one adult/);
    expect(validateStep('travelers', { ...base, party: 'family', adults: 2, childAges: [3, 4, 5, 6], rooms: 1 }).rooms).toMatch(/per room/);
    expect(validateStep('travelers', { ...base, party: 'family', adults: 2, childAges: [-1], rooms: 1 })['child-0']).toBeDefined();
  });

  it('validates budget', () => {
    expect(validateStep('budget', { ...base, budget: { amount: 50, currency: 'USD', includesFlights: false } }).amount).toBeDefined();
    expect(validateStep('budget', { ...base, budget: { amount: 5000, currency: 'USD', includesFlights: null } }).includesFlights).toBeDefined();
    expect(validateStep('budget', { ...base, budget: { amount: null, currency: 'USD', includesFlights: null } })).toEqual({});
  });
});
