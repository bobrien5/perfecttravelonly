import Link from 'next/link';

interface AdvisorCtaProps {
  /** Destination name for a personalized headline, e.g. "Aruba". */
  destination?: string;
  /** Where the click came from, appended as a query param for attribution. */
  source?: string;
  className?: string;
}

/**
 * "Book it with me" advisor call to action. Brendan earns advisor commission on
 * trips booked through the concierge funnel, so every guide, blog post, and
 * destination page should offer this path alongside affiliate links.
 */
export default function AdvisorCta({ destination, source, className = '' }: AdvisorCtaProps) {
  const heading = destination
    ? `Want ${destination} booked for you, at agent rates?`
    : 'Booking a group, or want a rate you will not find on Expedia?';
  const body = destination
    ? `I book ${destination} trips as a travel advisor with access to agent-only pricing, resort credits, and perks the booking sites do not show. Tell me your dates and I will price it for you.`
    : 'I book as a travel advisor with access to agent-only pricing, resort credits, and group perks. Tell me your dates and I will price it against whatever you just saw.';
  const href = source
    ? `/concierge-planning?utm_source=site&utm_medium=cta&utm_campaign=${encodeURIComponent(source)}`
    : '/concierge-planning';

  return (
    <div className={`bg-brand-50 rounded-2xl p-8 text-center ${className}`}>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{heading}</h3>
      <p className="text-gray-600 mb-4 max-w-2xl mx-auto">{body}</p>
      <Link
        href={href}
        className="inline-block px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors"
      >
        Get my agent rate
      </Link>
      <p className="text-xs text-gray-500 mt-3">Starts with a $99 planning fee. Proposal within 24 hours.</p>
    </div>
  );
}
