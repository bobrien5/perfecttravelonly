import { MetadataRoute } from 'next';
import {
  getAllDealParams,
  getAllCategoryParams,
  getAllDestinationParams,
  getAllBlogPostParams,
} from '@/sanity/lib/fetch';

const SITE_URL = 'https://www.vacationpro.co';

// Refresh the sitemap hourly so new deals and blog posts get picked up.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/blog',
    '/newsletter',
    '/webinar',
    '/partner',
    '/concierge-planning',
    '/quote',
    '/legal/privacy',
    '/legal/terms',
    '/legal/disclaimer',
    '/legal/affiliate-disclosure',
  ];

  // Pull live slugs from Sanity. Fail soft so a CMS hiccup never breaks the sitemap.
  const [deals, categories, destinations, posts] = await Promise.all([
    getAllDealParams().catch(() => []),
    getAllCategoryParams().catch(() => []),
    getAllDestinationParams().catch(() => []),
    getAllBlogPostParams().catch(() => []),
  ]);

  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of staticRoutes) {
    entries.push({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: path === '' ? 'daily' : 'weekly',
      priority: path === '' ? 1 : 0.6,
    });
  }

  for (const c of categories) {
    entries.push({
      url: `${SITE_URL}/deals/${c.category}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    });
  }

  for (const d of deals) {
    entries.push({
      url: `${SITE_URL}/deals/${d.category}/${d.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  for (const dest of destinations) {
    entries.push({
      url: `${SITE_URL}/destinations/${dest.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  for (const p of posts) {
    entries.push({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  return entries;
}
