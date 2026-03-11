import groq from 'groq';

// ============================================================
// Shared projections — flatten Sanity fields to match TypeScript types
// ============================================================

const dealProjection = groq`{
  "id": _id,
  title,
  "slug": slug.current,
  shortDescription,
  fullDescription,
  heroImage,
  galleryImages,
  destination,
  destinationSlug,
  region,
  country,
  category,
  categorySlug,
  provider,
  affiliateLink,
  ctaText,
  price,
  originalPrice,
  savingsAmount,
  savingsPercent,
  duration,
  travelDates,
  bookingWindow,
  whatsIncluded,
  tags,
  featured,
  expiresAt,
  disclaimer,
  editorialNotes,
  isTimeshare,
  isFamilyFriendly,
  isAdultsOnly,
  isLuxury,
  isBudget,
  seoTitle,
  metaDescription,
  faq
}`;

const categoryProjection = groq`{
  "id": _id,
  name,
  "slug": slug.current,
  description,
  shortDescription,
  icon,
  heroImage,
  dealCount,
  seoTitle,
  metaDescription
}`;

const destinationProjection = groq`{
  "id": _id,
  name,
  "slug": slug.current,
  country,
  region,
  heroImage,
  description,
  shortDescription,
  dealCount,
  categories,
  faq,
  seoTitle,
  metaDescription
}`;

const blogPostProjection = groq`{
  "id": _id,
  title,
  "slug": slug.current,
  excerpt,
  image,
  category,
  author,
  date,
  readTime
}`;

// ============================================================
// DEAL QUERIES
// ============================================================

export const dealBySlugQuery = groq`
  *[_type == "deal" && categorySlug == $categorySlug && slug.current == $dealSlug][0] ${dealProjection}
`;

export const dealsByCategoryQuery = groq`
  *[_type == "deal" && categorySlug == $categorySlug] | order(_createdAt desc) ${dealProjection}
`;

export const dealsByDestinationQuery = groq`
  *[_type == "deal" && destinationSlug == $destinationSlug] | order(_createdAt desc) ${dealProjection}
`;

export const featuredDealsQuery = groq`
  *[_type == "deal" && featured == true] | order(_createdAt desc) ${dealProjection}
`;

export const allDealsQuery = groq`
  *[_type == "deal"] | order(_createdAt desc) ${dealProjection}
`;

export const recentDealsQuery = groq`
  *[_type == "deal"] | order(_createdAt desc) [0...$count] ${dealProjection}
`;

export const timeshareDealsQuery = groq`
  *[_type == "deal" && isTimeshare == true] | order(_createdAt desc) ${dealProjection}
`;

export const relatedDealsQuery = groq`
  *[_type == "deal" && _id != $dealId && (categorySlug == $categorySlug || destinationSlug == $destinationSlug)] | order(_createdAt desc) [0...3] ${dealProjection}
`;

export const allDealParamsQuery = groq`
  *[_type == "deal"] { "category": categorySlug, "slug": slug.current }
`;

// ============================================================
// CATEGORY QUERIES
// ============================================================

export const categoryBySlugQuery = groq`
  *[_type == "category" && slug.current == $slug][0] ${categoryProjection}
`;

export const allCategoriesQuery = groq`
  *[_type == "category"] | order(name asc) ${categoryProjection}
`;

export const allCategoryParamsQuery = groq`
  *[_type == "category"] { "category": slug.current }
`;

// ============================================================
// DESTINATION QUERIES
// ============================================================

export const destinationBySlugQuery = groq`
  *[_type == "destination" && slug.current == $slug][0] ${destinationProjection}
`;

export const allDestinationsQuery = groq`
  *[_type == "destination"] | order(name asc) ${destinationProjection}
`;

export const allDestinationParamsQuery = groq`
  *[_type == "destination"] { "slug": slug.current }
`;

// ============================================================
// BLOG POST QUERIES
// ============================================================

export const allBlogPostsQuery = groq`
  *[_type == "blogPost" && (brand == "vacationpro" || !defined(brand))] | order(date desc) ${blogPostProjection}
`;

export const recentBlogPostsQuery = groq`
  *[_type == "blogPost" && (brand == "vacationpro" || !defined(brand))] | order(date desc) [0...$count] ${blogPostProjection}
`;
