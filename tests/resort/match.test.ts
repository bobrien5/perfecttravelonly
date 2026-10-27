import { describe, it, expect } from 'vitest';
import { exclusionReason, guestRatingPoints, matchResorts } from '@vacationpro/engine';
import { answers, resort } from './fixtures';

describe('hard constraints', () => {
  it('excludes resorts that are not confirmed all-inclusive', () => {
    const a = answers();
    expect(exclusionReason(a, resort({ id: 'x', allInclusive: false }))).toMatch(/Not an all-inclusive/);
    expect(exclusionReason(a, resort({ id: 'x', allInclusive: 'optional' }))).toMatch(/optional/);
    expect(exclusionReason(a, resort({ id: 'x', allInclusive: null }))).toMatch(/could not confirm/);
  });

  it('applies the chosen destination, but not "open"', () => {
    const r = resort({ id: 'x', destination: 'aruba' });
    expect(exclusionReason(answers({ destination: 'cancun' }), r)).toMatch(/destination/);
    expect(exclusionReason(answers({ destination: 'open' }), r)).toBeNull();
  });

  it('keeps children out of adults-only resorts using the youngest age', () => {
    const ao = resort({ id: 'ao', adultsOnly: true, minAge: 16 });
    expect(exclusionReason(answers({ party: 'family', childAges: [17, 12] }), ao)).toMatch(/16\+/);
    expect(exclusionReason(answers({ party: 'family', childAges: [17, 16] }), ao)).toBeNull();
  });

  it('treats an unknown age policy as ineligible for children', () => {
    const unknown = resort({ id: 'u', adultsOnly: null });
    expect(exclusionReason(answers({ party: 'family', childAges: [8] }), unknown)).toMatch(/could not confirm/);
  });

  it('treats an adults-only resort with no published minimum age as closed to children', () => {
    const ao = resort({ id: 'ao', adultsOnly: true, minAge: null });
    expect(exclusionReason(answers({ party: 'family', childAges: [17] }), ao)).toMatch(/Adults-only/);
  });

  it('requires a confirmed adults-only policy when the traveler asks for one', () => {
    const a = answers({ adultsOnly: 'yes' });
    expect(exclusionReason(a, resort({ id: 'f', adultsOnly: false }))).toMatch(/Not adults-only/);
    expect(exclusionReason(a, resort({ id: 'u', adultsOnly: null }))).toMatch(/could not confirm/);
    expect(exclusionReason(a, resort({ id: 'y', adultsOnly: true }))).toBeNull();
  });

  it('only applies dealbreakers to known facts', () => {
    const a = answers({ dealbreakers: ['long-transfer', 'mega-resort', 'rough-beach'] });
    const unknown = resort({ id: 'u' });
    expect(exclusionReason(a, unknown)).toBeNull();

    expect(exclusionReason(a, resort({ id: 'far', transfer: { airport: 'CUN', minutes: { min: 50, max: 70 } } }))).toMatch(/70 minutes/);
    expect(exclusionReason(a, resort({ id: 'big', roomCount: 1400 }))).toMatch(/1,400 rooms/);
    expect(exclusionReason(a, resort({ id: 'rough', beach: { swimmable: 'no', notes: null } }))).toMatch(/swimming/);
  });

  it('surfaces unknown facts as things to confirm', () => {
    const a = answers({ dealbreakers: ['long-transfer'], priorities: ['beach', 'food'] });
    const res = matchResorts(a, [resort({ id: 'u' })]);
    expect(res.recommendations[0].unknowns).toContain('Airport transfer time');
    expect(res.recommendations[0].unknowns).toContain('Beach swimming conditions');
  });

  it('never matches hidden records', () => {
    const res = matchResorts(answers(), [resort({ id: 'h', status: 'hidden' })]);
    expect(res.recommendations).toHaveLength(0);
  });
});

