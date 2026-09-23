import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDealBySlug, getAllDealParams } from '@/sanity/lib/fetch';
import { heroImageSrc } from '@/sanity/lib/image';
import FAQ from '@/components/ui/FAQ';

export const revalidate = 3600;

export async function generateStaticParams() {
  return getAllDealParams();
}

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
  const deal = await getDealBySlug(slug);
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

      {/* Expiry is checked at render, not only in the query, because a page
          built before a deal lapsed can still be served from cache. */}
      {expired && (
        <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
          This deal has expired. It is kept here for reference. See{' '}
          <Link href="/deals" className="font-semibold underline">
            current deals
          </Link>
          .
        </p>
      )}

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

      {/* The source data is inconsistent about whether price is per person or
          per room, and the distinction lives in the disclaimer. Rendering the
          disclaimer next to the price is therefore not optional. */}
      {deal.disclaimer && (
        <p className="mt-2 text-sm text-gray-500">{deal.disclaimer}</p>
      )}

      <dl className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-white p-5 ring-1 ring-gray-100 sm:grid-cols-4">
        {[
          ['Destination', deal.destination],
          ['Length', deal.duration],
          ['Travel dates', deal.travelDates],
          ['Booking', deal.bookingWindow],
        ]
          .filter(([, v]) => v)
          .map(([label, value]) => (
            <div key={label as string}>
              <dt className="text-xs uppercase tracking-wide text-gray-500">{label}</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">{value}</dd>
            </div>
          ))}
      </dl>

      {deal.editorialNotes && (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900">Why we picked it</h2>
          <p className="mt-2 leading-relaxed text-gray-700">{deal.editorialNotes}</p>
        </section>
      )}

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

      {deal.faq && deal.faq.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-xl font-bold text-gray-900">Questions</h2>
          <FAQ items={deal.faq} />
        </section>
      )}

      {/* The affiliate link is used as-is rather than wrapped in Stay22. These
          links already carry Awin tracking, and putting a second affiliate
          redirect in front of one that is already attributed risks breaking
          the attribution we would earn from. */}
      {deal.affiliateLink && !expired && (
        <div className="sticky bottom-4 mt-10">
          <a
            href={deal.affiliateLink}
            target="_blank"
            rel="nofollow sponsored noopener"
            className="flex w-full items-center justify-center rounded-xl bg-brand-700 px-6 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-brand-600"
          >
            {deal.ctaText || 'Check availability'}
          </a>
          <p className="mt-2 text-center text-xs text-gray-500">
            We may earn a commission if you book through this link, at no extra cost to you.
          </p>
        </div>
      )}
    </article>
  );
}
