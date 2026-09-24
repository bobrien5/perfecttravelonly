import Link from 'next/link';
import DestinationCard from '@/components/ui/DestinationCard';
import BlogCard from '@/components/ui/BlogCard';
import NewsletterSignup from '@/components/ui/NewsletterSignup';
import SectionHeader from '@/components/ui/SectionHeader';
import { getAllDestinations, getRecentBlogPosts, getFeaturedDeals } from '@/sanity/lib/fetch';
import DealCard from '@/components/deals/DealCard';
import Stay22Guard from '@/components/monetization/Stay22Guard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Tropical Travel Guides + Concierge Booking | VacationPro' },
  description:
    'Expert guides to the best tropical and all-inclusive trips, plus concierge booking to plan and book your vacation with a real travel advisor.',
  alternates: { canonical: '/' },
};

export default async function HomePage() {
  const [allDestinations, recentPosts, featuredDeals] = await Promise.all([
    getAllDestinations(),
    getRecentBlogPosts(6),
    getFeaturedDeals(),
  ]);
  const topDestinations = allDestinations.slice(0, 8);

  return (
    <>
      <Stay22Guard />
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&h=800&fit=crop')] bg-cover bg-center" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 md:py-28">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6">
              Where should we send you next?
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-brand-100 mb-6 sm:mb-8 max-w-2xl">
              Handpicked vacation deals, personalized recommendations, and everything
              you need to plan the perfect trip.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                href="/quiz"
                className="inline-flex items-center justify-center px-5 sm:px-8 py-3 sm:py-4 bg-white text-brand-700 font-semibold rounded-xl hover:bg-brand-50 transition-colors text-sm sm:text-lg"
              >
                Find My Vacation
              </Link>
              <Link
                href="/trips"
                className="inline-flex items-center justify-center px-5 sm:px-8 py-3 sm:py-4 bg-brand-700 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors text-sm sm:text-lg border border-brand-500"
              >
                Build a Trip
              </Link>
            </div>
            <p className="mt-4 text-sm text-brand-100">
              Or{' '}
              <Link href="/deals" className="font-semibold text-white underline underline-offset-4">
                browse deals
              </Link>{' '}
              we would book ourselves.
            </p>
          </div>
        </div>
      </section>


      {/* VacationPro Picks: the deals rail, immediately after the hero per the
          brief. Rendered only when there are featured deals, because every
          deal carries an expiry and the set can legitimately empty out. An
          empty rail with a heading reads as broken; no rail reads as fine. */}
      {featuredDeals.length > 0 && (
        <section className="bg-cream-50 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  VacationPro Picks
                </h2>
                <p className="mt-1 text-gray-600">
                  Handpicked trips we would book ourselves.
                </p>
              </div>
              <Link
                href="/deals"
                className="shrink-0 text-sm font-semibold text-brand-700 hover:text-brand-600"
              >
                All deals
              </Link>
            </div>

            {/* Horizontal scroll on mobile, grid on desktop. */}
            <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
              {featuredDeals.slice(0, 6).map((deal) => (
                <div key={deal.id} className="w-[78vw] shrink-0 snap-start sm:w-auto">
                  <DealCard deal={deal} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured guides */}
      {recentPosts.length > 0 && (
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title="Latest Guides"
              subtitle="Destination guides, resort breakdowns, and tropical travel tips."
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

      {/* Destinations */}
      <section className="py-12 sm:py-16 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Explore Destinations"
            subtitle="Guides to the most popular tropical destinations."
          />
          <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 md:grid-cols-4 sm:gap-4 sm:overflow-visible sm:pb-0">
            {topDestinations.map((dest) => (
              <div key={dest.id} className="min-w-[200px] sm:min-w-0 snap-start">
                <DestinationCard destination={dest} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quiz CTA */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Not sure where to go?" />
          <div className="bg-gray-50 rounded-2xl p-8 sm:p-12 text-center">
            <p className="text-gray-600 text-base sm:text-lg mb-6 max-w-2xl mx-auto">
              Answer a few quick questions about your group, dates, and vibe and we will match you
              with the destinations that fit you best.
            </p>
            <Link
              href="/quiz"
              className="inline-flex items-center justify-center px-8 py-4 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors text-lg"
            >
              Take the 2-minute vacation quiz
            </Link>
          </div>
        </div>
      </section>

      {/* Concierge upsell band (placeholder copy; real two-tier component lands in Part 3) */}
      <section className="py-14 sm:py-20 bg-gradient-to-r from-brand-600 to-brand-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Ready to book? Let me plan it.</h2>
          <p className="text-brand-50 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
            Tell me your dates, your group, and your home airport. I will build the trip and book it
            for you as your travel advisor. No booking fees.
          </p>
          <Link
            href="/concierge-planning"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-brand-700 font-semibold rounded-xl hover:bg-brand-50 transition-colors text-lg"
          >
            Plan With Me
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsletterSignup variant="hero" />
        </div>
      </section>
    </>
  );
}
