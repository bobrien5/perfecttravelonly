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
} from './queries';
import type { Destination, Category, BlogPost, FullBlogPost } from '@/types';

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
