import { bookingTargetUrl, type ResortRecord, type TripAnswers } from '@vacationpro/engine';
import { stay22Url } from '@/lib/monetization/stay22';

/**
 * Self-booking link for a resort: the resort's booking search URL (with the
 * traveler's exact dates when known) wrapped in the existing Stay22 allez
 * redirect. `placement` becomes the Stay22 campaign label, which is the only
 * attribution Stay22 reports back (aggregated, not per traveler).
 */
export function resortBookHref(resort: ResortRecord, placement: string, answers?: TripAnswers | null): string {
  return stay22Url(bookingTargetUrl(resort, answers), `vp-${placement}`.slice(0, 60));
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
