import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import BlogCard from '@/components/ui/BlogCard';
import NewsletterSignup from '@/components/ui/NewsletterSignup';
import SectionHeader from '@/components/ui/SectionHeader';
import DealCard from '@/components/deals/DealCard';
import Stay22Guard from '@/components/monetization/Stay22Guard';
import { getRecentBlogPosts, getFeaturedDeals } from '@/sanity/lib/fetch';
import { resortsForDestination } from '@/lib/resorts/catalog';

export const metadata: Metadata = {
  title: { absolute: 'Find Your All-Inclusive Resort | VacationPro' },
  description:
    'Tell us your budget and vacation vibe. Get personalized all-inclusive resort recommendations for Mexico and the Caribbean, then book online or let Brendan help.',
  alternates: { canonical: '/' },
};

const PRIORITIES = [
  { icon: '🏝️', title: 'Great beaches', body: 'Soft sand and water you actually want to swim in.' },
  { icon: '🍽️', title: 'Great food', body: 'Restaurants worth staying in for, not just a buffet.' },
  { icon: '🍹', title: 'Lively pools', body: 'Swim-up bars, music and a social scene by day.' },
  { icon: '🌙', title: 'Quiet escapes', body: 'Adults-only calm for couples who want to unwind.' },
  { icon: '🧒', title: 'Family fun', body: 'Kids clubs, splash areas and rooms that fit everyone.' },
];

const DESTINATIONS = [
  { slug: 'cancun', name: 'Cancun', guide: '/destinations/cancun' },
  { slug: 'riviera-maya', name: 'Riviera Maya and Tulum', guide: null },
  { slug: 'punta-cana', name: 'Punta Cana', guide: '/destinations/punta-cana' },
  { slug: 'aruba', name: 'Aruba', guide: '/destinations/aruba' },
];

const QUOTE_ONLY = [
  { name: 'Montego Bay', guide: '/destinations/jamaica-montego-bay', slug: 'jamaica-montego-bay' },
  { name: 'Negril', guide: '/destinations/jamaica-negril', slug: 'jamaica-negril' },
  { name: 'Cabo San Lucas', guide: '/destinations/cabo-san-lucas', slug: 'cabo-san-lucas' },
];

const COMPARISONS = [
  { label: 'Adults-only Cancun: Le Blanc vs Excellence Playa Mujeres vs Secrets The Vine', ids: 'le-blanc-spa-resort-cancun,excellence-playa-mujeres,secrets-the-vine-cancun' },
  { label: 'Family Cancun: Moon Palace The Grand vs Hyatt Ziva vs Dreams Sands', ids: 'moon-palace-the-grand-cancun,hyatt-ziva-cancun,dreams-sands-cancun' },
  { label: 'Cap Cana couples: Secrets Cap Cana vs Hyatt Zilara Cap Cana', ids: 'secrets-cap-cana,hyatt-zilara-cap-cana' },
];

const btnPrimary =
  'inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-7 py-3 text-base font-bold text-brand-800 transition hover:bg-brand-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60 sm:text-lg';
const btnSecondary =
  'inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-white px-7 py-3 text-base font-bold text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60 sm:text-lg';

