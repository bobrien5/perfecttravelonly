import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'You\'re Booked In — VacationPro Concierge',
  description: 'Your concierge trip planning request has been received.',
  robots: { index: false, follow: false },
};

const CALENDLY_LINK = 'https://calendly.com/vacationpro/discovery-call';

interface PageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function ConciergeThankYouPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sessionId = params.session_id || '';

  return (
    <main className="min-h-screen bg-cream-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto text-center">

        {/* Check icon */}
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-forest mb-4 leading-tight">
          You&apos;re booked in.
        </h1>

        {/* Body */}
        <p className="text-lg text-gray-600 leading-relaxed mb-8">
          Thanks for trusting me with this trip. I will personally reach out within 24 business
          hours to schedule your discovery call (30 minutes by Zoom or phone). After the call,
          I will send a custom proposal with 2 to 3 resort options, real pricing, and a hold
          on the booking.
        </p>

        {/* CTA button */}
        <a
          href={CALENDLY_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full sm:w-auto px-8 py-4 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors text-lg"
        >
          Schedule your discovery call now
        </a>

        {/* Signature */}
        <p className="text-sm text-gray-500 italic mt-8">
          Brendan, VacationPro
        </p>

        {/* Order ID */}
        {sessionId && (
          <p className="text-xs text-gray-400 mt-4">
            Order ID: {sessionId}
          </p>
        )}
      </div>
    </main>
  );
}
