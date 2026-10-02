import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: { absolute: 'VacationPro Deals Links' },
  description:
    "This week's vacation deals, handpicked. Take the quiz, browse packages, or book a free trip planning call.",
  alternates: { canonical: '/links' },
  openGraph: {
    title: 'VacationPro Deals Links',
    description:
      "This week's vacation deals, handpicked. Take the quiz, browse packages, or book a free trip planning call.",
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
};

// Bio-link traffic is tagged so it can be separated from organic and ad traffic.
// NOTE: utm_source is hard-coded to instagram per the brief, but this page is
// also the TikTok bio link and TikTok is the larger audience, so most taps will
// currently report as Instagram. Switch to utm_source=bio, or serve a second
// URL per platform, before measuring against the 1.6% baseline.
const UTM = 'utm_source=instagram&utm_medium=bio&utm_campaign=links-page';

type Block = {
  href: string;
  label: string;
  description: string;
  img: string;
  alt: string;
  primary?: boolean;
};

// All four destinations are existing, verified routes on vacationpro.co.
const BLOCKS: Block[] = [
  {
    href: `/deals?${UTM}`,
    label: "See This Week's Deals",
    description: 'The freshest vacation packages and price drops, updated weekly.',
    img: '/links/deals.jpg',
    alt: 'Turquoise water and white sand at a Caribbean beach resort',
    primary: true,
  },
  {
    href: `/quiz?${UTM}`,
    label: 'Take the 2-Minute Vacation Quiz',
    description: 'Answer 6 questions, get matched to the trips that fit you best.',
    img: '/links/quiz.jpg',
    alt: 'Palm-lined resort pool on the Riviera Maya',
  },
  {
    // Points at /vault, not /concierge-planning: concierge is a Vault member
    // benefit, so sending bio traffic straight to the gated page meant a paywall.
    href: `/vault?${UTM}`,
    label: 'Let Me Plan Your Trip',
    description:
      'Custom vacation packages planned for you personally, included with Vacation Vault. No booking fees, ever.',
    img: '/links/concierge.jpg',
    alt: 'Calm bay and green hills at Montego Bay, Jamaica',
  },
  {
    href: `/newsletter?${UTM}`,
    label: 'Get the Weekly Deals Email',
    description: 'One email a week with the best deals before they sell out. Join 5,500+ travelers.',
    img: '/links/newsletter.jpg',
    alt: 'Sailboats anchored off a quiet Caribbean beach',
  },
];

export default function LinksPage() {
  return (
    <main className="min-h-screen bg-cream-50 px-4 pb-10 pt-6">
      <div className="mx-auto w-full max-w-[480px]">
        {/* Hero: photo carries the headline so the first two link blocks still
            clear the fold on a short phone screen. */}
        <section className="relative overflow-hidden rounded-3xl shadow-sm">
          <Image
            src="/links/hero.jpg"
            alt=""
            width={900}
            height={506}
            priority
            sizes="(max-width: 480px) 100vw, 480px"
            className="h-[220px] w-full object-cover sm:h-[240px]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/55 to-forest/10"
          />
          <div className="absolute inset-0 flex flex-col justify-end p-5">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="" width={24} height={24} className="h-6 w-6" />
              <span className="text-sm font-bold tracking-wide text-white">
                Vacation<span className="text-brand-400">Pro</span>
              </span>
            </div>
            <h1 className="mt-2 text-[1.5rem] font-extrabold leading-tight text-white sm:text-[1.75rem]">
              This Week&apos;s Vacation Deals Worth Booking
            </h1>
          </div>
        </section>

        <p className="mt-4 text-center text-[0.9375rem] leading-relaxed text-gray-600">
          New packages and price drops handpicked each week. Free to browse, no catch.
        </p>

        <nav aria-label="VacationPro links" className="mt-5 flex flex-col gap-3">
          {BLOCKS.map((b) => (
            <Link
              key={b.label}
              href={b.href}
              prefetch={false}
              className={[
                'flex min-h-[56px] items-center gap-3 rounded-2xl p-2.5 shadow-sm transition active:scale-[0.99]',
                b.primary
                  ? 'bg-brand-600 hover:bg-brand-700'
                  : 'border border-gray-200 bg-white hover:border-brand-400',
              ].join(' ')}
            >
              <Image
                src={b.img}
                alt={b.alt}
                width={200}
                height={200}
                sizes="64px"
                className="h-16 w-16 shrink-0 rounded-xl object-cover"
              />
              <span className="min-w-0 flex-1">
                <span
                  className={`block text-[0.9375rem] font-bold leading-tight sm:text-base ${
                    b.primary ? 'text-white' : 'text-forest'
                  }`}
                >
                  {b.label}
                </span>
                <span
                  className={`mt-1 block text-[0.8125rem] leading-snug ${
                    b.primary ? 'text-white/85' : 'text-gray-600'
                  }`}
                >
                  {b.description}
                </span>
              </span>
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                className={`h-4 w-4 shrink-0 ${b.primary ? 'text-white/70' : 'text-gray-400'}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </nav>

        <p className="mt-8 text-center text-xs text-gray-500">&copy; VacationPro</p>
      </div>
    </main>
  );
}
