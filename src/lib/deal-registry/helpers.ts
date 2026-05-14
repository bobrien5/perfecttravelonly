import type { DealEntryInput } from './types';

export function normalizeKeyword(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function validateDealEntry(entry: Partial<DealEntryInput>): string | null {
  if (!entry.keyword?.trim()) return 'keyword is required';
  if (!entry.dealSlug?.trim()) return 'dealSlug is required';
  if (!entry.dealTitle?.trim()) return 'dealTitle is required';
  if (!entry.destination?.trim()) return 'destination is required';
  if (typeof entry.price !== 'number' || entry.price <= 0) return 'price must be a positive number';
  if (!Number.isInteger(entry.price)) return 'price must be a whole number (USD dollars)';
  if (!entry.landingPath?.trim()) return 'landingPath is required';
  if (!entry.landingPath.startsWith('/')) return 'landingPath must start with /';
  if (!entry.dmCopy?.trim()) return 'dm copy is required';
  return null;
}

export function parseDealSheetCsv(csv: string): DealEntryInput[] {
  const lines = csv.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length <= 1) return [];
  const rows = lines.slice(1); // skip header
  // Naive comma split: the deal sheet is an internal file with simple fields.
  // A field value containing a comma would mis-parse — accepted scope decision.
  return rows.flatMap((line) => {
    const parts = line.split(',');
    if (parts.length < 7) return []; // skip malformed rows rather than throwing
    const [keyword, dealSlug, dealTitle, destination, price, landingPath, dmCopy, expiresAt] = parts;
    return [{
      keyword: normalizeKeyword(keyword),
      dealSlug: dealSlug.trim(),
      dealTitle: dealTitle.trim(),
      destination: destination.trim(),
      price: Number(price),
      landingPath: landingPath.trim(),
      dmCopy: dmCopy.trim(),
      expiresAt: expiresAt?.trim() || null,
    }];
  });
}
