import { describe, it, expect } from 'vitest';
import { STAY22_AID, stay22HotelUrl } from '@/lib/monetization/stay22';

describe('stay22HotelUrl (Trip Hub and resort links)', () => {
  it('preserves the same aid used by Stay22Scripts', () => {
    expect(stay22HotelUrl({ name: 'A', address: 'B' }, 'triphub_resort')).toContain(`aid=${STAY22_AID}`);
  });

  it('encodes hotel name and address', () => {
    const u = new URL(stay22HotelUrl({ name: 'Couples Swept Away', address: 'Negril, Jamaica' }, 'trip hub'));
    expect(u.searchParams.get('hotelname')).toBe('Couples Swept Away');
    expect(u.searchParams.get('address')).toBe('Negril, Jamaica');
    expect(u.searchParams.get('campaign')).toBe('trip_hub');
  });
});
