'use client';

import Link from 'next/link';
import { trackFunnel } from '@/lib/analytics/journey';

interface BookingActionsProps {
  /** Affiliate URL for self-booking (Stay22-wrapped, or a deal's own tracked link). Omit to hide. */
  bookHref?: string | null;
  /** Internal quote URL. Never an affiliate link. */
  quoteHref: string;
  /** Where the buttons sit, e.g. "results-best-overall". Used for analytics only. */
  placement: string;
  resortId?: string;
  /** Resort name, used to explain a non-exact booking link. */
  resortName?: string;
  /** False when the link is a partner search rather than the resort's own page. */
  exact?: boolean;
  compact?: boolean;
}

/**
 * The two booking paths, used everywhere a traveler can act on a resort:
 * results, resort pages, comparisons and deal pages. Kept in normal page flow
 * (never fixed or sticky). The quote action is a plain internal link so it can
 * never be picked up by affiliate link processing.
 */
export default function BookingActions({ bookHref, quoteHref, placement, resortId, resortName, exact = true, compact = false }: BookingActionsProps) {
  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      <div className={`grid gap-3 ${bookHref ? 'sm:grid-cols-2' : ''}`}>
        {bookHref && (
          <div>
            <a
              href={bookHref}
              target="_blank"
              rel="sponsored nofollow noopener"
              data-vp-affiliate="partner"
              onClick={() => trackFunnel('self_book_click', { placement, resort_id: resortId ?? null })}
              className="flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-700 px-5 py-3 text-center font-bold text-white transition hover:bg-brand-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-300"
            >
              Check Rates &amp; Book Online
              <span className="sr-only"> (opens a booking partner site in a new tab)</span>
            </a>
            {!compact && (
              <p className="mt-1.5 text-xs text-gray-600">
                {exact
                  ? 'Check availability and book through our booking partners.'
                  : `Opens a search on our booking partner. If ${resortName ?? 'this resort'} is not at the top, search for it by name.`}
              </p>
            )}
          </div>
        )}
        <div>
          <Link
            href={quoteHref}
            data-vp-internal="quote"
            onClick={() => trackFunnel('quote_start', { placement, resort_id: resortId ?? null })}
            className="flex min-h-12 w-full items-center justify-center rounded-xl border-2 border-brand-700 bg-white px-5 py-3 text-center font-bold text-brand-800 transition hover:bg-brand-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-300"
          >
            Get a Quote from Brendan
          </Link>
          {!compact && (
            <p className="mt-1.5 text-xs text-gray-600">
              I&apos;ll personally check rates, room options, and available offers for your trip.
            </p>
          )}
        </div>
      </div>
      {bookHref && (
        <p className="text-xs text-gray-500">
          Booking links are affiliate links: VacationPro may earn a commission at no extra cost to you. Recommendations
          are never ranked by commission.{' '}
          <Link href="/legal/affiliate-disclosure" className="underline hover:text-gray-700">
            Disclosure
          </Link>
        </p>
      )}
    </div>
  );
}
