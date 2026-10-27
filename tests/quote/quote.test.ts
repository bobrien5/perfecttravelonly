import { describe, it, expect } from 'vitest';
import { handleQuoteSubmission } from '@/lib/quote/handle';
import { StoreError, type QuoteStore, type StoredQuote } from '@/lib/quote/store';
import { makeReference, validateQuote, MIN_FILL_MS } from '@/lib/quote/validate';

const NOW = Date.parse('2026-10-23T12:00:00Z');

function body(overrides: Record<string, unknown> = {}) {
  return {
    idempotencyKey: '11111111-2222-4333-8444-555555555555',
    startedAt: NOW - 60_000,
    company: '',
    firstName: 'Ana',
    email: 'Ana@Example.com',
    contactPreference: 'email',
    selectedResortId: 'le-blanc-spa-resort-cancun',
    alternativeResortIds: ['secrets-the-vine-cancun', 'not-a-resort'],
    dates: { mode: 'flexible', month: '2027-02', nights: 6 },
    adults: 2,
    childAges: [],
    rooms: 1,
    tripScope: 'flight-and-hotel',
    bookingTimeframe: '1-3-months',
    ...overrides,
  };
}

class FakeStore implements QuoteStore {
  rows: (StoredQuote & { key: string; email: string; resort: string | null; ip: string | null })[] = [];
  failInsert: Error | null = null;
  async findByIdempotencyKey(key: string) {
    return this.rows.find((r) => r.key === key) ?? null;
  }
  async findRecentDuplicate(email: string, resortId: string | null) {
    return this.rows.find((r) => r.email === email && r.resort === resortId) ?? null;
  }
  async countRecentByIp(ip: string) {
    return this.rows.filter((r) => r.ip === ip).length;
  }
  async insert(input: Parameters<QuoteStore['insert']>[0], extra: Parameters<QuoteStore['insert']>[1]) {
    if (this.failInsert) throw this.failInsert;
    if (this.rows.some((r) => r.reference === extra.reference)) throw new StoreError('dup ref', '23505');
    const row = { id: `id-${this.rows.length + 1}`, reference: extra.reference, key: input.idempotencyKey, email: input.email, resort: input.selectedResortId, ip: extra.ipHash };
    this.rows.push(row);
    return { id: row.id, reference: row.reference };
  }
  async recordNotification() {}
}

describe('quote validation', () => {
  it('accepts a minimal request and normalizes it', () => {
    const v = validateQuote(body(), NOW);
    expect(v.ok).toBe(true);
    if (!v.ok) return;
    expect(v.value.email).toBe('ana@example.com');
    expect(v.value.alternativeResortIds).toEqual(['secrets-the-vine-cancun']);
    expect(v.value.marketingConsent).toBe(false);
  });

  it('works without the quiz (no resort, dates described in words)', () => {
    const v = validateQuote(body({ selectedResortId: null, alternativeResortIds: [], dates: null, datesNote: 'Sometime in March' }), NOW);
    expect(v.ok).toBe(true);
  });

  it('reports field errors', () => {
    const v = validateQuote(body({ firstName: '', email: 'nope', adults: 0, rooms: 3, tripScope: 'x', bookingTimeframe: undefined }), NOW);
    expect(v.ok).toBe(false);
    if (v.ok) return;
    expect(Object.keys(v.errors).sort()).toEqual(['adults', 'bookingTimeframe', 'email', 'firstName', 'rooms', 'tripScope'].sort());
  });

  it('validates dates, occupancy and phone preference', () => {
    const past = validateQuote(body({ dates: { mode: 'exact', checkIn: '2026-01-01', checkOut: '2026-01-05' } }), NOW);
    expect(!past.ok && past.errors.dates).toMatch(/past/);
    const rooms = validateQuote(body({ adults: 1, rooms: 2 }), NOW);
    expect(!rooms.ok && rooms.errors.rooms).toMatch(/adult/);
    const kids = validateQuote(body({ childAges: [5, 19] }), NOW);
    expect(!kids.ok && kids.errors.childAges).toBeDefined();
    const phone = validateQuote(body({ contactPreference: 'phone', phone: '' }), NOW);
    expect(!phone.ok && phone.errors.phone).toBeDefined();
  });

  it('rejects card numbers in notes', () => {
    const v = validateQuote(body({ notes: 'my card is 4111 1111 1111 1111' }), NOW);
    expect(!v.ok && v.errors.notes).toMatch(/card/);
  });

  it('treats a filled honeypot or an instant submit as spam', () => {
    expect(validateQuote(body({ company: 'Acme' }), NOW)).toMatchObject({ ok: false, spam: true });
    expect(validateQuote(body({ startedAt: NOW - MIN_FILL_MS + 100 }), NOW)).toMatchObject({ ok: false, spam: true });
  });

  it('makes unambiguous references', () => {
    expect(makeReference()).toMatch(/^VP-[A-HJ-NP-Z2-9]{6}$/);
  });
});

