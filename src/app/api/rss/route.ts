import { NextResponse } from 'next/server';
import { getAllDeals } from '@/sanity/lib/fetch';
import type { Deal } from '@/types';

const SITE_URL = 'https://vacationpro.co';

function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildDealDescription(deal: Deal): string {
  const parts: string[] = [];

  if (deal.destination) parts.push(`Destination: ${deal.destination}`);
  if (deal.price) parts.push(`From $${deal.price}`);
  if (deal.originalPrice && deal.savingsPercent) {
    parts.push(`Save ${deal.savingsPercent}% (was $${deal.originalPrice})`);
  }
  if (deal.duration) parts.push(`Duration: ${deal.duration}`);
  if (deal.travelDates) parts.push(`Travel Dates: ${deal.travelDates}`);
  if (deal.shortDescription) parts.push(deal.shortDescription);

  return parts.join(' | ');
}

function buildRssXml(deals: Deal[]): string {
  const now = new Date().toUTCString();

  const items = deals.map((deal) => {
    const link = `${SITE_URL}/deals/${deal.categorySlug}/${deal.slug}`;
    const description = buildDealDescription(deal);

    return `    <item>
      <title>${escapeXml(deal.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(description)}</description>
      <category>${escapeXml(deal.category)}</category>
    </item>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>VacationPro: Latest Vacation Deals</title>
    <link>${SITE_URL}</link>
    <description>The best vacation package deals updated weekly. All-inclusive escapes, flight and hotel bundles, cruise offers, and more.</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/api/rss" rel="self" type="application/rss+xml" />
${items.join('\n')}
  </channel>
</rss>`;
}

export async function GET() {
  try {
    const deals = await getAllDeals();
    const xml = buildRssXml(deals);

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('RSS feed error:', error);
    return NextResponse.json({ error: 'Failed to generate RSS feed' }, { status: 500 });
  }
}
