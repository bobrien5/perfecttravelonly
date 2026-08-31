import { describe, it, expect } from 'vitest';
import { rankMatches, compareMatches } from '@/lib/match/score';
import { Match, QuizAnswers } from '@/lib/match/types';
import { DESTINATION_PROFILES } from '@/lib/match/destinations';

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
  it('is deterministic: fully flexible answers produce identical-pct rows in the same order every time', () => {
    const flexible: QuizAnswers = {
      path: 'discover', party: 'couple', origin: 'flexible',
      dates: { season: 'anytime' }, budget: null,
      vibes: [], styles: ['nopref'], dealbreakers: [], pace: 50, exploration: 50,
    };
    const first = rankMatches(flexible, NOW).map(m => m.profile.slug);
    const second = rankMatches(flexible, NOW).map(m => m.profile.slug);
    expect(first).toEqual(second);
    // Sanity check that this scenario actually exercises the tie-break path.
    const pcts = rankMatches(flexible, NOW).map(m => m.pct);
    expect(new Set(pcts).size).toBe(1);
  });
  it('ranks an exact-budget-fit destination above an adjacent-fit one at equal pct', () => {
    const budgetAnswers: QuizAnswers = { ...answers, budget: { band: 3, includesFlights: true } };
    const exactProfile = DESTINATION_PROFILES.find(d => d.slug === 'aruba')!; // budgetBands includes 3
    const adjacentProfile = DESTINATION_PROFILES.find(d => d.slug === 'punta-cana')!; // budgetBands [1,2,3,4] also includes 3, so pick a non-exact one
    // Build fabricated matches that are tied on pct but differ in budget fit,
    // independent of whatever the live scoring pipeline happens to produce.
    const exactMatch: Match = { profile: exactProfile, pct: 70, reasons: [] };
    const adjacentMatch: Match = {
      profile: { ...adjacentProfile, budgetBands: [1, 2] }, // does not include band 3
      pct: 70,
      reasons: [],
    };
    const sorted = [adjacentMatch, exactMatch].sort((a, b) => compareMatches(a, b, budgetAnswers));
    expect(sorted[0]).toBe(exactMatch);
  });
});
