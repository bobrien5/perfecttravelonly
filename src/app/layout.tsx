import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
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
    <html lang="en" className={`${inter.variable} ${playfair.variable} overflow-x-hidden`}>
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
