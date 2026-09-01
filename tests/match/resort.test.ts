import { describe, it, expect } from 'vitest';
import { scoreResort, rankResorts, type ResortAttrs, type ResortTripInput } from '@vacationpro/engine';

function makeResort(overrides: Partial<ResortAttrs> = {}): ResortAttrs {
  return {
    slug: 'test-resort',
    name: 'Test Resort',
    destinationSlug: 'aruba',
    priceBand: 2,
    styles: ['allinclusive'],
    vibeScores: { beach: 3, luxury: 2 },
    adultsOnly: false,
    allInclusive: true,
    verdict: 'A solid pick.',
    expediaUrl: 'https://expedia.com/test-resort',
    heroImageUrl: 'https://example.com/hero.jpg',
    ...overrides,
  };
}

function makeTrip(overrides: Partial<ResortTripInput> = {}): ResortTripInput {
  return {
    vibes: ['beach', 'luxury'],
    styles: ['allinclusive'],
    dealbreakers: [],
    budgetBand: 3,
    party: 'couple',
    ...overrides,
  };
}

describe('scoreResort', () => {
  it('excludes adults-only resorts for a family party', () => {
    const resort = makeResort({ adultsOnly: true });
    const trip = makeTrip({ party: 'family' });
    expect(scoreResort(trip, resort)).toBeNull();
  });

  it('excludes resorts with nightlife >= 3 when party is a dealbreaker', () => {
    const resort = makeResort({ vibeScores: { beach: 2, nightlife: 3 } });
    const trip = makeTrip({ dealbreakers: ['party'] });
    expect(scoreResort(trip, resort)).toBeNull();
  });

  it('does not exclude resorts with nightlife < 3 when party is a dealbreaker', () => {
    const resort = makeResort({ vibeScores: { beach: 2, nightlife: 2 } });
    const trip = makeTrip({ dealbreakers: ['party'] });
    expect(scoreResort(trip, resort)).not.toBeNull();
  });

  it('excludes non-adults-only resorts when kids is a dealbreaker and party is honeymoon', () => {
    const resort = makeResort({ adultsOnly: false });
    const trip = makeTrip({ party: 'honeymoon', dealbreakers: ['kids'] });
    expect(scoreResort(trip, resort)).toBeNull();
  });

  it('only penalizes (does not exclude) non-adults-only resorts when kids is a dealbreaker for a couple', () => {
    const withKidsDealbreaker = makeResort({ adultsOnly: false, vibeScores: { beach: 3 } });
    const tripWithDealbreaker = makeTrip({ party: 'couple', dealbreakers: ['kids'] });
    const tripWithout = makeTrip({ party: 'couple', dealbreakers: [] });

    const scored = scoreResort(tripWithDealbreaker, withKidsDealbreaker);
    const baseline = scoreResort(tripWithout, withKidsDealbreaker);

    expect(scored).not.toBeNull();
    expect(scored!.pct).toBeLessThan(baseline!.pct);
  });

  it('does not exclude an adults-only resort for the honeymoon+kids dealbreaker combo', () => {
    const resort = makeResort({ adultsOnly: true });
    const trip = makeTrip({ party: 'honeymoon', dealbreakers: ['kids'] });
    expect(scoreResort(trip, resort)).not.toBeNull();
  });

  it('scores an exact budget-band fit higher than an adjacent one, which is higher than a mismatch', () => {
    // budgetBand 1 -> target priceBand 1; priceBand 3 is a full mismatch (diff 2).
    const exact = makeResort({ priceBand: 1 });
    const adjacent = makeResort({ priceBand: 2 });
    const mismatch = makeResort({ priceBand: 3 });

    const trip = makeTrip({ budgetBand: 1 });

    const exactScore = scoreResort(trip, exact)!.pct;
    const adjacentScore = scoreResort(trip, adjacent)!.pct;
    const mismatchScore = scoreResort(trip, mismatch)!.pct;

    expect(exactScore).toBeGreaterThan(adjacentScore);
    expect(adjacentScore).toBeGreaterThan(mismatchScore);
  });

  it('is deterministic: same inputs produce the same output', () => {
    const resort = makeResort();
    const trip = makeTrip();
    const first = scoreResort(trip, resort);
    const second = scoreResort(trip, resort);
    expect(first).toEqual(second);
  });

  it('clamps the score into 40..99', () => {
    const lowFit = makeResort({ priceBand: 3, vibeScores: {} });
    const trip = makeTrip({ vibes: [], budgetBand: 1, party: 'family', dealbreakers: [] });
    const scored = scoreResort(trip, lowFit);
    expect(scored).not.toBeNull();
    expect(scored!.pct).toBeGreaterThanOrEqual(40);
    expect(scored!.pct).toBeLessThanOrEqual(99);
  });

  it('includes "Fits your budget" in fitChips on an exact band fit', () => {
    const resort = makeResort({ priceBand: 2 });
    const trip = makeTrip({ budgetBand: 3 });
    const scored = scoreResort(trip, resort);
    expect(scored!.fitChips).toContain('Fits your budget');
  });

  it('does not include "Fits your budget" when the band is a mismatch', () => {
    const resort = makeResort({ priceBand: 3 });
    const trip = makeTrip({ budgetBand: 1 });
    const scored = scoreResort(trip, resort);
    expect(scored!.fitChips).not.toContain('Fits your budget');
  });

  it('applies no budget adjustment when budgetBand is null', () => {
    const resort = makeResort({ priceBand: 3 });
    const withNull = scoreResort(makeTrip({ budgetBand: null }), resort)!.pct;
    const withMismatch = scoreResort(makeTrip({ budgetBand: 1 }), resort)!.pct;
    expect(withNull).toBeGreaterThan(withMismatch);
  });

  it('includes "Adults-only" and "All-inclusive" chips when applicable', () => {
    const resort = makeResort({ adultsOnly: true, allInclusive: true });
    const trip = makeTrip({ party: 'couple' });
    const scored = scoreResort(trip, resort);
    expect(scored!.fitChips).toContain('Adults-only');
    expect(scored!.fitChips).toContain('All-inclusive');
  });

  it('caps fitChips at 4', () => {
    const resort = makeResort({
      adultsOnly: true,
      allInclusive: true,
      priceBand: 2,
      vibeScores: { beach: 3, luxury: 3, food: 3, relaxing: 3 },
    });
    const trip = makeTrip({ vibes: ['beach', 'luxury', 'food', 'relaxing'], budgetBand: 3 });
    const scored = scoreResort(trip, resort);
    expect(scored!.fitChips.length).toBeLessThanOrEqual(4);
  });
});

describe('rankResorts', () => {
  it('filters out null (excluded) resorts and sorts by pct desc, then slug asc', () => {
    const trip = makeTrip({ party: 'family', budgetBand: 3 });
    const resorts: ResortAttrs[] = [
      makeResort({ slug: 'b-resort', adultsOnly: true }), // excluded for family
      makeResort({ slug: 'a-resort', priceBand: 2, vibeScores: { beach: 3, luxury: 3 } }),
      makeResort({ slug: 'c-resort', priceBand: 2, vibeScores: { beach: 3, luxury: 3 } }),
    ];

    const ranked = rankResorts(trip, resorts);

    expect(ranked.length).toBe(2);
    expect(ranked.map((r) => r.slug)).toEqual(['a-resort', 'c-resort']);
  });

  it('is deterministic across repeated calls', () => {
    const trip = makeTrip();
    const resorts: ResortAttrs[] = [
      makeResort({ slug: 'z-resort' }),
      makeResort({ slug: 'a-resort' }),
    ];
    const first = rankResorts(trip, resorts);
    const second = rankResorts(trip, resorts);
    expect(first).toEqual(second);
  });
});
