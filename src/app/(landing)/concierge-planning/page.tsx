import { Metadata } from 'next';
import ConciergePlanningForm from '@/components/ui/ConciergePlanningForm';

export const metadata: Metadata = {
  title: 'Plan My Trip — VacationPro Concierge',
  description:
    '1-on-1 trip planning with VacationPro. $99 to start, credited back when you book. Refundable for 7 days.',
  robots: { index: false, follow: true },
};

export default function ConciergePlanningPage() {
  return (
    <main className="min-h-screen bg-cream-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">

        {/* Trust badge */}
        <div className="text-center mb-6">
          <span className="inline-block bg-brand-50 text-brand-700 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full">
            1-on-1 Concierge Planning
          </span>
        </div>

        {/* Headline */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-forest mb-3 leading-tight">
            Plan it for me.
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Tell me about your dream trip. I will find the resort, compare flights, and build
            the full itinerary. $99 to start, credited back when you book, refundable for 7 days
            if I cannot find you a trip you love.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <ConciergePlanningForm />
        </div>

        {/* Trust strip */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-extrabold text-brand-600">24h</div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">Response time</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-brand-600">100%</div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">Refundable for 7 days</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-brand-600">$99</div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">Credited back when you book</div>
          </div>
        </div>

        {/* Privacy note */}
        <p className="text-xs text-gray-500 text-center mt-6">
          By submitting, you agree to our{' '}
          <a href="/privacy" className="underline hover:text-gray-700">
            Privacy Policy
          </a>
          . Your info is used only to plan and confirm your trip. We will never sell your details.
        </p>
      </div>
    </main>
  );
}
