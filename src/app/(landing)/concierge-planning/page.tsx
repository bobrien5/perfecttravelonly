import type { Metadata } from 'next';
import Link from 'next/link';
import QuoteRequestForm from '@/components/quote/QuoteRequestForm';
import Stay22Guard from '@/components/monetization/Stay22Guard';
import { QUOTE_RESPONSE_COPY } from '@/lib/quote/config';
import { getResortRecord, normalizeDestination } from '@/lib/resorts/catalog';

export const metadata: Metadata = {
  title: { absolute: 'Get a Personal Resort Quote from Brendan | VacationPro' },
  description:
    'Tell Brendan, VacationPro’s founder and travel advisor, about your trip. He will personally check rates, room options and available offers, then help you book. Free to request.',
  alternates: { canonical: '/concierge-planning' },
  robots: { index: false, follow: true },
};

interface PageProps {
  searchParams: Promise<{ resort?: string; alts?: string; destination?: string; from?: string }>;
}

/**
 * The personal quote experience. Kept at /concierge-planning so existing
 * links, ads and bio links keep working. Free for everyone: no Vault gate and
 * no planning fee in this flow (the paid Stripe concierge route still exists
 * for existing payments but is no longer linked from here).
 */
export default async function ConciergePlanningPage({ searchParams }: PageProps) {
  const p = await searchParams;
  const resort = p.resort ? getResortRecord(p.resort) : null;
  const alts = (p.alts ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((id) => id && getResortRecord(id)?.status === 'active')
    .slice(0, 5);
  const destination = normalizeDestination(p.destination) ?? resort?.destination ?? null;
  const from = p.from && /^[a-z0-9-]{1,60}$/.test(p.from) ? p.from : null;

  return (
    <main className="bg-cream-50 px-4 py-10 sm:px-6 sm:py-14">
      <Stay22Guard />
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-800">Personal quote</p>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight text-forest sm:text-4xl">
          {resort && resort.status === 'active' ? `Get a quote for ${resort.name}` : 'Get a quote from Brendan'}
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-gray-700">
          I&apos;ll personally check rates, room options, and available offers for your trip, then help you book.
        </p>

        <section className="mt-8 rounded-2xl bg-white p-5 ring-1 ring-gray-100 sm:p-6" aria-labelledby="about-brendan">
          <h2 id="about-brendan" className="text-lg font-extrabold text-gray-900">Who handles your booking</h2>
          <p className="mt-2 text-gray-700">
            I&apos;m Brendan O&apos;Brien, VacationPro&apos;s founder. I book trips myself as an independent travel advisor with Fora,
            so the person reading your request is the person who prices and books it.
          </p>
          <ul className="mt-4 space-y-2 text-gray-700">
            <li className="flex gap-2"><span aria-hidden="true" className="font-bold text-brand-700">✓</span>Personal guidance on the resort and the right room category for your group.</li>
            <li className="flex gap-2"><span aria-hidden="true" className="font-bold text-brand-700">✓</span>I check the offers and package options that apply to your dates, which can include perks or savings. Whether they do depends on the actual quote.</li>
            <li className="flex gap-2"><span aria-hidden="true" className="font-bold text-brand-700">✓</span>Help completing the booking once you decide.</li>
          </ul>
          <p className="mt-4 text-sm text-gray-600">
            This is help choosing and booking a resort, not unlimited itinerary planning. Requesting a quote is free, and it does not
            reserve a room or complete a booking. Rates, availability and extras depend on the actual quote.
          </p>
        </section>

        <section id="quote" className="mt-8 scroll-mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-8" aria-labelledby="quote-form-title">
          <h2 id="quote-form-title" className="text-2xl font-extrabold text-gray-900">Tell me about your trip</h2>
          <p className="mt-1 mb-6 text-gray-600">{QUOTE_RESPONSE_COPY}</p>
          <QuoteRequestForm
            initialResortId={resort?.id ?? null}
            initialAlternatives={alts}
            initialDestination={destination}
            source={from}
            responseCopy={QUOTE_RESPONSE_COPY}
          />
        </section>

        <p className="mt-8 text-center text-sm text-gray-600">
          Prefer to book yourself?{' '}
          <Link href={resort ? `/resorts/${resort.id}` : '/quiz'} className="font-bold text-brand-800 underline">
            {resort ? 'See booking options for this resort' : 'Find your resort and book online'}
          </Link>
        </p>
      </div>
    </main>
  );
}
