import { Metadata } from 'next';
import QuoteRequestForm from '@/components/quote/QuoteRequestForm';
import { QUOTE_RESPONSE_COPY } from '@/lib/quote/config';
import { normalizeDestination } from '@/lib/resorts/catalog';
import Stay22Guard from '@/components/monetization/Stay22Guard';

export const metadata: Metadata = {
  title: 'Get Your Vacation Quote',
  description:
    'Tell Brendan about your trip and get a personal all-inclusive quote. Free to request, no commitment.',
  alternates: { canonical: '/quote' },
  robots: { index: false, follow: true }, // ad-only landing page; do not index
};

interface PageProps {
  searchParams: Promise<{
    deal?: string;
    dest?: string;
    destination?: string;
    title?: string;
    price?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  }>;
}

const DESTINATION_LABELS: Record<string, { label: string; title: string }> = {
  'punta-cana': {
    label: 'Punta Cana',
    title: 'Punta Cana All-Inclusive — 3 Nights + Flights for Two',
  },
  'cancun': {
    label: 'Cancun',
    title: 'Cancun All-Inclusive — 3 Nights + Flights for Two',
  },
  'riviera-maya': {
    label: 'Riviera Maya',
    title: 'Riviera Maya All-Inclusive — 3 Nights + Flights for Two',
  },
  'montego-bay': {
    label: 'Montego Bay',
    title: 'Montego Bay Jamaica All-Inclusive — 3 Nights + Flights for Two',
  },
  'puerto-plata': {
    label: 'Puerto Plata',
    title: 'Puerto Plata All-Inclusive — 3 Nights + Flights for Two',
  },
  'aruba': {
    label: 'Aruba',
    title: 'Aruba Adults-Only Tropical Getaway — 3 Nights',
  },
  'las-vegas': {
    label: 'Las Vegas',
    title: 'Las Vegas, NV — The Entertainment Capital of the World',
  },
  'orlando': {
    label: 'Orlando',
    title: 'Orlando, FL — Theme Parks, Sunshine & Endless Entertainment',
  },
  'daytona-beach': {
    label: 'Daytona Beach',
    title: 'Daytona Beach, FL — Surf, Speed & Space Coast Vibes',
  },
  'myrtle-beach': {
    label: 'Myrtle Beach',
    title: 'Myrtle Beach, SC — Shopping, Shows & Beach Fun',
  },
};

export default async function QuotePage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Resolve destination + title from URL params (existing ad links keep working).
  const destSlug = (params.dest || params.destination || params.deal || '').toLowerCase();
  const lookup = DESTINATION_LABELS[destSlug];
  const destinationLabel = lookup?.label || 'all-inclusive';
  const known = normalizeDestination(destSlug === 'montego-bay' ? 'jamaica-montego-bay' : destSlug);

  return (
    <main className="min-h-screen bg-cream-50 py-10 px-4 sm:px-6 lg:px-8">
      <Stay22Guard />
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-forest mb-3 leading-tight">
            Get your {destinationLabel} quote.
          </h1>
          <p className="text-lg text-gray-700">
            Tell me about your trip. I&apos;ll personally check rates, room options, and available offers, then help you book.
            Free to request, and no commitment.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <QuoteRequestForm initialDestination={known} source="quote-landing" responseCopy={QUOTE_RESPONSE_COPY} />
        </div>
      </div>
    </main>
  );
}
