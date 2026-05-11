import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import MetaPixel, { MetaPixelNoScript } from '@/components/analytics/MetaPixel';
import './globals.css';

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();

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
        {META_PIXEL_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
                fbq('init','${META_PIXEL_ID}');
                fbq('track','PageView');
              `,
            }}
          />
        )}
      </head>
      <body className="antialiased overflow-x-hidden">
        <MetaPixelNoScript />
        <MetaPixel />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
