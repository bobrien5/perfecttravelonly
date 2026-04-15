/**
 * One-time migration script: uploads static data to Sanity
 *
 * Usage:
 *   1. Set SANITY_PROJECT_ID, SANITY_DATASET, and SANITY_WRITE_TOKEN below
 *   2. Run: npx tsx scripts/migrate-to-sanity.ts
 *
 * Safe to run multiple times — uses createOrReplace (idempotent)
 */

import { createClient } from '@sanity/client';
import { deals } from '../src/data/deals';
import { destinations } from '../src/data/destinations';
import { categories } from '../src/data/categories';
import { blogPosts } from '../src/data/blog-posts';

// ⚠️ FILL THESE IN before running
const PROJECT_ID = process.env.SANITY_PROJECT_ID || 'YOUR_PROJECT_ID';
const DATASET = process.env.SANITY_DATASET || 'production';
const WRITE_TOKEN = process.env.SANITY_WRITE_TOKEN || 'YOUR_WRITE_TOKEN';

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: '2026-03-09',
  token: WRITE_TOKEN,
  useCdn: false,
});

async function migrate() {
  console.log('🚀 Starting VacationPro data migration to Sanity...\n');

  // --- Categories ---
  console.log(`📁 Migrating ${categories.length} categories...`);
  for (const cat of categories) {
    await client.createOrReplace({
      _type: 'category',
      _id: `category-${cat.slug}`,
      name: cat.name,
      slug: { _type: 'slug', current: cat.slug },
      description: cat.description,
      shortDescription: cat.shortDescription,
      icon: cat.icon,
      heroImage: cat.heroImage,
      dealCount: cat.dealCount,
      seoTitle: cat.seoTitle,
      metaDescription: cat.metaDescription,
    });
    console.log(`  ✅ ${cat.name}`);
  }

  // --- Destinations ---
  console.log(`\n🌴 Migrating ${destinations.length} destinations...`);
  for (const dest of destinations) {
    await client.createOrReplace({
      _type: 'destination',
      _id: `destination-${dest.slug}`,
      name: dest.name,
      slug: { _type: 'slug', current: dest.slug },
      country: dest.country,
      region: dest.region,
      heroImage: dest.heroImage,
      description: dest.description,
      shortDescription: dest.shortDescription,
      dealCount: dest.dealCount,
      categories: dest.categories,
      faq: dest.faq,
      seoTitle: dest.seoTitle,
      metaDescription: dest.metaDescription,
    });
    console.log(`  ✅ ${dest.name}`);
  }

  // --- Deals ---
  console.log(`\n💰 Migrating ${deals.length} deals...`);
  for (const deal of deals) {
    await client.createOrReplace({
      _type: 'deal',
      _id: `deal-${deal.slug}`,
      title: deal.title,
      slug: { _type: 'slug', current: deal.slug },
      shortDescription: deal.shortDescription,
      fullDescription: deal.fullDescription,
      heroImage: deal.heroImage,
      galleryImages: deal.galleryImages,
      destination: deal.destination,
      destinationSlug: deal.destinationSlug,
      region: deal.region,
      country: deal.country,
      category: deal.category,
      categorySlug: deal.categorySlug,
      provider: deal.provider,
      affiliateLink: deal.affiliateLink,
      ctaText: deal.ctaText,
      price: deal.price,
      originalPrice: deal.originalPrice,
      savingsAmount: deal.savingsAmount,
      savingsPercent: deal.savingsPercent,
      duration: deal.duration,
      travelDates: deal.travelDates,
      bookingWindow: deal.bookingWindow,
      whatsIncluded: deal.whatsIncluded,
      tags: deal.tags,
      featured: deal.featured,
      expiresAt: deal.expiresAt,
      disclaimer: deal.disclaimer,
      editorialNotes: deal.editorialNotes,
      isTimeshare: deal.isTimeshare,
      isFamilyFriendly: deal.isFamilyFriendly,
      isAdultsOnly: deal.isAdultsOnly,
      isLuxury: deal.isLuxury,
      isBudget: deal.isBudget,
      seoTitle: deal.seoTitle,
      metaDescription: deal.metaDescription,
      faq: deal.faq,
    });
    console.log(`  ✅ ${deal.title}`);
  }

  // --- Blog Posts ---
  console.log(`\n📝 Migrating ${blogPosts.length} blog posts...`);
  for (const post of blogPosts) {
    await client.createOrReplace({
      _type: 'blogPost',
      _id: `blog-${post.slug}`,
      title: post.title,
      slug: { _type: 'slug', current: post.slug },
      excerpt: post.excerpt,
      image: post.image,
      category: post.category,
      author: post.author,
      date: post.date,
      readTime: post.readTime,
    });
    console.log(`  ✅ ${post.title}`);
  }

  console.log('\n✨ Migration complete!');
  console.log(`   ${categories.length} categories`);
  console.log(`   ${destinations.length} destinations`);
  console.log(`   ${deals.length} deals`);
  console.log(`   ${blogPosts.length} blog posts`);
  console.log('\nOpen your Sanity Studio to verify the data.');
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
