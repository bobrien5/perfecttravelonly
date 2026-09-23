import { describe, it, expect } from 'vitest';
import { RESORTS } from '../../scripts/seed-resorts-data.mjs';
import { ALL_VIBES, type ResortStyle } from '@vacationpro/engine';

const DESTINATIONS = ['aruba', 'punta-cana', 'cancun', 'riviera-maya'];
const RESORT_STYLES: ResortStyle[] = [
  'allinclusive', 'luxuryresort', 'boutique', 'beachfront',
  'adultsonly', 'familyresort', 'nearnightlife',
];
const EM_EN_DASH = /[–—]/;

describe('RESORTS seed data', () => {
  // These were exact counts (24 total, 6 per destination) when the seed was
  // first written. They are minimums now, because the set is meant to grow as
  // resorts are researched. The invariant worth protecting is not the number,
  // it is that no destination silently loses its resorts: below roughly six,
  // the matcher returns the same handful whatever the traveler answers, which
  // looks like a broken quiz rather than thin data.
  it('has at least 24 entries', () => {
    expect(RESORTS.length).toBeGreaterThanOrEqual(24);
  });

  it('has at least 6 entries per destination', () => {
    for (const dest of DESTINATIONS) {
      const count = RESORTS.filter((r) => r.destinationSlug === dest).length;
      expect(count, `expected at least 6 resorts for ${dest}`).toBeGreaterThanOrEqual(6);
    }
  });

  it('only uses the four known destination slugs', () => {
    for (const r of RESORTS) {
      expect(DESTINATIONS).toContain(r.destinationSlug);
    }
  });

  it('has unique slugs across all resorts', () => {
    const slugs = RESORTS.map((r) => r.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('has a non-empty name for every resort', () => {
    for (const r of RESORTS) {
      expect(typeof r.name).toBe('string');
      expect(r.name.length).toBeGreaterThan(0);
    }
  });

  it('has priceBand within 1-3 for every resort', () => {
    for (const r of RESORTS) {
      expect([1, 2, 3]).toContain(r.priceBand);
    }
  });

  it('has styles that are a non-empty subset of ResortStyle values', () => {
    for (const r of RESORTS) {
      expect(Array.isArray(r.styles)).toBe(true);
      expect(r.styles.length).toBeGreaterThan(0);
      for (const s of r.styles) {
        expect(RESORT_STYLES).toContain(s);
      }
    }
  });

  it('has vibeScores with at least 4 keys, all valid Vibe values, values 0-3', () => {
    for (const r of RESORTS) {
      const keys = Object.keys(r.vibeScores);
      expect(keys.length).toBeGreaterThanOrEqual(4);
      for (const key of keys) {
        expect(ALL_VIBES).toContain(key);
        const val = r.vibeScores[key as keyof typeof r.vibeScores];
        expect([0, 1, 2, 3]).toContain(val);
      }
    }
  });

  it('has boolean adultsOnly and allInclusive flags', () => {
    for (const r of RESORTS) {
      expect(typeof r.adultsOnly).toBe('boolean');
      expect(typeof r.allInclusive).toBe('boolean');
    }
  });

  it('marks adultsonly style for every adultsOnly resort', () => {
    for (const r of RESORTS) {
      if (r.adultsOnly) {
        expect(r.styles).toContain('adultsonly');
      }
    }
  });

  it('marks allinclusive style for every allInclusive resort', () => {
    for (const r of RESORTS) {
      if (r.allInclusive) {
        expect(r.styles).toContain('allinclusive');
      }
    }
  });

  it('has verdicts over 20 characters with no em/en dashes', () => {
    for (const r of RESORTS) {
      expect(typeof r.verdict).toBe('string');
      expect(r.verdict.length).toBeGreaterThan(20);
      expect(EM_EN_DASH.test(r.verdict)).toBe(false);
    }
  });

  it('limits verdicts to 1-2 sentences', () => {
    for (const r of RESORTS) {
      const sentenceCount = (r.verdict.match(/[.!?]+(\s|$)/g) || []).length;
      expect(sentenceCount, `${r.slug} verdict: "${r.verdict}"`).toBeGreaterThanOrEqual(1);
      expect(sentenceCount, `${r.slug} verdict: "${r.verdict}"`).toBeLessThanOrEqual(2);
    }
  });

  it('has a non-empty expediaUrl pointing at expedia.com', () => {
    for (const r of RESORTS) {
      expect(typeof r.expediaUrl).toBe('string');
      expect(r.expediaUrl.startsWith('https://www.expedia.com/')).toBe(true);
    }
  });

  it('allows heroImageUrl to be an empty string or a url', () => {
    for (const r of RESORTS) {
      expect(typeof r.heroImageUrl).toBe('string');
    }
  });
});
