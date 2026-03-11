import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
