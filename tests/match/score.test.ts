import { describe, it, expect } from 'vitest';
import { scoreDestination, DESTINATION_PROFILES, QuizAnswers } from '@vacationpro/engine';

const aruba = DESTINATION_PROFILES.find(d => d.slug === 'aruba')!;
const puntaCana = DESTINATION_PROFILES.find(d => d.slug === 'punta-cana')!;

const base: QuizAnswers = {
  path: 'discover', party: 'couple', origin: { code: 'BOS', label: 'Boston, MA - BOS' },
  dates: { season: 'winter' }, budget: { band: 3, includesFlights: true },
  vibes: ['beach', 'nightlife', 'food'], styles: ['allinclusive', 'adultsonly'],
  dealbreakers: [], pace: 50, exploration: 50,
};
const NOW = new Date('2026-08-31T12:00:00Z');

describe('scoreDestination', () => {
  it('scores a strong fit above 80', () => {
    const m = scoreDestination(base, aruba, NOW);
    expect(m).not.toBeNull();
    expect(m!.pct).toBeGreaterThan(80);
  });
  it('excludes on dealbreaker hit', () => {
    const m = scoreDestination({ ...base, dealbreakers: ['seaweed'] }, puntaCana, NOW);
    expect(m).toBeNull();
  });
  it('excludes non-nonstop when connection is a dealbreaker', () => {
    const grenada = DESTINATION_PROFILES.find(d => d.slug === 'grenada')!;
    expect(scoreDestination({ ...base, dealbreakers: ['connection'] }, grenada, NOW)).toBeNull();
  });
  it('penalizes hurricane months', () => {
    const sept = scoreDestination({ ...base, dates: { season: 'fall' } }, puntaCana, NOW);
    const winter = scoreDestination(base, puntaCana, NOW);
    expect(sept!.pct).toBeLessThan(winter!.pct);
  });
  it('budget mismatch drops the score', () => {
    const cheap = scoreDestination({ ...base, budget: { band: 1, includesFlights: true } }, aruba, NOW);
    expect(cheap!.pct).toBeLessThan(scoreDestination(base, aruba, NOW)!.pct);
  });
  it('clamps into 40..99', () => {
    for (const d of DESTINATION_PROFILES) {
      const m = scoreDestination(base, d, NOW);
      if (m) { expect(m.pct).toBeGreaterThanOrEqual(40); expect(m.pct).toBeLessThanOrEqual(99); }
    }
  });
  it('de-duplicates reason text so a family selecting kids/kidsclub/waterpark gets one bullet, not three', () => {
    const family: QuizAnswers = {
      ...base,
      party: 'family',
      vibes: ['kids', 'kidsclub', 'waterpark'],
    };
    const m = scoreDestination(family, puntaCana, NOW);
    expect(m).not.toBeNull();
    const texts = m!.reasons.map((r) => r.text);
    expect(new Set(texts).size).toBe(texts.length);
  });
});
