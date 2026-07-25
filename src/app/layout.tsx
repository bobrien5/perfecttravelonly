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
    default: 'VacationPro: Tropical Travel Guides + Concierge Booking',
    template: '%s | VacationPro',
  },
  description:
    'Expert guides to the best tropical and all-inclusive trips, plus concierge booking to plan and book your vacation with a real travel advisor.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'VacationPro',
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
        {/* Grow.me (Mediavine) engagement + faves widget */}
        <script
          data-grow-initializer=""
          dangerouslySetInnerHTML={{
            __html: `!(function(){window.growMe||((window.growMe=function(e){window.growMe._.push(e);}),(window.growMe._=[]));var e=document.createElement("script");(e.type="text/javascript"),(e.src="https://faves.grow.me/main.js"),(e.defer=!0),e.setAttribute("data-grow-faves-site-id","U2l0ZTpmMGUxZTFjOS05NTNmLTQzNDItOTAyMi1kNjk4NDMzNjgyMjY=");var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t);})();`,
          }}
        />
        {/* ScriptWrapper tag */}
        <script
          type="text/javascript"
          async
          data-noptimize="1"
          data-cfasync="false"
          src="//scripts.scriptwrapper.com/tags/e826f3a3-1424-4081-9650-1fad60b84735.js"
        />
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
