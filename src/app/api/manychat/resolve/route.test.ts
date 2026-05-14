import { describe, it, expect } from 'vitest';
import { buildResolveResponse } from './route';
import type { DealKeyword } from '@/lib/deal-registry/types';

const deal: DealKeyword = {
  id: '1',
  keyword: 'ARUBA',
  dealSlug: 'aruba-3n',
  dealTitle: 'Aruba 3 Nights',
  destination: 'Aruba',
  price: 720,
  landingPath: '/d/aruba',
  dmCopy: 'Here is your Aruba deal!',
  status: 'active',
  expiresAt: null,
  createdAt: '2026-05-14T00:00:00Z',
};

describe('buildResolveResponse', () => {
  it('returns found payload for a deal', () => {
    const res = buildResolveResponse(deal, 'https://www.vacationpro.co');
    expect(res).toEqual({
      found: true,
      keyword: 'ARUBA',
      dealTitle: 'Aruba 3 Nights',
      dmText: 'Here is your Aruba deal!',
      landingUrl: 'https://www.vacationpro.co/d/aruba',
    });
  });
  it('returns not-found payload for null, echoing the keyword', () => {
    const res = buildResolveResponse(null, 'https://www.vacationpro.co', 'UNKNOWN');
    expect(res.found).toBe(false);
    expect(res.keyword).toBe('UNKNOWN');
  });
});
