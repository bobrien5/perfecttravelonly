/**
 * Quote workflow settings. Response time is copy, not a promise: it defaults
 * to no timeframe and only states one when QUOTE_RESPONSE_COPY is set to a
 * policy Brendan has confirmed (e.g. "Brendan replies within one business day.").
 */
export const QUOTE_RESPONSE_COPY =
  process.env.NEXT_PUBLIC_QUOTE_RESPONSE_COPY?.trim() || 'Brendan will reply by email with next steps.';

/** Internal planning estimate for expected commission. Editable per booking in admin. */
export const DEFAULT_COMMISSION_RATE = (() => {
  const n = Number(process.env.ADVISOR_COMMISSION_RATE);
  return Number.isFinite(n) && n > 0 && n < 1 ? n : 0.12;
})();

export const QUOTE_RATE_LIMIT_PER_HOUR = 5;
export const QUOTE_DUPLICATE_WINDOW_MINUTES = 10;

export const LEAD_STATUSES = ['new', 'contacted', 'quoted', 'booked', 'traveled', 'lost', 'canceled'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const COMMISSION_STATUSES = ['none', 'expected', 'invoiced', 'paid', 'not-paid'] as const;
export type CommissionStatus = (typeof COMMISSION_STATUSES)[number];
