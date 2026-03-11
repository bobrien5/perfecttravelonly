export interface Deal {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  heroImage: string;
  galleryImages: string[];
  destination: string;
  destinationSlug: string;
  region: string;
  country: string;
  category: string;
  categorySlug: string;
  provider: string;
  affiliateLink: string;
  ctaText: string;
  price: number;
  originalPrice: number;
  savingsAmount: number;
  savingsPercent: number;
  duration: string;
  travelDates: string;
  bookingWindow: string;
  whatsIncluded: string[];
  tags: string[];
  featured: boolean;
  expiresAt: string;
  disclaimer: string;
  editorialNotes: string;
  isTimeshare: boolean;
  isFamilyFriendly: boolean;
  isAdultsOnly: boolean;
  isLuxury: boolean;
  isBudget: boolean;
  seoTitle: string;
  metaDescription: string;
  faq: { question: string; answer: string }[];
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  country: string;
  region: string;
  heroImage: string;
  description: string;
  shortDescription: string;
  dealCount: number;
  categories: string[];
  faq: { question: string; answer: string }[];
  seoTitle: string;
  metaDescription: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  icon: string;
  heroImage: string;
  dealCount: number;
  seoTitle: string;
  metaDescription: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
}

export interface FullBlogPost extends BlogPost {
  brand: 'allinclusivehq' | 'vacationpro';
  body?: unknown[];
  bodyHtml?: string;
  featuredImageUrl?: string;
  blogCategory?: { name: string; slug: string; wpCategoryId?: number };
  blogTags?: { name: string; slug: string; wpTagId?: number }[];
  publishedAt?: string;
  status?: 'draft' | 'published';
  seoTitle?: string;
  metaDescription?: string;
  focusKeyphrase?: string;
  wpPostId?: number;
  wpSyncStatus?: 'pending' | 'synced' | 'error';
  wpLastSyncedAt?: string;
  wpPermalink?: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  brand: string;
  description?: string;
  wpCategoryId?: number;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  brand: string;
  wpTagId?: number;
}

export interface NewsletterFormData {
  email: string;
  firstName?: string;
}