describe('quote submission', () => {
  it('stores before reporting success and returns a reference', async () => {
    const store = new FakeStore();
    const out = await handleQuoteSubmission(body(), { store, ipHash: 'ip1', now: NOW });
    expect(out.status).toBe(201);
    expect(store.rows).toHaveLength(1);
    expect(out.body).toMatchObject({ ok: true, duplicate: false, reference: store.rows[0].reference });
    expect(out.created?.stored.id).toBe('id-1');
  });

  it('returns the original reference for a retried submission', async () => {
    const store = new FakeStore();
    const first = await handleQuoteSubmission(body(), { store, ipHash: 'ip1', now: NOW });
    const again = await handleQuoteSubmission(body(), { store, ipHash: 'ip1', now: NOW });
    expect(again.status).toBe(200);
    expect(again.body).toMatchObject({ ok: true, duplicate: true, reference: (first.body as { reference: string }).reference });
    expect(again.created).toBeNull(); // no second round of emails
    expect(store.rows).toHaveLength(1);
  });

  it('treats the same email and resort a moment later as a duplicate', async () => {
    const store = new FakeStore();
    await handleQuoteSubmission(body(), { store, ipHash: 'ip1', now: NOW });
    const dup = await handleQuoteSubmission(body({ idempotencyKey: '11111111-2222-4333-8444-666666666666' }), { store, ipHash: 'ip1', now: NOW });
    expect(dup.body).toMatchObject({ duplicate: true });
    expect(store.rows).toHaveLength(1);
  });

  it('rate limits one connection', async () => {
    const store = new FakeStore();
    for (let i = 0; i < 5; i++) {
      await handleQuoteSubmission(body({ idempotencyKey: `11111111-2222-4333-8444-00000000000${i}`, email: `a${i}@example.com` }), { store, ipHash: 'ip1', now: NOW });
    }
    const out = await handleQuoteSubmission(body({ idempotencyKey: '11111111-2222-4333-8444-999999999999', email: 'z@example.com' }), { store, ipHash: 'ip1', now: NOW });
    expect(out.status).toBe(429);
  });

  it('retries on a reference collision', async () => {
    const store = new FakeStore();
    let calls = 0;
    const random = () => (calls++ < 12 ? 0 : 0.5); // first two references collide
    await handleQuoteSubmission(body({ email: 'x@example.com', idempotencyKey: '11111111-2222-4333-8444-aaaaaaaaaaaa' }), { store, ipHash: null, now: NOW, random: () => 0 });
    const out = await handleQuoteSubmission(body(), { store, ipHash: null, now: NOW, random });
    expect(out.status).toBe(201);
    expect(store.rows).toHaveLength(2);
  });

  it('reports an honest, retryable error when storage fails, and never claims success', async () => {
    const store = new FakeStore();
    store.failInsert = new StoreError('connection refused');
    const out = await handleQuoteSubmission(body(), { store, ipHash: null, now: NOW });
    expect(out.status).toBe(503);
    expect(out.body).toMatchObject({ ok: false, retryable: true });
    expect((out.body as { error: string }).error).toMatch(/Nothing was submitted/);
    expect(out.created).toBeNull();
  });

  it('does not store invalid requests', async () => {
    const store = new FakeStore();
    const out = await handleQuoteSubmission(body({ email: '' }), { store, ipHash: null, now: NOW });
    expect(out.status).toBe(400);
    expect(store.rows).toHaveLength(0);
  });
});
