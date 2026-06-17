import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import NewsletterSignup from '@/components/ui/NewsletterSignup';

export const metadata: Metadata = {
  title: 'VacationPro · Start Here',
  description:
    'Exclusive vacation guides, the $99 concierge trip planning service, and the best all-inclusive deals from VacationPro.',
  alternates: { canonical: '/links' },
  openGraph: {
    title: 'VacationPro · Start Here',
    description:
      'Exclusive guides, $99 concierge planning, and the best all-inclusive deals.',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
};

const utm = (campaign: string) =>
  `utm_source=links_page&utm_medium=cta&utm_campaign=${campaign}`;

interface LinkCardProps {
  href: string;
  external?: boolean;
  emoji: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeTone?: 'green' | 'amber' | 'navy';
}

function LinkCard({ href, external, emoji, title, subtitle, badge, badgeTone = 'green' }: LinkCardProps) {
  const badgeClasses = {
    green: 'bg-brand-500 text-white',
    amber: 'bg-amber-400 text-amber-950',
    navy: 'bg-slate-800 text-white',
  }[badgeTone];

  const inner = (
    <div className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-brand-400 hover:shadow-md active:scale-[0.99] sm:p-5">
      <div
        aria-hidden
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-2xl sm:h-16 sm:w-16 sm:text-3xl"
      >
        {emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-base font-bold text-gray-900 sm:text-lg">{title}</h3>
          {badge && (
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeClasses}`}>
              {badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-sm text-gray-600">{subtitle}</p>
      </div>
      <svg
        aria-hidden
        className="h-5 w-5 shrink-0 text-gray-300 transition-colors group-hover:text-brand-500"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M7.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L10.586 10 7.293 6.707a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block">
      {inner}
    </a>
  ) : (
    <Link href={href} className="block">
      {inner}
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2 pt-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
      {children}
    </p>
  );
}

export default function LinksPage() {
  return (
    <main className="min-h-screen bg-cream-50 px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-xl space-y-7">
        {/* Hero */}
        <header className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-brand-500 shadow-md sm:h-24 sm:w-24">
            <Image src="/logo-white.svg" alt="VacationPro" width={56} height={56} className="h-14 w-14" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            VacationPro
          </h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">
            All-inclusive deals, exclusive resort guides, and concierge trip planning.
          </p>
        </header>

        {/* Email opt-in */}
        <section className="rounded-2xl border border-brand-200 bg-white p-5 shadow-sm">
          <NewsletterSignup
            variant="inline"
            heading="Get weekly all-inclusive deals"
            subheading="Free. Join 5,000+ travelers. Unsubscribe anytime."
            utmCampaign="links_page_optin"
          />
        </section>

        {/* Exclusive Guides */}
        <section className="space-y-3">
          <SectionLabel>Exclusive Guides · $5.99</SectionLabel>
          <LinkCard
            external
            href={`https://www.perfecttravelonly.com/products/aruba-beach-getaway-guide?${utm('guide_aruba')}`}
            emoji="🏝️"
            title="Hilton Aruba Beach Getaway"
            subtitle="5 nights on Palm Beach for under $3,000"
            badge="$5.99"
            badgeTone="green"
          />
          <LinkCard
            external
            href={`https://www.perfecttravelonly.com/products/excellence-punta-cana-guide?${utm('guide_punta_cana')}`}
            emoji="🌴"
            title="Excellence Punta Cana"
            subtitle="Adults-only, 5 nights all-in for under $2,100"
            badge="$5.99"
            badgeTone="green"
          />
          <LinkCard
            external
            href={`https://www.perfecttravelonly.com/products/sandals-negril-jamaica-guide?${utm('guide_jamaica')}`}
            emoji="🌅"
            title="Sandals Negril Jamaica"
            subtitle="Couples-only, 5 nights on Seven Mile Beach"
            badge="$5.99"
            badgeTone="green"
          />
        </section>

        {/* Concierge */}
        <section className="space-y-3">
          <SectionLabel>Plan it for me</SectionLabel>
          <LinkCard
            href={`/concierge-planning?${utm('concierge')}`}
            emoji="🧳"
            title="Concierge Trip Planning"
            subtitle="$99. Real research, real flights, real advisor time."
            badge="Most popular"
            badgeTone="amber"
          />
        </section>

        {/* Amazon storefront */}
        <section className="space-y-3">
          <SectionLabel>Shop my picks</SectionLabel>
          <LinkCard
            external
            href="https://amzn.to/4owVGZ7"
            emoji="🧳"
            title="My Amazon storefront"
            subtitle="Travel essentials I actually pack and recommend"
            badge="Amazon"
            badgeTone="navy"
          />
        </section>

        {/* Free reads */}
        <section className="space-y-3">
          <SectionLabel>Free reads</SectionLabel>
          <LinkCard
            href={`/blog/overwater-bungalows-caribbean?${utm('blog_overwater')}`}
            emoji="🏖️"
            title="Overwater Bungalows in the Caribbean"
            subtitle="6 resorts where they actually exist"
          />
          <LinkCard
            href={`/blog/all-inclusive-caribbean-vacation-packages?${utm('blog_caribbean_ai')}`}
            emoji="✈️"
            title="All-Inclusive Caribbean Packages"
            subtitle="Real prices and the cheap booking windows"
          />
          <LinkCard
            href={`/blog?${utm('blog_index')}`}
            emoji="📰"
            title="More on the blog"
            subtitle="Guides, deals, and destination tips"
          />
        </section>

        {/* Browse */}
        <section className="space-y-3">
          <SectionLabel>Browse</SectionLabel>
          <LinkCard
            href={`/deals/all-inclusive?${utm('deals_ai')}`}
            emoji="💸"
            title="All-Inclusive Deals"
            subtitle="The latest vetted packages"
          />
          <LinkCard
            href={`/destinations/aruba?${utm('dest_aruba')}`}
            emoji="🌊"
            title="Destinations"
            subtitle="Aruba, Punta Cana, Jamaica, Cabo, and more"
          />
        </section>

        {/* Social */}
        <section className="space-y-3 pb-2">
          <SectionLabel>Follow</SectionLabel>
          <div className="grid grid-cols-3 gap-3">
            <a
              href="https://www.instagram.com/vacationpro.co"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 rounded-xl border border-gray-200 bg-white p-3 text-xs font-semibold text-gray-700 transition-colors hover:border-brand-400"
            >
              <span aria-hidden className="text-xl">
                📷
              </span>
              Instagram
            </a>
            <a
              href="https://www.tiktok.com/@vacationpro.co"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 rounded-xl border border-gray-200 bg-white p-3 text-xs font-semibold text-gray-700 transition-colors hover:border-brand-400"
            >
              <span aria-hidden className="text-xl">
                🎵
              </span>
              TikTok
            </a>
            <a
              href="https://www.facebook.com/vacationpro.co"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 rounded-xl border border-gray-200 bg-white p-3 text-xs font-semibold text-gray-700 transition-colors hover:border-brand-400"
            >
              <span aria-hidden className="text-xl">
                👍
              </span>
              Facebook
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
