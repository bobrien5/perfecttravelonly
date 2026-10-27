import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDealBySlug } from '@/sanity/lib/fetch';
import { heroImageSrc } from '@/sanity/lib/image';
import { getVaultMembership } from '@/lib/vault/membership';
import FAQ from '@/components/ui/FAQ';
import BookingActions from '@/components/booking/BookingActions';
import { inferDestinationSlug } from '@/lib/resorts/catalog';
import { quoteHref } from '@/lib/resorts/links';

// Membership is read from the session cookie, so this page renders per
// request. It was ISR with generateStaticParams before the Vault; that
// combination throws once cookies() is involved, and per-request rendering
// costs nothing at this catalog size. Search engines still get full HTML:
// they see the non-member view, which is the teaser, and that is the point.
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const deal = await getDealBySlug(slug);
  if (!deal) return {};
  const img = heroImageSrc(deal, 1200);
  return {
    title: { absolute: deal.seoTitle || `${deal.title} | VacationPro` },
    description: deal.metaDescription || deal.shortDescription,
    alternates: { canonical: `/deals/${deal.slug}` },
    openGraph: {
      title: deal.seoTitle || deal.title,
      description: deal.metaDescription || deal.shortDescription,
      images: img ? [{ url: img }] : undefined,
    },
  };
}

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [deal, { isMember }] = await Promise.all([getDealBySlug(slug), getVaultMembership()]);
  if (!deal) notFound();

  const img = heroImageSrc(deal, 1600);
  const expired = deal.expiresAt ? deal.expiresAt < new Date().toISOString().slice(0, 10) : false;

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <nav className="mb-5 text-sm text-gray-500">
        <Link href="/deals" className="hover:text-brand-700">
          Deals
        </Link>
        <span className="mx-2">/</span>
        <span>{deal.destination}</span>
      </nav>

      {deal.featured && (
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-700">
          VacationPro Pick
        </p>
      )}
      <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
        {deal.title}
      </h1>

      {img && (
        <div className="mt-6 overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt={deal.title} className="h-64 w-full object-cover sm:h-96" />
        </div>
      )}

      {expired && (
        <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
          This deal has expired. It is kept here for reference. See{' '}
          <Link href="/deals" className="font-semibold underline">
            current deals
          </Link>
          .
        </p>
      )}

      {/* Price, savings and the disclaimer are open to everyone. The teaser
          has to be honest about what the deal costs, or the Vault is selling
          a surprise. */}
      <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-3xl font-bold text-gray-900">
          ${deal.price.toLocaleString()}
        </span>
        {deal.originalPrice && deal.originalPrice > deal.price && (
          <span className="text-lg text-gray-400 line-through">
            ${deal.originalPrice.toLocaleString()}
          </span>
        )}
        {deal.savingsPercent ? (
          <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
            Save {deal.savingsPercent}%
          </span>
        ) : null}
      </div>
      {deal.disclaimer && <p className="mt-2 text-sm text-gray-500">{deal.disclaimer}</p>}

      <dl className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-white p-5 ring-1 ring-gray-100 sm:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-wide text-gray-500">Destination</dt>
          <dd className="mt-1 text-sm font-medium text-gray-900">{deal.destination}</dd>
        </div>
        {deal.duration && (
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">Length</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">{deal.duration}</dd>
          </div>
        )}
        {/* Existing Vault members keep seeing the exact dates and booking
            window (an entitlement we preserve). Everyone else books from the
            same link below, which shows live dates and availability. */}
        {isMember && (
          <>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500">Travel dates</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">{deal.travelDates || 'See booking link'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500">Booking</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">{deal.bookingWindow || 'While available'}</dd>
            </div>
          </>
        )}
      </dl>

      {deal.whatsIncluded && deal.whatsIncluded.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900">What is included</h2>
          <ul className="mt-3 space-y-2">
            {deal.whatsIncluded.map((item) => (
              <li key={item} className="flex gap-2 text-gray-700">
                <span aria-hidden className="mt-1 text-brand-600">
                  &#10003;
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {deal.fullDescription && (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900">About this trip</h2>
          <p className="mt-2 whitespace-pre-line leading-relaxed text-gray-700">
            {deal.fullDescription}
          </p>
        </section>
      )}

      {isMember && deal.editorialNotes && (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900">Why we picked it</h2>
          <p className="mt-2 leading-relaxed text-gray-700">{deal.editorialNotes}</p>
        </section>
      )}

      {isMember && deal.faq && deal.faq.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-xl font-bold text-gray-900">Questions</h2>
          <FAQ items={deal.faq} />
        </section>
      )}

      {/* Both booking paths, open to everyone. The deal's own link is used
          as-is (not wrapped in Stay22): it already carries Awin tracking, and
          a second affiliate hop risks breaking it. */}
      <section className="mt-10 rounded-2xl bg-white p-5 ring-1 ring-gray-100 sm:p-6" aria-label="Book this deal">
        {expired && <p className="mb-4 text-sm text-gray-700">This deal has expired, but Brendan can check what is available now.</p>}
        <BookingActions
          bookHref={deal.affiliateLink && !expired ? deal.affiliateLink : null}
          quoteHref={quoteHref({ destination: inferDestinationSlug(`${deal.destinationSlug ?? ''} ${deal.destination ?? ''}`), from: 'deal' })}
          placement={`deal-${deal.slug}`.slice(0, 60)}
        />
      </section>
    </article>
  );
}
