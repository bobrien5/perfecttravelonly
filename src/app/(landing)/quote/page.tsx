import { Metadata } from 'next';
import ConciergePlanningForm from '@/components/ui/ConciergePlanningForm';
import Stay22Guard from '@/components/monetization/Stay22Guard';

export const metadata: Metadata = {
  title: 'Get Your Verified Vacation Quote',
  description:
    'Tell us about your trip and we will email a verified all-inclusive quote within 24 hours. No spam, no commitment, no surprise fees.',
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

  // Resolve destination + title from URL params
  const destSlug = (params.dest || params.destination || params.deal || '').toLowerCase();
  const lookup = DESTINATION_LABELS[destSlug];
  const destinationLabel = lookup?.label || params.destination || 'Caribbean Vacation';
  const priceLabel = params.price ? `from ${params.price}` : 'verified pricing';

  return (
    <main className="min-h-screen bg-cream-50 py-12 px-4 sm:px-6 lg:px-8">
      <Stay22Guard />
      <div className="max-w-2xl mx-auto">
        {/* Trust badge */}
        <div className="text-center mb-6">
          <span className="inline-block bg-brand-50 text-brand-700 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full">
            Verified Pricing · Limited Inventory
          </span>
        </div>

        {/* Headline */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-forest mb-3 leading-tight">
            Get your {destinationLabel} quote.
          </h1>
          <p className="text-lg text-gray-600">
            Tell us about your trip and we will email a {priceLabel} quote within 24 hours.
            <br />
            No spam, no commitment, no surprise fees.
          </p>
        </div>

        {/* Concierge intake form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <ConciergePlanningForm defaultDestination={destinationLabel} sourceLabel="Quote landing page" />
        </div>

        {/* Trust strip */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-extrabold text-brand-600">24h</div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">Quote Turnaround</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-brand-600">100%</div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">Verified Pricing</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-brand-600">$0</div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">Hidden Fees</div>
          </div>
        </div>

        {/* Privacy note */}
        <p className="text-xs text-gray-500 text-center mt-6">
          By submitting, you agree to our{' '}
          <a href="/privacy" className="underline hover:text-gray-700">
            Privacy Policy
          </a>
          . We will email or call you with your quote and may share your details with our travel
          partner. You can unsubscribe at any time.
        </p>
      </div>
    </main>
  );
}
