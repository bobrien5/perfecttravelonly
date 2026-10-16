import { Metadata } from 'next';
import ConciergePlanningForm from '@/components/ui/ConciergePlanningForm';
import { getVaultMembership } from '@/lib/vault/membership';
import Stay22Guard from '@/components/monetization/Stay22Guard';
import {
  conciergeIsOpenTo,
  conciergePrice,
  conciergeRequiresPayment,
  CONCIERGE_META_DESCRIPTION,

} from '@/lib/concierge';

export const metadata: Metadata = {
  title: { absolute: 'Plan My Trip, VacationPro Concierge' },
  description: CONCIERGE_META_DESCRIPTION,
  alternates: { canonical: '/concierge-planning' },
  robots: { index: false, follow: true },
};

export default async function ConciergePlanningPage() {
  // Concierge planning is free for Vault members and a paid service for
  // everyone else (2026-10-14). The page is public and indexable, and the form
  // is shown to everyone: non-members simply pay the planning fee after intake
  // rather than being turned away at the door.
  const { isMember, user } = await getVaultMembership();
  const { label: priceLabel, note: priceNote } = conciergePrice(isMember);
  const requiresPayment = conciergeRequiresPayment(isMember);
  const canSubmit = conciergeIsOpenTo(isMember);
  return (
    <main className="min-h-screen bg-cream-50 py-12 px-4 sm:px-6 lg:px-8">
      <Stay22Guard />
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
            Let&apos;s plan your next vacation.
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Plan and book your trip with me. Custom itineraries available.
          </p>
        </div>

        {/* Tier cards */}
        <div className="grid gap-6 mb-16 max-w-xl mx-auto">

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
              <span className="text-4xl font-extrabold text-brand-600">{priceLabel}</span>
              <span className="text-sm text-gray-500">{priceNote}</span>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Tell me your dream trip. I find the resort, compare flights, and build a full
              itinerary with rooms, dining, and excursions.{' '}
              {requiresPayment
                ? `The ${priceLabel} planning fee covers the research and your travel advisor's time building the plan. Vacation Vault members pay nothing.`
                : isMember
                  ? 'Research and your travel advisor’s time are included with your Vacation Vault membership. No planning fee.'
                  : 'Research and your travel advisor’s time are included with Vacation Vault membership. There is no separate planning fee.'}
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
              {requiresPayment
                ? `Start Planning (${priceLabel})`
                : isMember
                  ? 'Start planning, free'
                  : 'Join the Vault and start planning'}
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
            {canSubmit ? (
              <>
                {!isMember && (
                  <div className="mb-6 rounded-2xl bg-brand-700 p-5 text-white sm:p-6">
                    <p className="text-xs font-bold uppercase tracking-wide text-white/70">
                      Before you pay the planning fee
                    </p>
                    <h3 className="mt-1 text-xl font-bold">
                      A year in the Vault costs less than one planning fee.
                    </h3>
                    <p className="mt-2 text-white/85">
                      Membership is $5.99 a month or $59 a year, and it includes concierge
                      planning at no charge plus every deal in the Vault fully unlocked.
                    </p>
                    <a
                      href="/vault?from=concierge"
                      className="mt-5 inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 font-semibold text-brand-700 transition hover:bg-brand-50"
                    >
                      Join the Vault instead
                    </a>
                  </div>
                )}
                <ConciergePlanningForm isMember={isMember} />
              </>
            ) : (
              <div className="rounded-2xl bg-brand-700 p-6 text-white sm:p-8">
                <p className="text-xs font-bold uppercase tracking-wide text-white/70">
                  Vacation Vault members
                </p>
                <h3 className="mt-1 text-2xl font-bold">
                  A licensed advisor builds your trip, included with membership
                </h3>
                <p className="mt-2 text-white/85">
                  Tell me where and roughly when, and I build real options around your dates
                  and your budget. Most advisors charge a planning fee for this. Vault members
                  do not pay one, and you also get every deal in the Vault fully unlocked.
                  $5.99 a month or $59 a year, cancel any time.
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="/vault?from=concierge"
                    className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 font-semibold text-brand-700 transition hover:bg-brand-50"
                  >
                    Join the Vault
                  </a>
                  {!user && (
                    <a
                      href="/auth/signin?next=%2Fconcierge-planning"
                      className="inline-flex items-center justify-center rounded-xl px-6 py-3 font-semibold text-white ring-1 ring-white/40 transition hover:bg-white/10"
                    >
                      Already a member? Sign in
                    </a>
                  )}
                </div>
              </div>
            )}
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
              <div className="text-2xl font-extrabold text-brand-600">{priceLabel}</div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">
                {requiresPayment ? 'Research + advisor time' : 'Free for members'}
              </div>
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
