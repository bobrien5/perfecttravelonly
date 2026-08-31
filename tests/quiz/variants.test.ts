import { describe, it, expect } from 'vitest';
import { vibeTilesFor, dealbreakersFor, stylesFor, travelerLabel } from '@/lib/quiz/variants';
import { QuizAnswers } from '@/lib/match/types';

const baseAnswers: QuizAnswers = {
  path: 'discover', party: 'couple', origin: null, dates: null, budget: null,
  vibes: [], styles: [], dealbreakers: [], pace: 50, exploration: 50,
};

describe('variants', () => {
  it('family tiles swap romantic and nightlife for kid tiles', () => {
    const vibes = vibeTilesFor('family').map(t => t.vibe);
    expect(vibes).not.toContain('romantic');
    expect(vibes).not.toContain('nightlife');
    expect(vibes).toEqual(expect.arrayContaining(['kidsclub', 'waterpark', 'easytravel', 'familysuites']));
    expect(vibes[0]).toBe('kids');
  });
  it('honeymoon pins romantic set first', () => {
    const vibes = vibeTilesFor('honeymoon').map(t => t.vibe);
    expect(vibes.slice(0, 5)).toEqual(['romantic', 'privatepools', 'beach', 'luxury', 'seclusion']);
  });
  it('family dealbreakers hide kids and lead with party, then longtransfer', () => {
    const dbs = dealbreakersFor('family').map(d => d.db);
    expect(dbs).not.toContain('kids');
    expect(dbs[0]).toBe('party');
    expect(dbs[1]).toBe('longtransfer');
  });
  it('honeymoon dealbreakers lead with kids then party', () => {
    const dbs = dealbreakersFor('honeymoon').map(d => d.db);
    expect(dbs[0]).toBe('kids');
    expect(dbs[1]).toBe('party');
  });
  it('friends and celebration dealbreakers lead with tooquiet', () => {
    expect(dealbreakersFor('friends').map(d => d.db)[0]).toBe('tooquiet');
    expect(dealbreakersFor('celebration').map(d => d.db)[0]).toBe('tooquiet');
  });
  it('couple and solo dealbreakers keep default spec order', () => {
    const defaultOrder = ['tooquiet', 'party', 'kids', 'longtransfer', 'seaweed', 'mega', 'remote', 'connection', 'cruise', 'touristy'];
    expect(dealbreakersFor('couple').map(d => d.db)).toEqual(defaultOrder);
    expect(dealbreakersFor('solo').map(d => d.db)).toEqual(defaultOrder);
  });
  it('family styles hide adultsonly, honeymoon hides familyresort', () => {
    expect(stylesFor('family').map(s => s.style)).not.toContain('adultsonly');
    expect(stylesFor('honeymoon').map(s => s.style)).not.toContain('familyresort');
  });
  it('travelerLabel prefixes "Total trip budget for" for a headcount party', () => {
    expect(travelerLabel({ ...baseAnswers, party: 'couple' })).toBe('Total trip budget for 2 travelers · 5 nights');
  });
  it('travelerLabel uses "Total trip budget per person" (no "for") for friends/celebration', () => {
    expect(travelerLabel({ ...baseAnswers, party: 'friends' })).toBe('Total trip budget per person · 5 nights');
    expect(travelerLabel({ ...baseAnswers, party: 'celebration' })).toBe('Total trip budget per person · 5 nights');
  });
});
