import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import FAQ from '@/components/ui/FAQ';
import TimeshareDisclosure from '@/components/ui/TimeshareDisclosure';
import AffiliateDisclosure from '@/components/ui/AffiliateDisclosure';
import DealCard from '@/components/ui/DealCard';
import NewsletterSignup from '@/components/ui/NewsletterSignup';
import ClaimOfferForm from '@/components/ui/ClaimOfferForm';
import { getDealBySlug, getAllDealParams, getRelatedDeals } from '@/sanity/lib/fetch';
import { getCategoryBySlug } from '@/sanity/lib/fetch';
import { formatPrice } from '@/lib/utils';

interface Props {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateStaticParams() {
  return getAllDealParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const deal = await getDealBySlug(category, slug);
  if (!deal) return {};
  const cleanTitle = deal.seoTitle.replace(/\s*\|\s*VacationPro\s*$/i, '').replace(/\s*[—–]\s*/g, ', ').replace(/\s+,/g, ',').trim();
  const cleanDesc = deal.metaDescription.replace(/\s*[—–]\s*/g, ', ').replace(/\s+,/g, ',').trim();
  return {
    title: { absolute: cleanTitle },
    description: cleanDesc,
    alternates: { canonical: `/deals/${category}/${slug}` },
    openGraph: {
      title: cleanTitle,
      description: cleanDesc,
      images: [{ url: deal.heroImage }],
    },
  };
}

export default async function DealPage({ params }: Props) {
  const { category: catSlug, slug } = await params;
  const deal = await getDealBySlug(catSlug, slug);
  if (!deal) notFound();

  const category = await getCategoryBySlug(catSlug);
  const relatedDeals = await getRelatedDeals(deal.id, catSlug, deal.destinationSlug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: 'Deals', href: '/deals/all-inclusive' },
          { label: category?.name || catSlug, href: `/deals/${catSlug}` },
          { label: deal.title },
        ]}
      />

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Hero Image */}
          <div className="relative rounded-2xl overflow-hidden mb-8">
            <img src={deal.heroImage} alt={deal.title} className="w-full aspect-[16/9] object-cover" />
            <div className="absolute top-4 left-4 flex gap-2">
              {deal.featured && (
                <span className="px-3 py-1 bg-accent-500 text-white text-sm font-bold rounded-full">Featured</span>
              )}
              {deal.isTimeshare && (
                <span className="px-3 py-1 bg-amber-600 text-white text-sm font-bold rounded-full">Preview Offer</span>
              )}
            </div>
          </div>

          {/* Title + Meta */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-brand-600 uppercase tracking-wide">{deal.category}</span>
              <span className="text-gray-300">|</span>
              <Link href={`/destinations/${deal.destinationSlug}`} className="text-sm text-gray-500 hover:text-brand-600">
                {deal.destination}
              </Link>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{deal.title}</h1>
            <p className="text-lg text-gray-600">{deal.shortDescription}</p>
          </div>

          {/* Timeshare Disclosure */}
          {deal.isTimeshare && (
            <div className="mb-8">
              <TimeshareDisclosure />
            </div>
          )}

          {/* Full Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Deal</h2>
            <p className="text-gray-600 leading-relaxed">{deal.fullDescription}</p>
          </div>

          {/* What's Included */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">What&apos;s Included</h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {deal.whatsIncluded.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Deal Highlights */}
          <div className="mb-8 grid sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">Duration</p>
              <p className="text-lg font-semibold text-gray-900">{deal.duration}</p>
            </div>
            {deal.travelDates ? (
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500">Travel Dates</p>
                <p className="text-lg font-semibold text-gray-900">{deal.travelDates}</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500">Booking Window</p>
                <p className="text-lg font-semibold text-gray-900">Flexible</p>
              </div>
            )}
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">Destination</p>
              <p className="text-lg font-semibold text-gray-900">{deal.destination}</p>
            </div>
          </div>

          {/* Editorial Notes */}
          {deal.editorialNotes && (
            <div className="mb-8 bg-brand-50 rounded-xl p-6">
              <h3 className="font-semibold text-brand-800 mb-2">VacationPro Editor&apos;s Take</h3>
              <p className="text-brand-700 text-sm leading-relaxed">{deal.editorialNotes}</p>
            </div>
          )}

          {/* FAQ */}
          {deal.faq && deal.faq.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <FAQ items={deal.faq} />
            </div>
          )}

          {/* Disclaimer */}
          <div className="mb-8">
            <p className="text-xs text-gray-400 leading-relaxed">{deal.disclaimer}</p>
          </div>

          <AffiliateDisclosure variant="block" />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-3xl font-bold text-gray-900">{formatPrice(deal.price)}</span>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(deal.originalPrice)}</span>
                </div>
                <p className="text-sm text-gray-500">per person · {deal.duration}</p>
                <div className="mt-2 inline-flex items-center px-3 py-1 bg-green-50 text-success text-sm font-semibold rounded-full">
                  Save {formatPrice(deal.savingsAmount)} ({deal.savingsPercent}% off)
                </div>
              </div>

              {deal.isTimeshare ? (
                <ClaimOfferForm
                  dealTitle={deal.title}
                  dealDestination={deal.destination}
                  dealPrice={deal.price}
                  ctaText={deal.ctaText}
                />
              ) : (
                <>
                  <a
                    href={`/go?url=${encodeURIComponent(deal.affiliateLink)}&deal=${encodeURIComponent(deal.title)}`}
                    className="block w-full text-center px-6 py-4 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors text-lg mb-3"
                  >
                    {deal.ctaText}
                  </a>
                  <a
                    href={`/go?url=${encodeURIComponent(deal.affiliateLink)}&deal=${encodeURIComponent(deal.title)}`}
                    className="block w-full text-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Check Availability
                  </a>
                </>
              )}

              {deal.bookingWindow && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-amber-600 font-medium">{deal.bookingWindow}</p>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Deal Tags</h3>
              <div className="flex flex-wrap gap-2">
                {deal.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Info</h3>
              <dl className="space-y-2 text-sm">
                {deal.isFamilyFriendly && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Family-Friendly</dt>
                    <dd className="text-gray-900">Yes</dd>
                  </div>
                )}
                {deal.isAdultsOnly && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Adults-Only</dt>
                    <dd className="text-gray-900">Yes</dd>
                  </div>
                )}
                {deal.isLuxury && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Luxury</dt>
                    <dd className="text-gray-900">Yes</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-500">Destination</dt>
                  <dd className="text-gray-900">{deal.destination}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Region</dt>
                  <dd className="text-gray-900">{deal.region}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Related Deals */}
      {relatedDeals.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Deals You Might Like</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedDeals.map((d) => (
              <DealCard key={d.id} deal={d} />
            ))}
          </div>
        </div>
      )}

      {/* Newsletter */}
      <div className="mt-16">
        <NewsletterSignup />
      </div>
    </div>
  );
}
