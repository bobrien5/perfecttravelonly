import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import DealCard from '@/components/ui/DealCard';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import NewsletterSignup from '@/components/ui/NewsletterSignup';
import AffiliateDisclosure from '@/components/ui/AffiliateDisclosure';
import { getCategoryBySlug, categories } from '@/data/categories';
import { getDealsByCategory, deals } from '@/data/deals';

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.seoTitle,
    description: category.metaDescription,
    openGraph: { title: category.seoTitle, description: category.metaDescription },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  let categoryDeals = getDealsByCategory(slug);
  // If no exact matches, show all deals for this page
  if (categoryDeals.length === 0) {
    categoryDeals = deals.slice(0, 6);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: 'Deals', href: '/deals/all-inclusive' }, { label: category.name }]} />

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-10">
        <img
          src={category.heroImage}
          alt={category.name}
          className="w-full h-64 md:h-80 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <span className="text-4xl mb-2 block">{category.icon}</span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{category.name}</h1>
          <p className="text-white/80 max-w-2xl">{category.shortDescription}</p>
        </div>
      </div>

      {/* Description */}
      <div className="prose max-w-3xl mb-10">
        <p className="text-gray-600 leading-relaxed">{category.description}</p>
      </div>

      <AffiliateDisclosure variant="block" />

      {/* Deals Grid */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {categoryDeals.length} {category.name} Available Now
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="mt-16">
        <NewsletterSignup
          heading={`Get ${category.name} alerts`}
          subheading={`Be the first to know when new ${category.name.toLowerCase()} are available.`}
        />
      </div>
    </div>
  );
}
