import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.vacationpro.co'),
  title: {
    default: 'VacationPro: The Best Vacation Package Deals in One Place',
    template: '%s | VacationPro',
  },
  description:
    'Discover all-inclusive escapes, flight and hotel bundles, cruise offers, luxury deals, and limited-time vacation packages. The best vacation deals, all in one place.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'VacationPro',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'VacationPro: The Best Vacation Package Deals in One Place',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-default.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} overflow-x-hidden`}>
      <head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-V8FQNXLJ7D"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-V8FQNXLJ7D');
            `,
          }}
        />
      </head>
      <body className="antialiased overflow-x-hidden">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
