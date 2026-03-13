import { client, isSanityConfigured } from './client';
import {
  dealBySlugQuery,
  dealsByCategoryQuery,
  dealsByDestinationQuery,
  featuredDealsQuery,
  allDealsQuery,
  recentDealsQuery,
  timeshareDealsQuery,
  relatedDealsQuery,
  allDealParamsQuery,
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
} from './queries';
import type { Deal, Destination, Category, BlogPost, FullBlogPost } from '@/types';

// Static data fallbacks (used when Sanity is not yet configured)
import * as staticDeals from '@/data/deals';
import * as staticDestinations from '@/data/destinations';
import * as staticCategories from '@/data/categories';
import * as staticBlogPosts from '@/data/blog-posts';

// ============================================================
// DEAL FUNCTIONS
// ============================================================

export async function getDealBySlug(categorySlug: string, dealSlug: string): Promise<Deal | null> {
  if (!isSanityConfigured) return staticDeals.getDealBySlug(categorySlug, dealSlug) || null;
  return client.fetch<Deal | null>(dealBySlugQuery, { categorySlug, dealSlug });
}

export async function getDealsByCategory(categorySlug: string): Promise<Deal[]> {
  if (!isSanityConfigured) return staticDeals.getDealsByCategory(categorySlug);
  return client.fetch<Deal[]>(dealsByCategoryQuery, { categorySlug });
}

export async function getDealsByDestination(destinationSlug: string): Promise<Deal[]> {
  if (!isSanityConfigured) return staticDeals.getDealsByDestination(destinationSlug);
  return client.fetch<Deal[]>(dealsByDestinationQuery, { destinationSlug });
}

export async function getFeaturedDeals(): Promise<Deal[]> {
  if (!isSanityConfigured) return staticDeals.getFeaturedDeals();
  return client.fetch<Deal[]>(featuredDealsQuery);
}

export async function getAllDeals(): Promise<Deal[]> {
  if (!isSanityConfigured) return staticDeals.deals;
  return client.fetch<Deal[]>(allDealsQuery);
}

export async function getRecentDeals(count: number): Promise<Deal[]> {
  if (!isSanityConfigured) return staticDeals.getRecentDeals(count);
  return client.fetch<Deal[]>(recentDealsQuery, { count });
}

export async function getTimeshareDeals(): Promise<Deal[]> {
  if (!isSanityConfigured) return staticDeals.deals.filter(d => d.isTimeshare);
  return client.fetch<Deal[]>(timeshareDealsQuery);
}

export async function getRelatedDeals(dealId: string, categorySlug: string, destinationSlug: string): Promise<Deal[]> {
  if (!isSanityConfigured) {
    return staticDeals.deals
      .filter(d => d.id !== dealId && (d.categorySlug === categorySlug || d.destinationSlug === destinationSlug))
      .slice(0, 3);
  }
  return client.fetch<Deal[]>(relatedDealsQuery, { dealId, categorySlug, destinationSlug });
}

export async function getAllDealParams(): Promise<{ category: string; slug: string }[]> {
  if (!isSanityConfigured) return staticDeals.deals.map(d => ({ category: d.categorySlug, slug: d.slug }));
  return client.fetch(allDealParamsQuery);
}

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
