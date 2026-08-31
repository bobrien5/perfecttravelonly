import { describe, it, expect } from 'vitest';
import { DESTINATION_PROFILES } from '@/lib/match/destinations';
import { ALL_VIBES } from '@/lib/match/types';

describe('destination profiles', () => {
  it('has 25 unique destinations', () => {
    expect(DESTINATION_PROFILES).toHaveLength(25);
    const slugs = DESTINATION_PROFILES.map(d => d.slug);
    expect(new Set(slugs).size).toBe(25);
  });
  it('every profile is complete and internally valid', () => {
    for (const d of DESTINATION_PROFILES) {
      expect(d.blurb.length).toBeGreaterThan(20);
      expect(d.blurb).not.toMatch(/[–—]/); // no em or en dashes
      expect(Object.keys(d.vibes).length).toBeGreaterThanOrEqual(5);
      for (const v of Object.keys(d.vibes)) expect(ALL_VIBES).toContain(v);
      expect(d.styles.length).toBeGreaterThan(0);
      expect(d.budgetBands.length).toBeGreaterThan(0);
      expect(d.bestMonths.length).toBeGreaterThan(0);
      expect(d.typicalFlightHours).toBeGreaterThan(1);
    }
  });
});