describe('ranking and roles', () => {
  const catalog = [
    resort({ id: 'mid-strong', priceTier: 2, ratings: { beach: 3, food: 3, pools: 2, rooms: 2, nightlife: 1, value: 2, family: 1 } }),
    resort({ id: 'cheap', priceTier: 1, ratings: { beach: 2, food: 2, pools: 2, rooms: 1, nightlife: 1, value: 3, family: 1 } }),
    resort({ id: 'luxe', priceTier: 3, ratings: { beach: 3, food: 3, pools: 3, rooms: 3, nightlife: 1, value: 1, family: 1 } }),
    resort({ id: 'weak', priceTier: 2, ratings: { beach: 1, food: 1, pools: 1, rooms: 1, nightlife: 1, value: 1, family: 1 } }),
  ];

  it('ranks on stated priorities and returns distinct roles', () => {
    const res = matchResorts(answers({ budget: { amount: 20000, currency: 'USD', includesFlights: false } }), catalog);
    const roles = res.recommendations.map((r) => [r.role, r.resort.id]);
    const ids = res.recommendations.map((r) => r.resort.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(roles[0][0]).toBe('best-overall');
    expect(res.recommendations.find((r) => r.role === 'best-value')?.resort.priceTier).toBeLessThan(
      res.recommendations[0].resort.priceTier!,
    );
    expect(res.rankedIds.at(-1)).toBe('weak');
  });

  it('does not suggest an upgrade estimated to be over budget', () => {
    const tight = answers({ budget: { amount: 3500, currency: 'USD', includesFlights: false } });
    const res = matchResorts(tight, catalog);
    expect(res.recommendations.find((r) => r.role === 'worth-the-upgrade')).toBeUndefined();
  });

  it('does not force three results and explains why', () => {
    const res = matchResorts(answers(), [catalog[0]]);
    expect(res.recommendations).toHaveLength(1);
    expect(res.limitations.join(' ')).toMatch(/Only one resort/);
  });

  it('explains an empty destination honestly', () => {
    const res = matchResorts(answers({ destination: 'jamaica-negril' }), catalog);
    expect(res.recommendations).toHaveLength(0);
    expect(res.limitations[0]).toMatch(/do not have verified resort details/);
  });

  it('is deterministic and ignores input order', () => {
    const a = answers();
    const one = matchResorts(a, catalog).rankedIds;
    const two = matchResorts(a, [...catalog].reverse()).rankedIds;
    expect(one).toEqual(two);
  });

  it('builds explanations from answers and stored facts, without percentages', () => {
    const a = answers({ atmosphere: 'quiet', adultsOnly: 'yes' });
    const r = resort({ id: 'q', atmosphere: 'quiet', adultsOnly: true, minAge: 18 });
    const rec = matchResorts(a, [r]).recommendations[0];
    const text = [...rec.whyItFits, rec.tradeoff, rec.skipIf].join(' ');
    expect(text).toMatch(/quiet and romantic/);
    expect(text).toMatch(/Adults-only \(18\+\)/);
    expect(rec.skipIf).toMatch(/under 18/);
    expect(text).not.toMatch(/%/);
  });
});

describe('value and upgrade picks use reference prices when known', () => {
  const ref = (amount: number) => ({
    amount, currency: 'USD' as const, nights: 7, basis: 'b', travelDates: 'March 2027', occupancy: '2 adults',
    occupancyCounts: { adults: 2, children: 0 }, includes: 'i', source: 's', sourceUrl: null, checkedAt: '2026-04',
  });
  it('treats a same-tier resort with a much lower reference price as the value pick', () => {
    const top = resort({ id: 'top', priceTier: 2, price: ref(7000), ratings: { beach: 3, food: 3, pools: 2, rooms: 2, nightlife: 1, value: 1, family: 1 } });
    const cheap = resort({ id: 'cheap', priceTier: 2, price: ref(3500) });
    const res = matchResorts(answers({ budget: { amount: 20000, currency: 'USD', includesFlights: false } }), [top, cheap]);
    expect(res.recommendations.map((r) => [r.role, r.resort.id])).toEqual([['best-overall', 'top'], ['best-value', 'cheap']]);
  });
});

describe('community sheet rules', () => {
  it('excludes couples-only resorts for families, friends and solo travelers', () => {
    const r = resort({ id: 'c', adultsOnly: true, couplesOnly: true });
    expect(exclusionReason(answers({ party: 'couple', adults: 2 }), r)).toBeNull();
    expect(exclusionReason(answers({ party: 'friends', adults: 3 }), r)).toMatch(/Couples only/);
    expect(exclusionReason(answers({ party: 'solo', adults: 1 }), r)).toMatch(/Couples only/);
  });

  it('applies a minimum age at all-ages resorts too', () => {
    const r = resort({ id: 'm', adultsOnly: false, minAge: 12 });
    expect(exclusionReason(answers({ party: 'family', childAges: [10] }), r)).toMatch(/12 or older/);
    expect(exclusionReason(answers({ party: 'family', childAges: [13] }), r)).toBeNull();
  });

  it('respects a maximum per room', () => {
    const r = resort({ id: 'p', maxPerRoom: 3 });
    expect(exclusionReason(answers({ party: 'family', adults: 2, childAges: [5, 7], rooms: 1 }), r)).toMatch(/at most 3/);
    expect(exclusionReason(answers({ party: 'family', adults: 2, childAges: [5, 7], rooms: 2 }), r)).toBeNull();
  });

  it('uses guest reviews as a capped quality signal and says so', () => {
    const base = { ratings: { beach: 2, food: 2, pools: 2, rooms: 2, nightlife: 1, value: null, family: 1 } } as const;
    const loved = resort({ id: 'loved', ...base, guestRating: { score: 97, reviews: 2000, source: 's' } });
    const meh = resort({ id: 'meh', ...base, guestRating: { score: 80, reviews: 2000, source: 's' } });
    const res = matchResorts(answers(), [meh, loved]);
    expect(res.rankedIds[0]).toBe('loved');
    expect(res.recommendations[0].whyItFits.join(' ')).toMatch(/Guest reviews average 97\/100/);
    expect(guestRatingPoints(resort({ id: 'few', guestRating: { score: 100, reviews: 10, source: 's' } }))).toBe(0);
  });

  it('labels ratings from the community sheet as such', () => {
    const r = resort({ id: 's', ratingSource: 'community-sheet', ratings: { beach: 3, food: 3, pools: null, rooms: null, nightlife: null, value: null, family: 0 } });
    const text = matchResorts(answers(), [r]).recommendations[0].whyItFits.join(' ');
    expect(text).toMatch(/community resort guide/);
    expect(text).not.toMatch(/VacationPro rating/);
  });

  it('never treats an unknown price as cheaper or pricier', () => {
    const top = resort({ id: 'top', priceTier: 2, ratings: { beach: 3, food: 3, pools: 2, rooms: 2, nightlife: 1, value: 1, family: 1 } });
    const unknown = resort({ id: 'unknown', priceTier: null, priceTierBasis: null });
    const res = matchResorts(answers(), [top, unknown]);
    expect(res.recommendations.map((r) => r.role)).toEqual(['best-overall']);
    const b = matchResorts(answers(), [unknown]).recommendations[0].budget;
    expect(b.fit).toBe('unknown');
    expect(b.explanation).toMatch(/do not have price information/);
  });
});

describe('also a strong fit', () => {
  const strong = { beach: 3, food: 3, pools: 2, rooms: 2, nightlife: 1, value: null, family: 0 } as const;
  it('fills slots with close runners-up when prices cannot justify value or upgrade picks', () => {
    const top = resort({ id: 'a-top', priceTier: null, priceTierBasis: null, ratings: strong });
    const close = resort({ id: 'b-close', priceTier: null, priceTierBasis: null, ratings: { ...strong, food: 2 } });
    const weak = resort({ id: 'c-weak', priceTier: null, priceTierBasis: null, ratings: { beach: 0, food: 0, pools: 0, rooms: 0, nightlife: 0, value: null, family: 0 } });
    const res = matchResorts(answers(), [top, close, weak]);
    expect(res.recommendations.map((r) => [r.role, r.resort.id])).toEqual([
      ['best-overall', 'a-top'],
      ['also-strong', 'b-close'],
    ]);
    expect(res.rankedIds).toContain('c-weak');
  });
});
