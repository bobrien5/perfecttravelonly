import { describe, it, expect } from 'vitest';
import { bookingTargetUrl } from '@vacationpro/engine';
import { stay22Url } from '@/lib/monetization/stay22';
import { answers, resort } from './fixtures';

describe('affiliate URL generation', () => {
  const r = resort({ id: 'x', bookingSearchUrl: 'https://www.expedia.com/Hotel-Search?destination=Cancun&hotel-name=Le+Blanc' });

  it('keeps the intended resort and adds exact dates', () => {
    const u = new URL(bookingTargetUrl(r, answers({ dates: { mode: 'exact', checkIn: '2027-01-10', checkOut: '2027-01-15' } })));
    expect(u.searchParams.get('hotel-name')).toBe('Le Blanc');
    expect(u.searchParams.get('startDate')).toBe('2027-01-10');
    expect(u.searchParams.get('endDate')).toBe('2027-01-15');
    expect(u.searchParams.get('adults')).toBe('2');
  });

  it('does not guess party formats for children or multiple rooms', () => {
    const u = new URL(bookingTargetUrl(r, answers({ childAges: [6] })));
    expect(u.searchParams.has('adults')).toBe(false);
    expect(u.searchParams.has('startDate')).toBe(false); // flexible dates
  });

  it('leaves non-Expedia URLs untouched', () => {
    const other = resort({ id: 'y', bookingSearchUrl: 'https://www.example-ota.com/hotel/123' });
    expect(bookingTargetUrl(other, answers())).toBe('https://www.example-ota.com/hotel/123');
  });

  it('wraps in Stay22 allez with no invented parameters', () => {
    const wrapped = new URL(stay22Url(bookingTargetUrl(r, answers()), 'results-best-overall'));
    expect(wrapped.hostname).toBe('www.stay22.com');
    expect([...wrapped.searchParams.keys()].sort()).toEqual(['aid', 'campaign', 'link']);
    expect(new URL(wrapped.searchParams.get('link')!).searchParams.get('hotel-name')).toBe('Le Blanc');
  });
});

describe('article destination context', () => {
  it('only infers a destination when exactly one is named', async () => {
    const { inferDestinationSlug } = await import('@/lib/resorts/catalog');
    expect(inferDestinationSlug('best-adults-only-resorts-in-cancun')).toBe('cancun');
    expect(inferDestinationSlug('tulum-vs-playa-del-carmen')).toBe('riviera-maya');
    expect(inferDestinationSlug('cancun-vs-punta-cana')).toBeNull();
    expect(inferDestinationSlug('cheapest-caribbean-island')).toBeNull();
  });
});
