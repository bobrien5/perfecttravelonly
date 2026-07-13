import groq from 'groq';

// ============================================================
// Shared projections — flatten Sanity fields to match TypeScript types
// ============================================================

const categoryProjection = groq`{
  "id": _id,
  name,
  "slug": slug.current,
  description,
  shortDescription,
  icon,
  heroImage,
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
  "image": coalesce(image, featuredImage.asset->url),
  category,
  author,
  "date": coalesce(publishedAt, date),
  readTime
}`;

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
  *[_type == "blogPost" && (brand == "vacationpro" || !defined(brand))] | order(coalesce(publishedAt, date) desc) ${blogPostProjection}
`;

export const recentBlogPostsQuery = groq`
  *[_type == "blogPost" && (brand == "vacationpro" || !defined(brand))] | order(coalesce(publishedAt, date) desc) [0...$count] ${blogPostProjection}
`;

export const blogPostBySlugQuery = groq`
  *[_type == "blogPost" && slug.current == $slug && (brand == "vacationpro" || !defined(brand))][0] {
    "id": _id,
    title,
    "slug": slug.current,
    excerpt,
    "image": coalesce(image, featuredImage.asset->url),
    category,
    author,
    date,
    readTime,
    body,
    bodyHtml,
    featuredImage,
    "blogCategory": blogCategory->{ name, "slug": slug.current },
    "blogTags": blogTags[]->{ name, "slug": slug.current },
    publishedAt,
    status,
    seoTitle,
    metaDescription,
    brand
  }
`;

export const allBlogPostParamsQuery = groq`
  *[_type == "blogPost" && (brand == "vacationpro" || !defined(brand))] { "slug": slug.current }
`;
