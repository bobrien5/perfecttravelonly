import { STAY22_AID } from './stay22-account';

export { STAY22_AID };

const ALLEZ = 'https://www.stay22.com/allez';

/**
 * Stay22 splits a campaign label on hyphens ("foo-bar" reports as "foo" and
 * "bar"), so labels use underscores only.
 */
export function stay22Campaign(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 60);
}

export interface Stay22Hotel {
  name: string;
  /** "Area, Destination, Country": used only when there is no Expedia property id. */
  address: string;
  /** Expedia property id (the number in .h<id>.Hotel-Information), when verified. */
  expediaId?: string | null;
}

export interface Stay22Stay {
  checkin?: string;
  checkout?: string;
  adults?: number;
  childrenAges?: number[];
}

/**
 * Monetized link to one specific hotel, through Stay22's Expedia endpoint.
 *
 * Tested 2026-10-26 against live redirects:
 * - /allez/expedia with link= an Expedia property page lands on that exact
 *   property (or, with checkin/checkout, Expedia search with that property
 *   selected and the dates filled in). This is the reliable path.
 * - /allez/roam with link= lands on an OTA homepage, and roam with only a
 *   hotel name can match the wrong property. Neither is used.
 * - Without a property id, hotelname + address is Stay22's documented match;
 *   it can fall back to an area search, which the UI says plainly.
 *
 * Dates and party size use Stay22's own documented parameters; Stay22
 * forwards them to Expedia. No other tracking parameters are added.
 */
export function stay22HotelUrl(hotel: Stay22Hotel, campaign: string, stay: Stay22Stay = {}): string {
  const p = new URLSearchParams({ aid: STAY22_AID, campaign: stay22Campaign(campaign) });
  if (hotel.expediaId && /^\d+$/.test(hotel.expediaId)) {
    p.set('link', `https://www.expedia.com/h${hotel.expediaId}.Hotel-Information`);
  } else {
    p.set('hotelname', hotel.name);
    p.set('address', hotel.address);
  }
  if (stay.checkin && stay.checkout) {
    p.set('checkin', stay.checkin);
    p.set('checkout', stay.checkout);
  }
  if (stay.adults && stay.adults > 0) p.set('adults', String(stay.adults));
  if (stay.childrenAges && stay.childrenAges.length > 0) {
    p.set('children', String(stay.childrenAges.length));
    p.set('childrenAges', stay.childrenAges.join(','));
  }
  return `${ALLEZ}/expedia?${p.toString()}`;
}
