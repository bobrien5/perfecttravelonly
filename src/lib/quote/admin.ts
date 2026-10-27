import { COMMISSION_STATUSES, LEAD_STATUSES, type CommissionStatus, type LeadStatus } from './config';

/**
 * Admin-side lead updates. Pure parsing and commission maths live here so
 * they can be tested; the server action in /admin/quotes/[id] applies them.
 *
 * Commission is an internal estimate until paid. Expected commission is
 * commissionable amount times the rate, never booking value times the rate,
 * because taxes, flights and some package parts are usually not commissionable.
 */

export interface QuoteUpdate {
  status: LeadStatus;
  advisor_notes: string | null;
  next_follow_up_on: string | null;
  supplier: string | null;
  travel_start: string | null;
  travel_end: string | null;
  booking_currency: string;
  booking_value: number | null;
  commissionable_amount: number | null;
  commission_rate: number;
  expected_commission: number | null;
  actual_commission: number | null;
  commission_status: CommissionStatus;
  commission_paid_on: string | null;
}

type Getter = (key: string) => string | null;

function text(get: Getter, k: string, max = 4000): string | null {
  const v = get(k)?.trim();
  return v ? v.slice(0, max) : null;
}

function date(get: Getter, k: string, errors: Record<string, string>): string | null {
  const v = get(k)?.trim();
  if (!v) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(Date.parse(`${v}T00:00:00Z`))) {
    errors[k] = 'Use a valid date.';
    return null;
  }
  return v;
}

function money(get: Getter, k: string, errors: Record<string, string>): number | null {
  const v = get(k)?.replace(/[$,\s]/g, '');
  if (!v) return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 10_000_000) {
    errors[k] = 'Use a positive amount.';
    return null;
  }
  return Math.round(n * 100) / 100;
}

export function expectedCommission(commissionable: number | null, rate: number): number | null {
  if (commissionable === null) return null;
  return Math.round(commissionable * rate * 100) / 100;
}

export function parseQuoteUpdate(get: Getter): { ok: true; value: QuoteUpdate } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const status = get('status') as LeadStatus;
  if (!LEAD_STATUSES.includes(status)) errors.status = 'Choose a status.';
  const commissionStatus = (get('commission_status') ?? 'none') as CommissionStatus;
  if (!COMMISSION_STATUSES.includes(commissionStatus)) errors.commission_status = 'Choose a commission status.';

  // Rate is entered as a percentage in the form (12 means 12%).
  const ratePct = Number((get('commission_rate_pct') ?? '').trim() || '12');
  if (!Number.isFinite(ratePct) || ratePct < 0 || ratePct > 100) errors.commission_rate_pct = 'Use a percentage from 0 to 100.';
  const rate = Math.round(ratePct * 100) / 10000;

  const bookingValue = money(get, 'booking_value', errors);
  const commissionable = money(get, 'commissionable_amount', errors);
  if (bookingValue !== null && commissionable !== null && commissionable > bookingValue) {
    errors.commissionable_amount = 'Commissionable amount cannot exceed the booking value.';
  }
  const actual = money(get, 'actual_commission', errors);
  const travelStart = date(get, 'travel_start', errors);
  const travelEnd = date(get, 'travel_end', errors);
  if (travelStart && travelEnd && travelEnd < travelStart) errors.travel_end = 'Travel end is before travel start.';
  const paidOn = date(get, 'commission_paid_on', errors);
  if (commissionStatus === 'paid' && actual === null) errors.actual_commission = 'Enter the amount actually paid.';

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      status,
      advisor_notes: text(get, 'advisor_notes'),
      next_follow_up_on: date(get, 'next_follow_up_on', errors),
      supplier: text(get, 'supplier', 120),
      travel_start: travelStart,
      travel_end: travelEnd,
      booking_currency: (text(get, 'booking_currency', 3) ?? 'USD').toUpperCase(),
      booking_value: bookingValue,
      commissionable_amount: commissionable,
      commission_rate: rate,
      expected_commission: expectedCommission(commissionable, rate),
      actual_commission: actual,
      commission_status: commissionStatus,
      commission_paid_on: paidOn,
    },
  };
}

export interface StatusHistoryEntry {
  status: LeadStatus;
  at: string;
}

/** Timestamps and history that follow a status change. */
export function statusSideEffects(
  prev: { status: LeadStatus; status_history: StatusHistoryEntry[]; quoted_at: string | null; booked_at: string | null },
  next: LeadStatus,
  now: string,
): { status_history: StatusHistoryEntry[]; quoted_at: string | null; booked_at: string | null } {
  if (prev.status === next) return { status_history: prev.status_history, quoted_at: prev.quoted_at, booked_at: prev.booked_at };
  return {
    status_history: [...prev.status_history, { status: next, at: now }],
    quoted_at: next === 'quoted' && !prev.quoted_at ? now : prev.quoted_at,
    booked_at: next === 'booked' && !prev.booked_at ? now : prev.booked_at,
  };
}

export interface FunnelRow {
  status: LeadStatus;
  expected_commission: number | null;
  actual_commission: number | null;
  commission_status: CommissionStatus;
  booking_currency: string;
}

/** Keeps requested quotes, bookings, travel and paid commission as separate numbers. */
export function funnelSummary(rows: FunnelRow[]) {
  const by = (s: LeadStatus) => rows.filter((r) => r.status === s).length;
  const usd = rows.filter((r) => r.booking_currency === 'USD');
  const bookedOrTraveled = usd.filter((r) => r.status === 'booked' || r.status === 'traveled');
  return {
    requested: rows.length,
    new: by('new'),
    contacted: by('contacted'),
    quoted: by('quoted'),
    booked: by('booked'),
    traveled: by('traveled'),
    lost: by('lost'),
    canceled: by('canceled'),
    /** Estimated commission on booked or traveled trips that is not yet paid (USD rows only). */
    expectedOutstandingUsd: bookedOrTraveled
      .filter((r) => r.commission_status !== 'paid' && r.commission_status !== 'not-paid')
      .reduce((s, r) => s + (r.expected_commission ?? 0), 0),
    /** Commission actually received (USD rows only). */
    paidUsd: usd.filter((r) => r.commission_status === 'paid').reduce((s, r) => s + (r.actual_commission ?? 0), 0),
    nonUsdRows: rows.length - usd.length,
  };
}
