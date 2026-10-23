import type { ResortRecord, TripAnswers } from './types';

/**
 * Adds the traveler's stay to the resort's booking search URL, using only
 * parameters the destination site itself documents in its own URLs (Expedia
 * Hotel-Search: startDate, endDate, adults). Anything else is left as stored.
 * Party size is only passed for a single room with no children, because the
 * multi-room and child-age formats are not something we have verified.
 *
 * The result is the `link` that the Stay22 allez redirect wraps. No tracking
 * parameters are added here.
 */
export function bookingTargetUrl(resort: ResortRecord, answers?: TripAnswers | null): string {
  let url: URL;
  try {
    url = new URL(resort.bookingSearchUrl);
  } catch {
    return resort.bookingSearchUrl;
  }
  const isExpediaSearch = /(^|\.)expedia\.com$/.test(url.hostname) && url.pathname.startsWith('/Hotel-Search');
  if (!isExpediaSearch || !answers) return url.toString();

  const d = answers.dates;
  if (d && d.mode === 'exact') {
    url.searchParams.set('startDate', d.checkIn);
    url.searchParams.set('endDate', d.checkOut);
  }
  if (answers.rooms === 1 && answers.childAges.length === 0 && answers.adults >= 1) {
    url.searchParams.set('adults', String(answers.adults));
  }
  return url.toString();
}
