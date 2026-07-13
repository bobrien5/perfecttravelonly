import { NextResponse } from 'next/server';
import { getAllBlogPosts } from '@/sanity/lib/fetch';
import type { BlogPost } from '@/types';

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

function buildRssXml(posts: BlogPost[]): string {
  const now = new Date().toUTCString();

  const items = posts.map((post) => {
    const link = `${SITE_URL}/blog/${post.slug}`;

    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <category>${escapeXml(post.category)}</category>
    </item>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>VacationPro: Latest Travel Guides</title>
    <link>${SITE_URL}</link>
    <description>Travel guides, destination tips, and vacation planning advice updated weekly.</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/api/rss" rel="self" type="application/rss+xml" />
${items.join('\n')}
  </channel>
</rss>`;
}

export async function GET() {
  try {
    const posts = await getAllBlogPosts();
    const xml = buildRssXml(posts);

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
