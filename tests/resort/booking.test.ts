import { describe, it, expect } from 'vitest';
import { STAY22_AID, stay22Campaign, stay22HotelUrl } from '@/lib/monetization/stay22';
import { hasExactBookingLink, resortBookHref } from '@/lib/resorts/links';
import { answers, resort } from './fixtures';

describe('affiliate URL generation', () => {
  const exact = resort({ id: 'sunset', name: 'Sunset at the Palms', destination: 'jamaica-negril', country: 'Jamaica', area: 'Negril', expediaId: '1095763' });
  const inexact = resort({ id: 'x', name: 'Some Resort', destination: 'cancun', country: 'Mexico', area: 'Playa Mujeres', expediaId: null });

  it('links the exact Expedia property through the Stay22 expedia endpoint', () => {
    const u = new URL(resortBookHref(exact, 'results-best-overall'));
    expect(u.origin + u.pathname).toBe('https://www.stay22.com/allez/expedia');
    expect(u.searchParams.get('aid')).toBe(STAY22_AID);
    expect(u.searchParams.get('link')).toBe('https://www.expedia.com/h1095763.Hotel-Information');
    expect(u.searchParams.has('hotelname')).toBe(false);
    expect(hasExactBookingLink(exact)).toBe(true);
  });

  it('never uses the roam endpoint, which lands on OTA homepages with link=', () => {
    expect(resortBookHref(exact, 'p')).not.toContain('/allez/roam');
    expect(resortBookHref(inexact, 'p')).not.toContain('/allez/roam');
  });

  it('falls back to Stay22 name and location matching without an id', () => {
    const u = new URL(resortBookHref(inexact, 'compare'));
    expect(u.searchParams.get('hotelname')).toBe('Some Resort');
    expect(u.searchParams.get('address')).toBe('Playa Mujeres, Cancun and Costa Mujeres, Mexico');
    expect(u.searchParams.has('link')).toBe(false);
    expect(hasExactBookingLink(inexact)).toBe(false);
  });

  it('does not send dates or party, which make Stay22 open a search instead of the resort page', () => {
    const u = new URL(resortBookHref(exact, 'p', answers({ dates: { mode: 'exact', checkIn: '2027-02-10', checkOut: '2027-02-15' }, childAges: [6, 9] })));
    for (const k of ['checkin', 'checkout', 'adults', 'children', 'childrenAges']) expect(u.searchParams.has(k)).toBe(false);
    expect([...u.searchParams.keys()].sort()).toEqual(['aid', 'campaign', 'link']);
  });

  it('builds a real account id, never a placeholder', () => {
    const aid = new URL(resortBookHref(exact, 'p')).searchParams.get('aid');
    expect(aid).toMatch(/^[0-9a-f]{24}$/);
  });

  it('uses underscore campaign labels (Stay22 splits on hyphens)', () => {
    expect(stay22Campaign('vp_results-best-overall')).toBe('vp_results_best_overall');
    expect(new URL(resortBookHref(exact, 'results-best-overall')).searchParams.get('campaign')).toBe('vp_results_best_overall');
  });

  it('ignores a malformed property id', () => {
    const u = new URL(stay22HotelUrl({ name: 'A', address: 'B', expediaId: '12ab' }, 'x'));
    expect(u.searchParams.has('link')).toBe(false);
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
