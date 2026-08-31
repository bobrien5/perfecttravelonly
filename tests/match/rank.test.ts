import { describe, it, expect } from 'vitest';
import { rankMatches } from '@/lib/match/score';
import { QuizAnswers } from '@/lib/match/types';

const answers: QuizAnswers = {
  path: 'discover', party: 'couple', origin: { code: 'BOS', label: 'Boston, MA - BOS' },
  dates: { season: 'winter' }, budget: { band: 3, includesFlights: true },
  vibes: ['beach', 'nightlife', 'food'], styles: ['allinclusive', 'adultsonly'],
  dealbreakers: ['seaweed', 'connection'], pace: 50, exploration: 50,
};
const NOW = new Date('2026-08-31T12:00:00Z');

describe('rankMatches', () => {
  it('returns at most 8, sorted desc, none excluded by dealbreakers', () => {
    const ms = rankMatches(answers, NOW);
    expect(ms.length).toBeGreaterThan(2);
    expect(ms.length).toBeLessThanOrEqual(8);
    for (let i = 1; i < ms.length; i++) expect(ms[i].pct).toBeLessThanOrEqual(ms[i - 1].pct);
    for (const m of ms) {
      expect(m.profile.flags.seaweed).not.toBe(true);
      expect(m.profile.nonstopEastCoast).toBe(true);
    }
  });
  it('every reason traces to a real answer field', () => {
    const ms = rankMatches(answers, NOW);
    const validSources = ['vibes', 'dates', 'budget', 'origin', 'styles'];
    for (const m of ms) {
      expect(m.reasons.length).toBeGreaterThanOrEqual(3);
      expect(m.reasons.length).toBeLessThanOrEqual(5);
      for (const r of m.reasons) expect(validSources).toContain(r.source);
    }
  });
  it('reasons reflect selected vibes only', () => {
    const ms = rankMatches(answers, NOW);
    const texts = ms.flatMap(m => m.reasons.map(r => r.text));
    expect(texts).not.toContain('Great for kids');
  });
});
