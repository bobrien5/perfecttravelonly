export interface Destination {
  id: string;
  name: string;
  slug: string;
  country: string;
  region: string;
  heroImage: string;
  description: string;
  shortDescription: string;
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

export interface PortableTextBlock {
  _type: string;
  _key?: string;
  [key: string]: unknown;
}

export interface FullBlogPost extends BlogPost {
  brand: 'allinclusivehq' | 'vacationpro';
  body?: PortableTextBlock[];
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
