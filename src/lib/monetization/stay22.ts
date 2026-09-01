import { LMA_ID } from '@/components/monetization/Stay22Scripts';

/**
 * Brendan's Stay22 account id (aid), re-exported from the single source of
 * truth in Stay22Scripts.tsx so callers of stay22Url() do not need to know
 * where it lives.
 */
export const STAY22_AID = LMA_ID;

/**
 * Wraps a target booking URL in Stay22's "allez" link format, a plain
 * monetized redirect link (no script injected on the page). This is the
 * Trip Hub resort picker's Check rates link: the controller ruling was that
 * Stay22Scripts (letmeallez.js, which also runs Nova's booking-intent
 * popups) must never mount on /trips routes, since Nova can poach a
 * concierge lead Brendan earns advisor commission on. A plain allez link
 * still earns affiliate commission with none of that popup behavior.
 *
 * @param targetUrl the booking URL to wrap (e.g. resort.expediaUrl)
 * @param campaign a short label identifying where the click came from
 */
export function stay22Url(targetUrl: string, campaign: string): string {
  if (!targetUrl) {
    throw new Error('stay22Url: targetUrl must not be empty.');
  }

  return `https://www.stay22.com/allez/roam?aid=${encodeURIComponent(STAY22_AID)}&campaign=${encodeURIComponent(campaign)}&link=${encodeURIComponent(targetUrl)}`;
}
