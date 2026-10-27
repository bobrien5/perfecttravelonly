import Link from 'next/link';
import { normalizeDestination } from '@/lib/resorts/meta';

interface AdvisorCtaProps {
  /** Destination name for a personalized headline, e.g. "Aruba". */
  destination?: string;
  /** Destination slug, passed into the quiz and quote as context when we recognize it. */
  destinationSlug?: string;
  /** Where the click came from, for attribution. */
  source?: string;
  className?: string;
}

/**
 * The two next steps for guides, blog posts and destination pages: get
 * matched with a resort, or ask Brendan for a personal quote. Free for
 * everyone; no membership involved. Makes no price or perk promises.
 */
export default function AdvisorCta({ destination, destinationSlug, source, className = '' }: AdvisorCtaProps) {
  const dest = normalizeDestination(destinationSlug);
  const from = source ? `from=${encodeURIComponent(source)}` : '';
  const quizQs = [dest ? `destination=${dest}` : '', from].filter(Boolean).join('&');
  const quoteQs = [dest ? `destination=${dest}` : '', from].filter(Boolean).join('&');
  const heading = destination ? `Which ${destination} resort is right for you?` : 'Which all-inclusive is right for you?';

  return (
    <div className={`bg-brand-50 rounded-2xl p-6 sm:p-8 text-center ${className}`}>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{heading}</h3>
      <p className="text-gray-700 mb-5 max-w-2xl mx-auto">
        Answer a few questions and get up to three resort picks with honest tradeoffs. Or ask Brendan, VacationPro&apos;s founder, to personally
        check rates, room options and available offers for your trip.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={`/quiz${quizQs ? `?${quizQs}` : ''}`}
          className="inline-flex min-h-12 items-center justify-center px-6 py-3 bg-brand-700 text-white font-semibold rounded-xl hover:bg-brand-800 transition-colors"
        >
          {destination ? `Find my ${destination} resort` : 'Find My Resort'}
        </Link>
        <Link
          href={`/concierge-planning${quoteQs ? `?${quoteQs}` : ''}#quote`}
          className="inline-flex min-h-12 items-center justify-center px-6 py-3 border-2 border-brand-700 text-brand-800 font-semibold rounded-xl hover:bg-white transition-colors"
        >
          Get a Quote from Brendan
        </Link>
      </div>
      <p className="text-xs text-gray-600 mt-3">Free. Requesting a quote does not reserve a room or commit you to booking.</p>
    </div>
  );
}
