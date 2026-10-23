'use client';

import { track as vercelTrack } from '@vercel/analytics';

/**
 * Funnel analytics with an anonymous journey id. The id is a random UUID in
 * localStorage that links quiz, results, comparison, booking clicks and quote
 * submissions from one browser. It carries no personal data, and no event may
 * include names, emails, phone numbers or free-text notes.
 *
 * Events go to Vercel Analytics (already on every page) and GA4 (gtag, loaded
 * in the root layout). An outbound "book online" click is only a click: it is
 * never reported as a booking. Affiliate bookings come from Stay22 reporting,
 * which is aggregated by campaign label, not by journey.
 */

const KEY = 'vacationpro.journey.v1';

export type FunnelEvent =
  | 'quiz_start'
  | 'quiz_step_complete'
  | 'quiz_complete'
  | 'recommendations_viewed'
  | 'recommendations_revised'
  | 'resorts_compared'
  | 'self_book_click'
  | 'quote_start'
  | 'quote_submitted'
  | 'quote_failed'
  | 'results_emailed';

type Props = Record<string, string | number | boolean | null>;

export function getJourneyId(): string {
  if (typeof window === 'undefined') return '';
  try {
    const existing = window.localStorage.getItem(KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    window.localStorage.setItem(KEY, id);
    return id;
  } catch {
    return '';
  }
}

export function trackFunnel(event: FunnelEvent, props: Props = {}): void {
  if (typeof window === 'undefined') return;
  const payload: Props = { ...props, journey_id: getJourneyId() || null };
  try {
    vercelTrack(event, payload);
  } catch {
    // analytics must never break the page
  }
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === 'function') {
    try {
      w.gtag('event', event, payload);
    } catch {
      // ignore
    }
  }
}
