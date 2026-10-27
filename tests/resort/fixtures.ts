// Test-only fixtures. Never imported by app code.
import type { ResortRecord, TripAnswers } from '@vacationpro/engine';
import { initialTripAnswers } from '@vacationpro/engine';

export function resort(overrides: Partial<ResortRecord> & { id: string }): ResortRecord {
  return {
    name: overrides.id,
    destination: 'cancun',
    country: 'Mexico',
    area: null,
    origin: 'curated',
    couplesOnly: false,
    maxPerRoom: null,
    features: [],
    guestRating: null,
    ratingSource: 'vacationpro',
    priceTierBasis: 'editorial',
    expediaId: null,
    status: 'active',
    images: [],
    summary: 'Fixture resort.',
    allInclusive: true,
    adultsOnly: false,
    minAge: null,
    hasKidsClub: null,
    hasWaterPark: null,
    roomCount: null,
    restaurantsCount: null,
    transfer: null,
    beach: { swimmable: null, notes: null },
    inclusions: [],
    exclusions: [],
    sources: [],
    factsCheckedAt: '2026-10-23',
    atmosphere: 'balanced',
    ratings: { beach: 2, food: 2, pools: 2, rooms: 2, nightlife: 1, value: 2, family: 1 },
    priceTier: 2,
    editorialReviewedAt: null,
    visitStatus: null,
    price: null,
    bookingSearchUrl: 'https://www.expedia.com/Hotel-Search?destination=Cancun&hotel-name=Fixture',
    ...overrides,
  };
}

export function answers(overrides: Partial<TripAnswers> = {}): TripAnswers {
  return {
    ...initialTripAnswers(),
    entry: 'discover',
    destination: 'open',
    party: 'couple',
    adults: 2,
    dates: { mode: 'flexible', month: null, nights: 5 },
    airport: 'skip',
    budget: { amount: 6000, currency: 'USD', includesFlights: false },
    adultsOnly: 'either',
    atmosphere: 'balanced',
    priorities: ['beach', 'food'],
    ...overrides,
  };
}
