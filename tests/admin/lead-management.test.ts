import { describe, it, expect } from 'vitest';
import { expectedCommission, funnelSummary, parseQuoteUpdate, statusSideEffects } from '@/lib/quote/admin';

const form = (o: Record<string, string>) => (k: string) => o[k] ?? null;

describe('lead updates', () => {
  it('computes expected commission from the commissionable amount, not booking value', () => {
    const v = parseQuoteUpdate(form({ status: 'booked', booking_value: '5,400', commissionable_amount: '4000', commission_rate_pct: '12', commission_status: 'expected' }));
    expect(v.ok).toBe(true);
    if (!v.ok) return;
    expect(v.value.expected_commission).toBe(480);
    expect(v.value.commission_rate).toBe(0.12);
    expect(expectedCommission(null, 0.12)).toBeNull();
  });

  it('treats the rate as editable', () => {
    const v = parseQuoteUpdate(form({ status: 'booked', commissionable_amount: '4000', commission_rate_pct: '10' }));
    expect(v.ok && v.value.expected_commission).toBe(400);
  });

  it('rejects inconsistent values', () => {
    const v = parseQuoteUpdate(form({ status: 'booked', booking_value: '1000', commissionable_amount: '2000', commission_status: 'paid' }));
    expect(v.ok).toBe(false);
    if (v.ok) return;
    expect(v.errors.commissionable_amount).toBeDefined();
    expect(v.errors.actual_commission).toBeDefined();
    expect(parseQuoteUpdate(form({ status: 'won' })).ok).toBe(false);
  });

  it('records status history and first quoted/booked times', () => {
    const prev = { status: 'contacted' as const, status_history: [{ status: 'new' as const, at: 't0' }], quoted_at: null, booked_at: null };
    const q = statusSideEffects(prev, 'quoted', 't1');
    expect(q.status_history.map((h) => h.status)).toEqual(['new', 'quoted']);
    expect(q.quoted_at).toBe('t1');
    expect(statusSideEffects({ ...prev, status: 'quoted' }, 'quoted', 't2').status_history).toHaveLength(1);
  });

  it('keeps quotes, bookings, travel and paid commission distinct', () => {
    const s = funnelSummary([
      { status: 'new', expected_commission: null, actual_commission: null, commission_status: 'none', booking_currency: 'USD' },
      { status: 'quoted', expected_commission: null, actual_commission: null, commission_status: 'none', booking_currency: 'USD' },
      { status: 'booked', expected_commission: 400, actual_commission: null, commission_status: 'expected', booking_currency: 'USD' },
      { status: 'traveled', expected_commission: 360, actual_commission: 350, commission_status: 'paid', booking_currency: 'USD' },
      { status: 'booked', expected_commission: 300, actual_commission: null, commission_status: 'expected', booking_currency: 'CAD' },
    ]);
    expect(s).toMatchObject({ requested: 5, new: 1, quoted: 1, booked: 2, traveled: 1, expectedOutstandingUsd: 400, paidUsd: 350, nonUsdRows: 1 });
  });
});
