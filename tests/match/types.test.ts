import { describe, it, expect } from 'vitest';
import { BUDGET_BANDS, ALL_VIBES, ALL_DEALBREAKERS } from '@/lib/match/types';

describe('match types', () => {
  it('exposes 5 budget bands with labels', () => {
    expect(BUDGET_BANDS).toHaveLength(5);
    expect(BUDGET_BANDS[0].label).toBe('Under $2,500');
    expect(BUDGET_BANDS[4].label).toBe('$10,000+');
  });
  it('has 19 vibes and 10 dealbreakers', () => {
    expect(ALL_VIBES).toHaveLength(19);
    expect(ALL_DEALBREAKERS).toHaveLength(10);
  });
});
