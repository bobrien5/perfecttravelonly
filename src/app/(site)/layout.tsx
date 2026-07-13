import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import EmailPopup from '@/components/ui/EmailPopup';

export const metadata: Metadata = {
  alternates: {
    types: {
      'application/rss+xml': 'https://vacationpro.co/api/rss',
    },
  },
  keywords: [
    'tropical travel guides',
    'all-inclusive resort guides',
    'destination guides',
    'travel planning',
    'concierge travel booking',
    'beach vacations',
    'luxury travel',
    'travel advisor',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'VacationPro',
    title: 'VacationPro: Tropical Travel Guides + Concierge Booking',
    description:
      'Expert guides to the best tropical and all-inclusive trips, plus concierge booking to plan and book your vacation with a real travel advisor.',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'VacationPro: Tropical Travel Guides + Concierge Booking',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VacationPro: Tropical Travel Guides + Concierge Booking',
    description:
      'Expert guides to the best tropical and all-inclusive trips, plus concierge booking to plan and book your vacation with a real travel advisor.',
    images: ['/og-default.png'],
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
      <EmailPopup />
    </div>
  );
}
