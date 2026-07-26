import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.vacationpro.co';

/**
 * robots.txt
 *
 * AI search (ChatGPT, Perplexity, AI Overviews) composes answers from pages it is
 * allowed to crawl. ChatGPT Search runs on Bing's index, so Bingbot access and a
 * declared sitemap are load-bearing, not optional.
 *
 * Every AI crawler below is allowed on purpose. Do not "tidy" them into the wildcard:
 * being explicit is what makes the intent survive a future edit.
 */
export default function robots(): MetadataRoute.Robots {
  const disallow = ['/api/', '/studio/', '/admin/', '/go/'];

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow },

      // Search engines
      { userAgent: 'Googlebot', allow: '/', disallow },
      { userAgent: 'Bingbot', allow: '/', disallow },

      // AI answer engines
      { userAgent: 'GPTBot', allow: '/', disallow },          // OpenAI (ChatGPT)
      { userAgent: 'OAI-SearchBot', allow: '/', disallow },   // OpenAI search crawler
      { userAgent: 'ChatGPT-User', allow: '/', disallow },    // ChatGPT live browsing
      { userAgent: 'Google-Extended', allow: '/', disallow }, // Gemini / AI Overviews
      { userAgent: 'PerplexityBot', allow: '/', disallow },
      { userAgent: 'ClaudeBot', allow: '/', disallow },
      { userAgent: 'anthropic-ai', allow: '/', disallow },
      { userAgent: 'Applebot-Extended', allow: '/', disallow },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
