import { describe, it, expect } from 'vitest';
import { assessBudget, BUDGET_ASSUMPTIONS, hotelBudget } from '@vacationpro/engine';
import { answers, resort } from './fixtures';

describe('budget interpretation', () => {
  it('does not treat a budget that includes flights as all hotel money', () => {
    const withFlights = hotelBudget(answers({ budget: { amount: 5000, currency: 'USD', includesFlights: true } }));
    const hotelOnly = hotelBudget(answers({ budget: { amount: 5000, currency: 'USD', includesFlights: false } }));
    if ('unknown' in withFlights || 'unknown' in hotelOnly) throw new Error('expected numbers');
    const allowance = 2 * BUDGET_ASSUMPTIONS.flightAllowanceUsdPerTraveler;
    expect(withFlights.flightsDeducted).toBe(allowance);
    expect(withFlights.perRoomNight).toBeCloseTo((5000 - allowance) / 5);
    expect(hotelOnly.perRoomNight).toBeCloseTo(1000);
  });

  it('assumes flights are included when the traveler is unsure', () => {
    const hb = hotelBudget(answers({ budget: { amount: 5000, currency: 'USD', includesFlights: 'unsure' } }));
    if ('unknown' in hb) throw new Error('expected numbers');
    expect(hb.flightsAssumed).toBe(true);
  });

  it('splits by rooms and nights', () => {
    const hb = hotelBudget(answers({ adults: 4, rooms: 2, budget: { amount: 8000, currency: 'USD', includesFlights: false } }));
    if ('unknown' in hb) throw new Error('expected numbers');
    expect(hb.perRoomNight).toBeCloseTo(800);
  });

  it('returns unknown, not a guess, when inputs are missing or not USD', () => {
    expect(assessBudget(answers({ budget: { amount: null, currency: 'USD', includesFlights: null } }), resort({ id: 'r' })).fit).toBe('unknown');
    expect(assessBudget(answers({ budget: { amount: 5000, currency: 'GBP', includesFlights: false } }), resort({ id: 'r' })).fit).toBe('unknown');
    expect(assessBudget(answers({ dates: null }), resort({ id: 'r' })).fit).toBe('unknown');
  });

  it('labels every assessment as an estimate', () => {
    const b = assessBudget(answers(), resort({ id: 'r' }));
    expect(b.explanation).toMatch(/estimate/i);
  });

  it('scales fit with the price tier', () => {
    const a = answers({ budget: { amount: 3000, currency: 'USD', includesFlights: false } }); // $600/night
    expect(assessBudget(a, resort({ id: 'a', priceTier: 1 })).fit).toBe('comfortable');
    expect(assessBudget(a, resort({ id: 'b', priceTier: 2 })).fit).toBe('stretch');
    expect(assessBudget(a, resort({ id: 'c', priceTier: 3 })).fit).toBe('over');
  });
});

describe('reference prices', () => {
  const price = {
    amount: 4200, currency: 'USD' as const, nights: 7, basis: 'lowest refundable room, booked direct',
    travelDates: 'March 2027', occupancy: '2 adults', occupancyCounts: { adults: 2, children: 0 },
    includes: 'resort stay, no flights', source: 'Test source', sourceUrl: null, checkedAt: '2026-04',
  };

  it('uses a dated reference price over the tier guess and cites it', () => {
    const r = resort({ id: 'p', priceTier: 3, price }); // $600/night reference
    const b = assessBudget(answers({ budget: { amount: 4000, currency: 'USD', includesFlights: false } }), r); // $800/night
    expect(b.fit).toBe('comfortable');
    expect(b.explanation).toMatch(/reference rate of about \$600 per night/);
    expect(b.explanation).toMatch(/checked 2026-04/);
    expect(b.explanation).toMatch(/not a live rate/);
  });

  it('warns when the traveler occupancy differs from the reference', () => {
    const r = resort({ id: 'p', price });
    const b = assessBudget(answers({ party: 'family', childAges: [8, 10], budget: { amount: 9000, currency: 'USD', includesFlights: false } }), r);
    expect(b.explanation).toMatch(/Your group differs/);
  });
});
