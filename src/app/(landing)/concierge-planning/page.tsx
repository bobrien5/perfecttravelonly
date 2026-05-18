import { Metadata } from 'next';
import Link from 'next/link';
import ConciergePlanningForm from '@/components/ui/ConciergePlanningForm';

export const metadata: Metadata = {
  title: 'Plan My Trip, VacationPro Concierge',
  description:
    'Two ways to book your next vacation. Pick a curated package for free or hire a travel advisor to plan a custom trip for $99.',
  robots: { index: false, follow: true },
};

export default function ConciergePlanningPage() {
  return (
    <main className="min-h-screen bg-cream-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Eyebrow */}
        <div className="text-center mb-6">
          <span className="inline-block bg-brand-50 text-brand-700 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full">
            VacationPro Concierge
          </span>
        </div>

        {/* Headline */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-forest mb-4 leading-tight">
            Two ways to book your next vacation.
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Browse a curated package and book it free, or hire me to plan a fully custom trip
            from scratch. Either way, you get a real human checking the details before you pay
            a hotel a dime.
          </p>
        </div>

        {/* Tier cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">

          {/* FREE PATH */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100 flex flex-col">
            <div className="mb-4">
              <span className="inline-block bg-gray-100 text-gray-700 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                Free
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-forest mb-2">
              Book a Curated Package
            </h2>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-extrabold text-forest">Free</span>
              <span className="text-sm text-gray-500">no planning fee</span>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Pre-vetted resorts, dates, and prices. Click the deal you want, confirm with me,
              and I handle the booking. You pay the resort directly, I earn a commission on
              the back end. You pay nothing extra.
            </p>

            <div className="mb-6">
              <p className="text-sm font-bold text-forest mb-3 uppercase tracking-wide">
                Perfect if:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-brand-600 font-bold mt-0.5">+</span>
                  <span>You want a great deal without doing the research</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-600 font-bold mt-0.5">+</span>
                  <span>Flexible on resort, just want sun and a fair price</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-600 font-bold mt-0.5">+</span>
                  <span>Budget under $4k for a couples trip</span>
                </li>
              </ul>
            </div>

            <div className="mb-8">
              <p className="text-sm font-bold text-forest mb-3 uppercase tracking-wide">
                Includes:
              </p>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>Curated all-inclusive and Caribbean deals</li>
                <li>Booking handled by VacationPro</li>
                <li>24h response on questions</li>
                <li>Price-match if the same package drops</li>
              </ul>
            </div>

            <Link
              href="/deals/all-inclusive"
              className="mt-auto block w-full text-center bg-forest hover:opacity-90 text-white font-bold py-4 px-6 rounded-xl transition-opacity"
            >
              Browse Packages
            </Link>
          </div>

          {/* PAID PATH */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-brand-500 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-block bg-brand-500 text-white text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full shadow">
                Most Popular
              </span>
            </div>
            <div className="mb-4">
              <span className="inline-block bg-brand-50 text-brand-700 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                Custom
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-forest mb-2">
              Plan it for me
            </h2>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-extrabold text-brand-600">$99</span>
              <span className="text-sm text-gray-500">research + advisor time</span>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Tell me your dream trip. I find the resort, compare flights, and build a full
              itinerary with rooms, dining, and excursions. The $99 fee covers the research and
              your travel advisor's time building the plan.
            </p>

            <div className="mb-6">
              <p className="text-sm font-bold text-forest mb-3 uppercase tracking-wide">
                Perfect if:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-brand-600 font-bold mt-0.5">+</span>
                  <span>Specific destination, dates, or room type in mind</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-600 font-bold mt-0.5">+</span>
                  <span>Special occasion (honeymoon, anniversary, milestone birthday)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-600 font-bold mt-0.5">+</span>
                  <span>Multi-stop or group trip with kids</span>
                </li>
              </ul>
            </div>

            <div className="mb-8">
              <p className="text-sm font-bold text-forest mb-3 uppercase tracking-wide">
                Includes:
              </p>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>Resort and flight comparison</li>
                <li>Full itinerary with dining and activities</li>
                <li>Direct WhatsApp access for trip questions</li>
                <li>Research and advisor time included</li>
              </ul>
            </div>

            <a
              href="#plan-my-trip"
              className="mt-auto block w-full text-center bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
            >
              Start Planning ($99)
            </a>
          </div>
        </div>

        {/* Form section (paid path) */}
        <div id="plan-my-trip" className="max-w-2xl mx-auto scroll-mt-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-forest mb-2">
              Tell me about your dream trip.
            </h2>
            <p className="text-gray-600">
              The more detail you share, the better the plan I send back within 24 hours.
            </p>
          </div>

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
              <div className="text-2xl font-extrabold text-brand-600">1:1</div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">Real travel advisor</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-brand-600">$99</div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">Research + advisor time</div>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center mt-6">
            By submitting, you agree to our{' '}
            <a href="/privacy" className="underline hover:text-gray-700">
              Privacy Policy
            </a>
            . Your info is used only to plan and confirm your trip. We will never sell your details.
          </p>
        </div>
      </div>
    </main>
  );
}
