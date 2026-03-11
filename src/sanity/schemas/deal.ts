/* eslint-disable @typescript-eslint/no-explicit-any */
const deal = {
  name: 'deal',
  title: 'Deal',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'pricing', title: 'Pricing' },
    { name: 'location', title: 'Location' },
    { name: 'flags', title: 'Flags & Tags' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // Content
    { name: 'title', title: 'Title', type: 'string', group: 'content', validation: (r: any) => r.required() },
    { name: 'slug', title: 'Slug', type: 'slug', group: 'content', options: { source: 'title', maxLength: 96 }, validation: (r: any) => r.required() },
    { name: 'shortDescription', title: 'Short Description', type: 'text', group: 'content', rows: 3, validation: (r: any) => r.required() },
    { name: 'fullDescription', title: 'Full Description', type: 'text', group: 'content', rows: 8 },
    { name: 'heroImage', title: 'Hero Image URL', type: 'url', group: 'content', validation: (r: any) => r.required() },
    { name: 'galleryImages', title: 'Gallery Images', type: 'array', group: 'content', of: [{ type: 'url' }] },
    { name: 'provider', title: 'Provider', type: 'string', group: 'content' },
    { name: 'affiliateLink', title: 'Affiliate Link', type: 'url', group: 'content', description: 'The monetization link — where the "Book This Deal" button goes.', validation: (r: any) => r.required().uri({ allowRelative: true, scheme: ['http', 'https'] }) },
    { name: 'ctaText', title: 'CTA Button Text', type: 'string', group: 'content', initialValue: 'View This Deal' },
    { name: 'duration', title: 'Duration', type: 'string', group: 'content' },
    { name: 'travelDates', title: 'Travel Dates', type: 'string', group: 'content' },
    { name: 'bookingWindow', title: 'Booking Window', type: 'string', group: 'content' },
    { name: 'whatsIncluded', title: "What's Included", type: 'array', group: 'content', of: [{ type: 'string' }] },
    { name: 'disclaimer', title: 'Disclaimer', type: 'text', group: 'content', rows: 4 },
    { name: 'editorialNotes', title: 'Editorial Notes', type: 'text', group: 'content', rows: 4 },
    { name: 'faq', title: 'FAQ', type: 'array', group: 'content', of: [{ type: 'object', fields: [{ name: 'question', title: 'Question', type: 'string' }, { name: 'answer', title: 'Answer', type: 'text' }] }] },

    // Pricing
    { name: 'price', title: 'Price', type: 'number', group: 'pricing', validation: (r: any) => r.required().min(0) },
    { name: 'originalPrice', title: 'Original Price', type: 'number', group: 'pricing', validation: (r: any) => r.required().min(0) },
    { name: 'savingsAmount', title: 'Savings Amount', type: 'number', group: 'pricing' },
    { name: 'savingsPercent', title: 'Savings Percent', type: 'number', group: 'pricing' },
    { name: 'expiresAt', title: 'Expires At', type: 'string', group: 'pricing' },

    // Location
    { name: 'destination', title: 'Destination Name', type: 'string', group: 'location', validation: (r: any) => r.required() },
    { name: 'destinationSlug', title: 'Destination Slug', type: 'string', group: 'location', description: 'Must match a destination document slug', validation: (r: any) => r.required() },
    { name: 'region', title: 'Region', type: 'string', group: 'location' },
    { name: 'country', title: 'Country', type: 'string', group: 'location' },
    { name: 'category', title: 'Category Name', type: 'string', group: 'location', validation: (r: any) => r.required() },
    { name: 'categorySlug', title: 'Category Slug', type: 'string', group: 'location', description: 'Must match a category document slug', validation: (r: any) => r.required() },

    // Flags & Tags
    { name: 'featured', title: 'Featured', type: 'boolean', group: 'flags', initialValue: false },
    { name: 'isTimeshare', title: 'Timeshare Preview', type: 'boolean', group: 'flags', initialValue: false },
    { name: 'isFamilyFriendly', title: 'Family-Friendly', type: 'boolean', group: 'flags', initialValue: false },
    { name: 'isAdultsOnly', title: 'Adults-Only', type: 'boolean', group: 'flags', initialValue: false },
    { name: 'isLuxury', title: 'Luxury', type: 'boolean', group: 'flags', initialValue: false },
    { name: 'isBudget', title: 'Budget', type: 'boolean', group: 'flags', initialValue: false },
    { name: 'tags', title: 'Tags', type: 'array', group: 'flags', of: [{ type: 'string' }], options: { layout: 'tags' } },

    // SEO
    { name: 'seoTitle', title: 'SEO Title', type: 'string', group: 'seo' },
    { name: 'metaDescription', title: 'Meta Description', type: 'text', group: 'seo', rows: 2 },
  ],
  preview: {
    select: { title: 'title', subtitle: 'destination' },
  },
  orderings: [
    { title: 'Featured First', name: 'featuredDesc', by: [{ field: 'featured', direction: 'desc' as const }] },
    { title: 'Price Low to High', name: 'priceAsc', by: [{ field: 'price', direction: 'asc' as const }] },
  ],
};
export default deal;