export default async function HomePage() {
  const [recentPosts, featuredDeals] = await Promise.all([getRecentBlogPosts(3), getFeaturedDeals()]);

  return (
    <>
      <Stay22Guard />

      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-900 text-white">
        <Image src="/links/hero.jpg" alt="" fill priority sizes="100vw" className="object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/90 via-brand-900/70 to-brand-900/30" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 md:py-28 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="mb-4 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">Find your kind of all-inclusive.</h1>
            <p className="mb-8 text-lg text-white/90 sm:text-xl">
              Tell us your budget and vacation vibe. Get personalized resort recommendations, then book online or let Brendan help.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/quiz?from=home-hero" className={btnPrimary}>Find My Resort</Link>
              <Link href="/concierge-planning?from=home-hero#quote" className={btnSecondary}>Get a Personal Quote</Link>
            </div>
            <p className="mt-4 text-sm text-white/85">Free recommendations. No account needed.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 sm:py-16" aria-labelledby="how">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="how" className="text-2xl font-bold text-gray-900 sm:text-3xl">How it works</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ['Tell us about your trip', 'Budget, who is going, dates, and the vibe you want. About two minutes.'],
              ['Get up to three picks', 'Best overall, best value, and an upgrade when it is worth it, each with the tradeoff and who should skip it.'],
              ['Book your way', 'Check rates and book online with our booking partners, or ask Brendan to quote it for you.'],
            ].map(([t, b], i) => (
              <li key={t} className="rounded-2xl bg-cream-50 p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 font-bold text-white">{i + 1}</span>
                <h3 className="mt-3 text-lg font-bold text-gray-900">{t}</h3>
                <p className="mt-1 text-gray-700">{b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Priorities */}
      <section className="bg-gray-50 py-12 sm:py-16" aria-labelledby="priorities">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="priorities" className="text-2xl font-bold text-gray-900 sm:text-3xl">What makes it your kind of vacation?</h2>
          <p className="mt-2 text-gray-700">Pick your top two in the quiz and we rank resorts around them.</p>
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {PRIORITIES.map((p) => (
              <li key={p.title}>
                <Link href="/quiz?from=home-priorities" className="block h-full rounded-2xl bg-white p-5 ring-1 ring-gray-200 transition hover:ring-brand-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-300">
                  <span aria-hidden="true" className="text-2xl">{p.icon}</span>
                  <span className="mt-2 block font-bold text-gray-900">{p.title}</span>
                  <span className="mt-1 block text-sm text-gray-700">{p.body}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Known destination */}
      <section className="py-12 sm:py-16" aria-labelledby="destinations">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="destinations" className="text-2xl font-bold text-gray-900 sm:text-3xl">Already know where you are going?</h2>
          <p className="mt-2 text-gray-700">Jump straight to resort picks for your destination.</p>
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {DESTINATIONS.map((d) => (
              <li key={d.slug} className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="text-lg font-bold text-gray-900">{d.name}</h3>
                <p className="text-sm text-gray-600">{resortsForDestination(d.slug).length} resorts researched</p>
                <div className="mt-4 flex flex-col gap-2">
                  <Link href={`/quiz?destination=${d.slug}&from=home-destinations`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-4 font-bold text-white hover:bg-brand-800">
                    Find my {d.name.split(' ')[0]} resort
                  </Link>
                  {d.guide && <Link href={d.guide} className="min-h-11 py-2 text-center text-sm font-semibold text-brand-800 underline">Read the guide</Link>}
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-gray-700">
            Heading to{' '}
            {QUOTE_ONLY.map((d, i) => (
              <span key={d.slug}>
                {i > 0 && (i === QUOTE_ONLY.length - 1 ? ', or ' : ', ')}
                <Link href={d.guide} className="font-semibold text-brand-800 underline">{d.name}</Link>
              </span>
            ))}
            ? Resort matching there is coming soon.{' '}
            <Link href="/concierge-planning?from=home-destinations#quote" className="font-bold text-brand-800 underline">Brendan can quote it now</Link>.
          </p>
        </div>
      </section>

      {/* Brendan */}
      <section className="bg-forest py-12 text-white sm:py-16" aria-labelledby="brendan">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 id="brendan" className="text-2xl font-bold sm:text-3xl">Booking help from a real person</h2>
          <p className="mt-4 text-lg text-white/90">
            I&apos;m Brendan O&apos;Brien, VacationPro&apos;s founder. I book trips as an independent travel advisor with Fora. Send me the
            resort you are considering and I&apos;ll personally check rates, room options and available offers, then help you book.
          </p>
          <p className="mt-3 text-white/80">Requesting a quote is free and does not commit you to anything.</p>
          <Link href="/concierge-planning?from=home-brendan#quote" className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-white px-6 font-bold text-forest hover:bg-brand-50">
            Get a Quote from Brendan
          </Link>
        </div>
      </section>

      {/* Guides and comparisons */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Guides and comparisons" subtitle="Resort breakdowns and destination guides." viewAllHref="/blog" viewAllText="All guides" />
          <ul className="mb-8 grid gap-3 md:grid-cols-3">
            {COMPARISONS.map((c) => (
              <li key={c.ids}>
                <Link href={`/compare?ids=${c.ids}`} className="block h-full rounded-2xl border border-gray-200 bg-white p-5 font-semibold text-gray-900 hover:border-brand-700">
                  <span className="block text-xs font-bold uppercase tracking-wide text-brand-800">Compare</span>
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
          {recentPosts.length > 0 && (
            <div className="grid gap-6 md:grid-cols-3">
              {recentPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
          <p className="mt-6 text-sm">
            <Link href="/resorts" className="font-bold text-brand-800 underline">Browse every resort we have researched</Link>
          </p>
        </div>
      </section>

      {/* Deals, as a supporting discovery option */}
      {featuredDeals.length > 0 && (
        <section className="bg-cream-50 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Current deals</h2>
                <p className="mt-1 text-gray-600">Dated offers we found worth a look.</p>
              </div>
              <Link href="/deals" className="shrink-0 text-sm font-semibold text-brand-800 hover:text-brand-700">All deals</Link>
            </div>
            <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
              {featuredDeals.slice(0, 3).map((deal) => (
                <div key={deal.id} className="w-[78vw] shrink-0 snap-start sm:w-auto">
                  <DealCard deal={deal} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <NewsletterSignup variant="hero" />
        </div>
      </section>
    </>
  );
}
