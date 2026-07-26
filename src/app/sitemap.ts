import type { MetadataRoute } from 'next';
import { getAllBlogPosts, getAllDestinations } from '@/sanity/lib/fetch';

const BASE_URL = 'https://www.vacationpro.co';

// Public, indexable routes. Deliberately excludes /go (affiliate redirects),
// /studio, /admin, and the concierge thank-you page.
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/blog', priority: 0.9, changeFrequency: 'daily' },
  { path: '/quote', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/concierge-planning', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.5, changeFrequency: 'yearly' },
  { path: '/contact', priority: 0.5, changeFrequency: 'yearly' },
  { path: '/newsletter', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/partner', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/webinar', priority: 0.4, changeFrequency: 'monthly' },
  { path: '/links', priority: 0.3, changeFrequency: 'monthly' },
  { path: '/legal/privacy', priority: 0.1, changeFrequency: 'yearly' },
  { path: '/legal/terms', priority: 0.1, changeFrequency: 'yearly' },
  { path: '/legal/disclaimer', priority: 0.1, changeFrequency: 'yearly' },
  { path: '/legal/affiliate-disclosure', priority: 0.1, changeFrequency: 'yearly' },
];

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(r => ({
    url: `${BASE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Sanity can be unconfigured or down. A partial sitemap beats a 500.
  const [posts, destinations] = await Promise.all([
    getAllBlogPosts().catch(() => []),
    getAllDestinations().catch(() => []),
  ]);

  const postEntries: MetadataRoute.Sitemap = posts
    .filter(p => p.slug)
    .map(p => ({
      url: `${BASE_URL}/blog/${p.slug}`,
      lastModified: p.date ? new Date(p.date) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));

  const destinationEntries: MetadataRoute.Sitemap = destinations
    .filter(d => d.slug)
    .map(d => ({
      url: `${BASE_URL}/destinations/${d.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  return [...staticEntries, ...postEntries, ...destinationEntries];
}
