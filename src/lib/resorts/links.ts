import type { ResortRecord, TripAnswers } from '@vacationpro/engine';
import { stay22HotelUrl } from '@/lib/monetization/stay22';
import { destinationName } from './meta';

/** Whether a self-booking link goes to the exact resort page (verified Expedia id). */
export function hasExactBookingLink(resort: ResortRecord): boolean {
  return Boolean(resort.expediaId);
}

/**
 * Self-booking link for a resort through Stay22. Exact property page when we
 * hold a verified Expedia id; otherwise Stay22's name and location match.
 * `placement` becomes the Stay22 campaign label (aggregated reporting only).
 */
export function resortBookHref(resort: ResortRecord, placement: string, answers?: TripAnswers | null): string {
  const place = [resort.area, destinationName(resort.destination), resort.country]
    .filter((x, i, all) => x && all.indexOf(x) === i)
    .join(', ');
  // Dates and party size are deliberately not sent. Tested 2026-10-26: with
  // checkin/checkout or children, Stay22 always rewrites the link into an
  // Expedia search with the resort pre-selected instead of the resort's own
  // page. Without them it opens the resort page most of the time (Stay22
  // still routes some clicks to the pre-selected search on its own).
  void answers;
  return stay22HotelUrl({ name: resort.name, address: place, expediaId: resort.expediaId }, `vp_${placement}`);
}

/** Internal quote link. Carries only non-personal context (resort id, source). */
export function quoteHref(opts: { resortId?: string | null; destination?: string | null; from: string }): string {
  const p = new URLSearchParams();
  if (opts.resortId) p.set('resort', opts.resortId);
  if (opts.destination && opts.destination !== 'open') p.set('destination', opts.destination);
  p.set('from', opts.from);
  return `/concierge-planning?${p.toString()}#quote`;
}

export function quizHref(opts: { destination?: string | null; resortId?: string | null; from?: string } = {}): string {
  const p = new URLSearchParams();
  if (opts.destination) p.set('destination', opts.destination);
  if (opts.resortId) p.set('resort', opts.resortId);
  if (opts.from) p.set('from', opts.from);
  const q = p.toString();
  return q ? `/quiz?${q}` : '/quiz';
}
