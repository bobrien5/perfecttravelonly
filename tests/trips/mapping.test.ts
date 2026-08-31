import { describe, it, expect } from 'vitest';
import { sessionToTripPayload } from '@/lib/trips/mapping';
import { QuizAnswers } from '@vacationpro/engine';

function baseAnswers(overrides: Partial<QuizAnswers> = {}): QuizAnswers {
  return {
    path: 'discover',
    party: 'couple',
    origin: null,
    dates: null,
    budget: null,
    vibes: ['beach', 'luxury'],
    styles: [],
    dealbreakers: ['party'],
    pace: 50,
    exploration: 50,
    ...overrides,
  };
}

describe('sessionToTripPayload', () => {
  it('discover path: uses topMatch slug, maps season, maps budget band', () => {
    const answers = baseAnswers({ dates: { season: 'winter' }, budget: { band: 3, includesFlights: true } });
    const payload = sessionToTripPayload(answers, { slug: 'aruba' });

    expect(payload.destination_slug).toBe('aruba');
    expect(payload.season).toBe('winter');
    expect(payload.date_start).toBeNull();
    expect(payload.date_end).toBeNull();
    expect(payload.budget_band).toBe(3);
    expect(payload.party).toBe('couple');
    expect(payload.vibes).toEqual(['beach', 'luxury']);
    expect(payload.dealbreakers).toEqual(['party']);
  });

  it('Path B (known destination): destinationSlug wins over topMatch', () => {
    const answers = baseAnswers({ path: 'known', destinationSlug: 'punta-cana' });
    const payload = sessionToTripPayload(answers, { slug: 'aruba' }, 'punta-cana');

    expect(payload.destination_slug).toBe('punta-cana');
  });

  it('date-range answers: populates date_start/date_end, season null', () => {
    const answers = baseAnswers({ dates: { start: '2026-10-01', end: '2026-10-08' } });
    const payload = sessionToTripPayload(answers, { slug: 'cancun' });

    expect(payload.date_start).toBe('2026-10-01');
    expect(payload.date_end).toBe('2026-10-08');
    expect(payload.season).toBeNull();
  });

  it('null dates map to null season and null date fields', () => {
    const answers = baseAnswers({ dates: null });
    const payload = sessionToTripPayload(answers, { slug: 'cancun' });

    expect(payload.season).toBeNull();
    expect(payload.date_start).toBeNull();
    expect(payload.date_end).toBeNull();
  });

  it('null budget maps to null budget_band', () => {
    const answers = baseAnswers({ budget: null });
    const payload = sessionToTripPayload(answers, { slug: 'cancun' });

    expect(payload.budget_band).toBeNull();
  });

  it('throws when there is no destinationSlug and no topMatch', () => {
    const answers = baseAnswers();
    expect(() => sessionToTripPayload(answers, null)).toThrow();
  });
});
