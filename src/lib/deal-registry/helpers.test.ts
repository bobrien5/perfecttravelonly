import { describe, it, expect } from 'vitest';
import { normalizeKeyword, validateDealEntry, parseDealSheetCsv } from './helpers';

describe('normalizeKeyword', () => {
  it('uppercases and trims', () => {
    expect(normalizeKeyword('  puntacana ')).toBe('PUNTACANA');
  });
  it('strips non-alphanumeric characters', () => {
    expect(normalizeKeyword('punta-cana!')).toBe('PUNTACANA');
  });
});

describe('validateDealEntry', () => {
  const valid = {
    keyword: 'ARUBA',
    dealSlug: 'aruba-3-night',
    dealTitle: 'Aruba 3 Nights',
    destination: 'Aruba',
    price: 720,
    landingPath: '/d/aruba',
    dmCopy: 'Here is your Aruba deal!',
  };
  it('returns null for a valid entry', () => {
    expect(validateDealEntry(valid)).toBeNull();
  });
  it('rejects an empty keyword', () => {
    expect(validateDealEntry({ ...valid, keyword: '' })).toMatch(/keyword/i);
  });
  it('rejects a non-positive price', () => {
    expect(validateDealEntry({ ...valid, price: 0 })).toMatch(/price/i);
  });
  it('rejects empty dm copy', () => {
    expect(validateDealEntry({ ...valid, dmCopy: '' })).toMatch(/dm copy/i);
  });
});

describe('parseDealSheetCsv', () => {
  it('parses rows into DealEntryInput objects', () => {
    const csv = [
      'keyword,dealSlug,dealTitle,destination,price,landingPath,dmCopy,expiresAt',
      'JAMAICA,jamaica-3n,Jamaica 3 Nights,Montego Bay,799,/d/jamaica,Here is Jamaica,2026-06-30',
    ].join('\n');
    const rows = parseDealSheetCsv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({
      keyword: 'JAMAICA',
      dealSlug: 'jamaica-3n',
      dealTitle: 'Jamaica 3 Nights',
      destination: 'Montego Bay',
      price: 799,
      landingPath: '/d/jamaica',
      dmCopy: 'Here is Jamaica',
      expiresAt: '2026-06-30',
    });
  });
  it('skips blank lines', () => {
    const csv = 'keyword,dealSlug,dealTitle,destination,price,landingPath,dmCopy,expiresAt\n\n';
    expect(parseDealSheetCsv(csv)).toHaveLength(0);
  });
  it('skips malformed rows with too few columns', () => {
    const csv = [
      'keyword,dealSlug,dealTitle,destination,price,landingPath,dmCopy,expiresAt',
      'BADROW,only-three,columns',
      'JAMAICA,jamaica-3n,Jamaica 3 Nights,Montego Bay,799,/d/jamaica,Here is Jamaica,2026-06-30',
    ].join('\n');
    const rows = parseDealSheetCsv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0].keyword).toBe('JAMAICA');
  });
});
