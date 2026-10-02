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

// Bio-link traffic is tagged so it can be separated from organic and ad traffic
// in analytics. NOTE FOR BRENDAN: utm_source is hard-coded to instagram per the
// brief, but this page is also the TikTok bio link, and TikTok is the larger
// audience. See the note in the handover: either duplicate this page or switch
// utm_source to a neutral value so TikTok traffic is not mislabelled.
const UTM = 'utm_source=instagram&utm_medium=bio&utm_campaign=links-page';

type Block = {
  href: string;
  label: string;
  description: string;
  primary?: boolean;
};

// All four destinations are existing, verified routes on vacationpro.co, so
// they are wired directly rather than left as placeholders.
const BLOCKS: Block[] = [
  {
    href: `/deals?${UTM}`,
    label: "See This Week's Deals",
    description: 'The freshest vacation packages and price drops, updated weekly.',
    primary: true,
  },
  {
    href: `/quiz?${UTM}`,
    label: 'Take the 2-Minute Vacation Quiz',
    description: 'Answer 6 questions, get matched to the trips that fit you best.',
  },
  {
    href: `/concierge-planning?${UTM}`,
    label: 'Book a Free Trip Planning Call',
    description: 'I will plan your trip personally. No booking fees, ever.',
  },
  {
    href: `/newsletter?${UTM}`,
    label: 'Get the Weekly Deals Email',
    description: 'One email a week with the best deals before they sell out. Join 5,500+ travelers.',
  },
];

export default function LinksPage() {
  return (
    <main className="min-h-screen bg-cream-50 px-4 py-8">
      <div className="mx-auto w-full max-w-[480px]">
        {/* Same lockup the site header uses: square mark plus the text wordmark.
            logo.svg is a 375x375 icon, so it must not be stretched to a bar. */}
        <div className="flex items-center justify-center gap-2">
          <Image src="/logo.svg" alt="" width={36} height={36} priority className="h-9 w-9" />
          <span className="text-xl font-bold text-gray-900">
            Vacation<span className="text-brand-600">Pro</span>
          </span>
        </div>

        <h1 className="mt-6 text-center text-[1.75rem] font-extrabold leading-tight text-forest sm:text-3xl">
          This Week&apos;s Vacation Deals Worth Booking
        </h1>
        <p className="mt-3 text-center text-[0.9375rem] leading-relaxed text-gray-600">
          New packages and price drops handpicked each week. Free to browse, no catch.
        </p>

        <nav aria-label="VacationPro links" className="mt-6 flex flex-col gap-3">
          {BLOCKS.map((b) => (
            <Link
              key={b.label}
              href={b.href}
              prefetch={false}
              className={
                b.primary
                  ? 'block min-h-[56px] rounded-2xl bg-brand-600 px-5 py-4 text-center shadow-sm transition active:scale-[0.99] hover:bg-brand-700'
                  : 'block min-h-[56px] rounded-2xl border border-gray-200 bg-white px-5 py-4 text-center shadow-sm transition active:scale-[0.99] hover:border-brand-400'
              }
            >
              <span
                className={
                  b.primary
                    ? 'block text-base font-bold text-white sm:text-lg'
                    : 'block text-base font-bold text-forest sm:text-lg'
                }
              >
                {b.label}
              </span>
              <span
                className={
                  b.primary
                    ? 'mt-1 block text-[0.8125rem] leading-snug text-white/85'
                    : 'mt-1 block text-[0.8125rem] leading-snug text-gray-600'
                }
              >
                {b.description}
              </span>
            </Link>
          ))}
        </nav>

        <p className="mt-10 text-center text-xs text-gray-500">&copy; VacationPro</p>
      </div>
    </main>
  );
}
