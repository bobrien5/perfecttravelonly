import Link from 'next/link';
import DealCard from '@/components/ui/DealCard';
import DestinationCard from '@/components/ui/DestinationCard';
import CategoryCard from '@/components/ui/CategoryCard';
import BlogCard from '@/components/ui/BlogCard';
import NewsletterSignup from '@/components/ui/NewsletterSignup';
import SectionHeader from '@/components/ui/SectionHeader';
import AffiliateDisclosure from '@/components/ui/AffiliateDisclosure';
import {
  getFeaturedDeals,
  getAllDeals,
  getTimeshareDeals,
} from '@/sanity/lib/fetch';
import { getAllDestinations } from '@/sanity/lib/fetch';
import { getAllCategories } from '@/sanity/lib/fetch';
import { getRecentBlogPosts } from '@/sanity/lib/fetch';

export default async function HomePage() {
  const [featuredDeals, allDeals, allDestinations, allCategories, recentPosts, timeshareDeals] = await Promise.all([
    getFeaturedDeals(),
    getAllDeals(),
    getAllDestinations(),
    getAllCategories(),
    getRecentBlogPosts(3),
    getTimeshareDeals(),
  ]);

  const topDestinations = allDestinations.slice(0, 8);
  const topCategories = allCategories.slice(0, 8);

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=800&fit=crop')] bg-cover bg-center" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              The best vacation package deals on the internet.
              <span className="text-brand-300"> All in one place.</span>
            </h1>
            <p className="text-lg md:text-xl text-brand-100 mb-8 max-w-2xl">
              Discover all-inclusive escapes, flight + hotel bundles, cruise offers, luxury deals,
              and limited-time vacation packages curated by our travel experts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/deals/all-inclusive"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-brand-700 font-semibold rounded-xl hover:bg-brand-50 transition-colors text-lg"
              >
                Browse Deals
              </Link>
              <Link
                href="/newsletter"
                className="inline-flex items-center justify-center px-8 py-4 bg-brand-700 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors text-lg border border-brand-500"
              >
                Get Deal Alerts
              </Link>
            </div>
          </div>
          {/* Quick stats */}
          <div className="mt-12 flex flex-wrap gap-8">
            <div>
              <p className="text-3xl font-bold text-white">{allDeals.length * 10}+</p>
              <p className="text-brand-200 text-sm">Active Deals</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{allDestinations.length}+</p>
              <p className="text-brand-200 text-sm">Destinations</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">Up to 75%</p>
              <p className="text-brand-200 text-sm">Savings</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">How VacationPro Works</h2>
            <p className="text-gray-600 mt-2">Finding your dream vacation deal is simple.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Browse Deals',
                desc: 'Explore curated vacation packages from trusted travel partners, sorted by destination, category, and price.',
              },
              {
                step: '02',
                title: 'Compare & Choose',
                desc: "Review what's included, read our editorial notes, and pick the deal that fits your travel style and budget.",
              },
              {
                step: '03',
                title: 'Book & Save',
                desc: "Click through to our partner's site to lock in your deal. We'll show you exactly how much you're saving.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center mx-auto mb-4 text-lg">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Deals */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Featured Deals"
            subtitle="Hand-picked vacation packages with the best value right now."
            viewAllHref="/deals/all-inclusive"
            viewAllText="View All Deals"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDeals.slice(0, 6).map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
          <div className="mt-4">
            <AffiliateDisclosure />
          </div>
        </div>
      </section>

      {/* Trending Destinations */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Trending Destinations"
            subtitle="The most popular vacation destinations right now."
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topDestinations.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Browse by Category"
            subtitle="Find deals by the type of vacation you're looking for."
          />
          <div className="grid md:grid-cols-2 gap-4">
            {topCategories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Timeshare / Preview Deals Section */}
      <section className="py-16 bg-gradient-to-r from-amber-50 to-brand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Timeshare Preview Deals"
            subtitle="Deeply discounted stays with resort presentations. Transparent terms, real savings."
            viewAllHref="/deals/timeshare"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {timeshareDeals.slice(0, 3).map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-2xl">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Timeshare preview packages require attendance at a resort
              presentation. Eligibility restrictions may apply. We clearly disclose all terms on
              every deal page.{' '}
              <Link href="/legal/disclaimer" className="text-brand-600 hover:underline">
                Learn more
              </Link>.
            </p>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsletterSignup variant="hero" />
        </div>
      </section>

      {/* Blog Preview */}
      {recentPosts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title="From the Blog"
              subtitle="Travel guides, deal tips, and destination insights from our editorial team."
              viewAllHref="/blog"
              viewAllText="Read the Blog"
            />
            <div className="grid md:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Why Travelers Trust VacationPro</h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            We curate deals from trusted travel partners, provide transparent pricing, and always disclose
            when a deal includes affiliate links or promotional requirements.
          </p>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { title: 'Curated Deals', desc: 'Every deal is reviewed by our editorial team before it\'s published.' },
              { title: 'Transparent Pricing', desc: 'We show you the real price, the original price, and exactly what\'s included.' },
              { title: 'Honest Disclosures', desc: 'Timeshare offers, affiliate links, and promotional terms are always clearly marked.' },
              { title: 'Trusted Partners', desc: 'We work with established travel brands and verified deal providers.' },
            ].map((item) => (
              <div key={item.title}>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
