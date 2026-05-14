import { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import ClaimOfferForm from '@/components/ui/ClaimOfferForm';
import { findByKeyword } from '@/lib/deal-registry';

const getDeal = cache((keyword: string) => findByKeyword(keyword));

interface PageProps {
  params: Promise<{ keyword: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { keyword } = await params;
  const deal = await getDeal(keyword).catch(() => null);
  if (!deal) {
    return {
      title: 'Claim Your Vacation Deal',
      description: 'Tell us about your trip and we will email verified pricing within 24 hours.',
      robots: { index: false, follow: true },
    };
  }
  return {
    title: `${deal.destination} Deal from $${deal.price} | VacationPro`,
    description: deal.dealTitle,
    robots: { index: false, follow: true },
  };
}

export default async function DealLandingPage({ params }: PageProps) {
  const { keyword } = await params;
  // A registry failure is treated as a missing keyword at the user-facing layer:
  // the error is logged server-side, the user sees the 404 page rather than a 500.
  const deal = await getDeal(keyword).catch((err) => {
    console.error('[DealLandingPage] findByKeyword error:', err);
    return null;
  });
  if (!deal) notFound();

  return (
    <main
      aria-label="Deal claim form"
      className="min-h-screen bg-cream-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <span className="inline-block bg-brand-50 text-brand-700 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full">
            Verified Pricing · Limited Inventory
          </span>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-forest mb-3 leading-tight">
            {deal.destination} from ${deal.price}
          </h1>
          <p className="text-lg text-gray-600">
            {deal.dealTitle}. Fill out the form and we will email verified pricing within 24 hours.
            <br />
            No spam, no commitment, no surprise fees.
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <ClaimOfferForm
            dealTitle={deal.dealTitle}
            dealDestination={deal.destination}
            dealPrice={deal.price}
            ctaText="Get My Quote"
          />
        </div>
        <p className="text-xs text-gray-500 text-center mt-6">
          By submitting, you agree to our{' '}
          <a href="/privacy" className="underline hover:text-gray-700">Privacy Policy</a>. We will
          email or call you with your quote and may share your details with our travel partner. You
          can unsubscribe at any time.
        </p>
      </div>
    </main>
  );
}
