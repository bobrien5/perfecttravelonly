import type { SanityImageSource } from '@sanity/image-url';

/**
 * A curated vacation package shown on /deals.
 *
 * Mirrors the Sanity `deal` document, minus the fields the front end never
 * reads. Two things are deliberately absent:
 *
 * - `isTimeshare`, because every query filters it out. The flag exists only so
 *   the purged Tristar-era deals stay excluded if any are ever restored.
 * - `provider` is typed but unused in the UI. Public pages show "Travel
 *   Partner" rather than naming a booking partner.
 */
export interface Deal {
  id: string;
  title: string;
  slug: string;

  shortDescription?: string;
  fullDescription?: string;

  heroImage?: string;
  heroImageAsset?: SanityImageSource | null;
  galleryImages?: string[];

  destination: string;
  destinationSlug: string;
  country?: string;
  region?: string;

  /**
   * Ambiguous by design in the source data: some deals price per person and
   * others per room, and the distinction lives in `disclaimer`. Always render
   * the disclaimer alongside the price.
   */
  price: number;
  originalPrice?: number;
  savingsAmount?: number;
  savingsPercent?: number;

  /** Display string such as "3 nights". Not a number. */
  duration?: string;
  travelDates?: string;
  bookingWindow?: string;
  /** ISO date. Deals at or past this are filtered out of every listing. */
  expiresAt?: string;

  whatsIncluded?: string[];
  disclaimer?: string;
  /** The editorial "why we picked it" line. */
  editorialNotes?: string;
  faq?: { question: string; answer: string }[];

  category?: string;
  categorySlug?: string;

  featured?: boolean;
  isFamilyFriendly?: boolean;
  isAdultsOnly?: boolean;
  isLuxury?: boolean;
  isBudget?: boolean;
  /** Bookable through the advisor practice rather than an affiliate link. */
  isAdvisorPackage?: boolean;

  affiliateLink?: string;
  ctaText?: string;
  provider?: string;
  tags?: string[];

  seoTitle?: string;
  metaDescription?: string;
}

/** The filter facets offered on /deals, derived from the deal flags. */
export type DealFacet =
  | 'all'
  | 'family'
  | 'adults-only'
  | 'luxury'
  | 'budget'
  | 'featured';

export const DEAL_FACETS: { key: DealFacet; label: string }[] = [
  { key: 'all', label: 'All deals' },
  { key: 'featured', label: 'VacationPro Picks' },
  { key: 'luxury', label: 'Luxury' },
  { key: 'budget', label: 'Under $1,500' },
  { key: 'family', label: 'Family' },
  { key: 'adults-only', label: 'Adults only' },
];

export function dealMatchesFacet(deal: Deal, facet: DealFacet): boolean {
  switch (facet) {
    case 'all': return true;
    case 'featured': return !!deal.featured;
    case 'luxury': return !!deal.isLuxury;
    case 'budget': return !!deal.isBudget || deal.price < 1500;
    case 'family': return !!deal.isFamilyFriendly;
    case 'adults-only': return !!deal.isAdultsOnly;
  }
}
