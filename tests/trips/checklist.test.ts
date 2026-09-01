import { describe, it, expect } from 'vitest';
import { toggleChecklist, checklistProgress, type Checklist } from '@/lib/trips/data';

const base: Checklist = {
  destination: true,
  resort: false,
  flights: false,
  things: false,
  itinerary: false,
  book: false,
};

describe('toggleChecklist', () => {
  it('returns a new object, not mutating the input', () => {
    const result = toggleChecklist(base, 'resort', true);
    expect(result).not.toBe(base);
    expect(base.resort).toBe(false);
    expect(result.resort).toBe(true);
  });

  it('sets the given step to the given value', () => {
    expect(toggleChecklist(base, 'flights', true).flights).toBe(true);
    expect(toggleChecklist({ ...base, book: true }, 'book', false).book).toBe(false);
  });

  it('leaves other steps untouched', () => {
    const result = toggleChecklist(base, 'resort', true);
    expect(result.destination).toBe(true);
    expect(result.flights).toBe(false);
    expect(result.things).toBe(false);
    expect(result.itinerary).toBe(false);
    expect(result.book).toBe(false);
  });

  it('returns the input unchanged for an unknown step', () => {
    const result = toggleChecklist(base, 'notarealstep' as unknown as keyof Checklist, true);
    expect(result).toEqual(base);
  });
});

describe('checklistProgress', () => {
  it('counts done steps out of a total of 6', () => {
    expect(checklistProgress(base)).toEqual({ done: 1, total: 6 });
  });

  it('counts zero done', () => {
    const empty: Checklist = {
      destination: false,
      resort: false,
      flights: false,
      things: false,
      itinerary: false,
      book: false,
    };
    expect(checklistProgress(empty)).toEqual({ done: 0, total: 6 });
  });

  it('counts all six done', () => {
    const all: Checklist = {
      destination: true,
      resort: true,
      flights: true,
      things: true,
      itinerary: true,
      book: true,
    };
    expect(checklistProgress(all)).toEqual({ done: 6, total: 6 });
  });
});
