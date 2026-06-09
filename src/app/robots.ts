import { MetadataRoute } from 'next';

const SITE_URL = 'https://www.vacationpro.co';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Keep crawlers out of the admin app, the Sanity Studio, and API routes.
      disallow: ['/admin', '/studio', '/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
