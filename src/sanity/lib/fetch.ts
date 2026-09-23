import { client, isSanityConfigured } from './client';
import {
  categoryBySlugQuery,
  allCategoriesQuery,
  allCategoryParamsQuery,
  destinationBySlugQuery,
  allDestinationsQuery,
  allDestinationParamsQuery,
  allBlogPostsQuery,
  recentBlogPostsQuery,
  blogPostBySlugQuery,
  allBlogPostParamsQuery,
  resortsByDestinationQuery,
  allDealsQuery,
  featuredDealsQuery,
  dealBySlugQuery,
  allDealParamsQuery,
} from './queries';
import type { Destination, Category, BlogPost, FullBlogPost } from '@/types';
import type { Deal } from '@/types/deal';
import type { ResortAttrs } from '@vacationpro/engine';

// Static data fallbacks (used when Sanity is not yet configured)
import * as staticDestinations from '@/data/destinations';
import * as staticCategories from '@/data/categories';
import * as staticBlogPosts from '@/data/blog-posts';

// ============================================================
// CATEGORY FUNCTIONS
// ============================================================

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  if (!isSanityConfigured) return staticCategories.getCategoryBySlug(slug) || null;
  return client.fetch<Category | null>(categoryBySlugQuery, { slug });
}

export async function getAllCategories(): Promise<Category[]> {
  if (!isSanityConfigured) return staticCategories.categories;
  return client.fetch<Category[]>(allCategoriesQuery);
}

export async function getAllCategoryParams(): Promise<{ category: string }[]> {
  if (!isSanityConfigured) return staticCategories.categories.map(c => ({ category: c.slug }));
  return client.fetch(allCategoryParamsQuery);
}

// ============================================================
// DESTINATION FUNCTIONS
// ============================================================

export async function getDestinationBySlug(slug: string): Promise<Destination | null> {
  if (!isSanityConfigured) return staticDestinations.getDestinationBySlug(slug) || null;
  return client.fetch<Destination | null>(destinationBySlugQuery, { slug });
}

export async function getAllDestinations(): Promise<Destination[]> {
  if (!isSanityConfigured) return staticDestinations.destinations;
  return client.fetch<Destination[]>(allDestinationsQuery);
}

export async function getAllDestinationParams(): Promise<{ slug: string }[]> {
  if (!isSanityConfigured) return staticDestinations.destinations.map(d => ({ slug: d.slug }));
  return client.fetch(allDestinationParamsQuery);
}

// ============================================================
// BLOG POST FUNCTIONS
// ============================================================

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  if (!isSanityConfigured) return staticBlogPosts.blogPosts;
  return client.fetch<BlogPost[]>(allBlogPostsQuery);
}

export async function getRecentBlogPosts(count: number): Promise<BlogPost[]> {
  if (!isSanityConfigured) return staticBlogPosts.blogPosts.slice(0, count);
  return client.fetch<BlogPost[]>(recentBlogPostsQuery, { count });
}

export async function getBlogPostBySlug(slug: string): Promise<FullBlogPost | null> {
  if (!isSanityConfigured) {
    const post = staticBlogPosts.blogPosts.find(p => p.slug === slug);
    return post ? { ...post, brand: 'vacationpro' } : null;
  }
  return client.fetch<FullBlogPost | null>(blogPostBySlugQuery, { slug });
}

export async function getAllBlogPostParams(): Promise<{ slug: string }[]> {
  if (!isSanityConfigured) return staticBlogPosts.blogPosts.map(p => ({ slug: p.slug }));
  return client.fetch(allBlogPostParamsQuery);
}

// ============================================================
// RESORT FUNCTIONS
// ============================================================

/**
 * Raw shape returned by resortsByDestinationQuery: identical to ResortAttrs
 * except vibeScores is still the stringified JSON text field from Sanity.
 */
interface RawResort extends Omit<ResortAttrs, 'vibeScores'> {
  vibeScores: string | null;
}

function parseVibeScores(raw: string | null): ResortAttrs['vibeScores'] {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as ResortAttrs['vibeScores'];
    }
    return {};
  } catch {
    return {};
  }
}

/**
 * Fetches resorts (Task 6 seed) for a destination and parses vibeScores
 * from its stringified-JSON Sanity field into a plain object. Malformed
 * JSON (or Sanity not configured) never throws; it degrades to an empty
 * vibeScores map / an empty resort list respectively so the resort picker
 * page can always fall back to its empty state.
 *
 * A Sanity outage (client.fetch rejecting, e.g. a timeout or 5xx) is caught
 * here too and also degrades to an empty list, so the resort picker page
 * renders its empty state (advisor CTA) instead of 500ing.
 */
export async function getResortsByDestination(destinationSlug: string): Promise<ResortAttrs[]> {
  if (!isSanityConfigured) return [];
  try {
    const raw = await client.fetch<RawResort[]>(resortsByDestinationQuery, { destinationSlug });
    return (raw || []).map((r) => ({ ...r, vibeScores: parseVibeScores(r.vibeScores) }));
  } catch (err) {
    console.error('getResortsByDestination: Sanity fetch error:', err);
    return [];
  }
}

// ============================================================
// DEAL FUNCTIONS
// ============================================================

/**
 * `today` is passed as a parameter rather than computed inside the GROQ query
 * so the expiry boundary is decided by the server rendering the page, not by
 * Sanity's clock, and so tests can pin it.
 */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getAllDeals(): Promise<Deal[]> {
  if (!isSanityConfigured) return [];
  return client.fetch<Deal[]>(allDealsQuery, { today: today() });
}

export async function getFeaturedDeals(): Promise<Deal[]> {
  if (!isSanityConfigured) return [];
  return client.fetch<Deal[]>(featuredDealsQuery, { today: today() });
}

export async function getDealBySlug(slug: string): Promise<Deal | null> {
  if (!isSanityConfigured) return null;
  return client.fetch<Deal | null>(dealBySlugQuery, { slug });
}

export async function getAllDealParams(): Promise<{ slug: string }[]> {
  if (!isSanityConfigured) return [];
  return client.fetch<{ slug: string }[]>(allDealParamsQuery);
}
