import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'VacationPro — The Best Vacation Package Deals in One Place',
    template: '%s | VacationPro',
  },
  description:
    'Discover all-inclusive escapes, flight + hotel bundles, cruise offers, luxury deals, and limited-time vacation packages. The best vacation deals — all in one place.',
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
    title: 'VacationPro — The Best Vacation Package Deals in One Place',
    description:
      'Discover all-inclusive escapes, flight + hotel bundles, cruise offers, luxury deals, and limited-time vacation packages.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VacationPro — The Best Vacation Package Deals in One Place',
    description:
      'Discover all-inclusive escapes, flight + hotel bundles, cruise offers, luxury deals, and limited-time vacation packages.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
