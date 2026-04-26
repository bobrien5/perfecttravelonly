import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import DealCard from '@/components/ui/DealCard';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import FAQ from '@/components/ui/FAQ';
import NewsletterSignup from '@/components/ui/NewsletterSignup';
import AffiliateDisclosure from '@/components/ui/AffiliateDisclosure';
import BlogCard from '@/components/ui/BlogCard';
import {
  getDestinationBySlug,
  getAllDestinations,
  getAllDestinationParams,
  getDealsByDestination,
  getRecentDeals,
  getRecentBlogPosts,
} from '@/sanity/lib/fetch';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllDestinationParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) return {};
  const cleanTitle = destination.seoTitle.replace(/\s*\|\s*VacationPro\s*$/i, '').replace(/\s*[—–]\s*/g, ', ').replace(/\s+,/g, ',').trim();
  const cleanDesc = destination.metaDescription.replace(/\s*[—–]\s*/g, ', ').replace(/\s+,/g, ',').trim();
  return {
    title: { absolute: cleanTitle },
    description: cleanDesc,
    alternates: { canonical: `/destinations/${slug}` },
    openGraph: {
      title: cleanTitle,
      description: cleanDesc,
      images: [{ url: destination.heroImage }],
    },
  };
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) notFound();

  let destDeals = await getDealsByDestination(slug);
  if (destDeals.length === 0) {
    destDeals = await getRecentDeals(4);
  }

  const relatedPosts = await getRecentBlogPosts(3);
  const allDestinations = await getAllDestinations();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: 'Destinations' }, { label: destination.name }]} />

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-10">
        <img
          src={destination.heroImage}
          alt={destination.name}
          className="w-full h-72 md:h-96 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <p className="text-white/80 text-sm uppercase tracking-wide mb-2">{destination.country} · {destination.region}</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{destination.name}</h1>
          <p className="text-white/80 max-w-2xl">{destination.shortDescription}</p>
        </div>
      </div>

      {/* Description */}
      <div className="prose max-w-3xl mb-10">
        <p className="text-gray-600 leading-relaxed text-lg">{destination.description}</p>
      </div>

      {/* Categories for this destination */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Categories in {destination.name}</h2>
        <div className="flex flex-wrap gap-2">
          {destination.categories.map((cat) => (
            <Link
              key={cat}
              href={`/deals/${cat}`}
              className="px-4 py-2 bg-brand-50 text-brand-700 font-medium rounded-full text-sm hover:bg-brand-100 transition-colors capitalize"
            >
              {cat.replace(/-/g, ' ')}
            </Link>
          ))}
        </div>
      </div>

      <AffiliateDisclosure variant="block" />

      {/* Deals */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Best Deals in {destination.name}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </div>

      {/* FAQ */}
      {destination.faq && destination.faq.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{destination.name} Travel FAQ</h2>
          <FAQ items={destination.faq} />
        </div>
      )}

      {/* Related Blog Posts */}
      {relatedPosts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {destination.name} Travel Guides & Tips
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}

      {/* Other Destinations */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore More Destinations</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {allDestinations
            .filter((d) => d.slug !== slug)
            .slice(0, 4)
            .map((d) => (
              <Link
                key={d.id}
                href={`/destinations/${d.slug}`}
                className="group relative rounded-xl overflow-hidden aspect-[4/3]"
              >
                <img src={d.heroImage} alt={d.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <p className="text-white font-semibold">{d.name}</p>
                  <p className="text-white/70 text-xs">{d.dealCount} deals</p>
                </div>
              </Link>
            ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="mt-16">
        <NewsletterSignup
          heading={`Get ${destination.name} deal alerts`}
          subheading={`Never miss a deal to ${destination.name}. Subscribe for free.`}
        />
      </div>
    </div>
  );
}
