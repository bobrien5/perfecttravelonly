import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  alternates: {
    types: {
      'application/rss+xml': 'https://vacationpro.co/api/rss',
    },
  },
  keywords: [
    'vacation deals',
    'all-inclusive packages',
    'travel deals',
    'flight hotel packages',
    'cruise deals',
    'beach vacations',
    'luxury travel',
    'vacation packages',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'VacationPro',
    title: 'VacationPro: The Best Vacation Package Deals in One Place',
    description:
      'Discover all-inclusive escapes, flight and hotel bundles, cruise offers, luxury deals, and limited-time vacation packages.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VacationPro: The Best Vacation Package Deals in One Place',
    description:
      'Discover all-inclusive escapes, flight + hotel bundles, cruise offers, luxury deals, and limited-time vacation packages.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
