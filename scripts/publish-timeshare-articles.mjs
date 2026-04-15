#!/usr/bin/env node
/**
 * Publish 12 timeshare/vacation club blog posts to Sanity CMS
 * Reads markdown files from Marketing/Outbox/articles/, converts to HTML,
 * and publishes via Sanity's createOrReplace mutation.
 *
 * Run: node scripts/publish-timeshare-articles.mjs
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = join(__dirname, '..', 'Marketing', 'Outbox', 'articles');

const PROJECT_ID = 't5091igf';
const DATASET = 'production';
const API_VERSION = '2026-03-09';
const TOKEN = process.env.SANITY_API_READ_TOKEN || 'skamz62SJ0znF6uCS2wWojEcPlLBbC0kmNTODBfVw9KQCBDrpI5Oz1CGTRAqZBq1uztsSaGfmb78QXqbV1d7Cevq4EoqZzng5FSA1Wtknov0goSNDhfpqrOeno1OtnnHIB0IqvrkZYMYAmQBhNgJfr1eRvWI9Cw0qjJb9K8JeUX4Du1BHDye';

// ============================================================
// Article definitions
// ============================================================

const articles = [
  {
    file: 'what-is-a-timeshare.md',
    slug: 'what-is-a-timeshare',
    title: 'What Is a Timeshare? Everything You Need to Know Before Buying',
    excerpt: 'A complete guide to how timeshares work, what they cost, the different ownership models, and whether a timeshare makes sense for your travel style.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1600&h=900&fit=crop',
    readTime: '9 min read',
    seoTitle: 'What Is a Timeshare? How It Works, Costs & Types Explained (2026)',
    metaDescription: 'Learn what a timeshare is, how it works, what it costs, and whether it makes sense for you. Covers deeded vs. right-to-use, points systems, and alternatives.',
    focusKeyphrase: 'what is a timeshare',
  },
  {
    file: 'vacation-ownership.md',
    slug: 'vacation-ownership',
    title: 'Vacation Ownership in 2026: Your Complete Guide to Timeshares, Vacation Clubs, and Fractional Ownership',
    excerpt: 'Everything you need to know about vacation ownership in 2026 — from traditional timeshares and vacation clubs to fractional ownership and travel memberships.',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&h=900&fit=crop',
    readTime: '11 min read',
    seoTitle: 'Vacation Ownership Guide 2026: Timeshares, Clubs & Fractional Ownership',
    metaDescription: 'Compare every type of vacation ownership: timeshares, vacation clubs, fractional ownership, and travel memberships. Costs, pros, cons, and 10-year analysis.',
    focusKeyphrase: 'vacation ownership',
  },
  {
    file: 'are-timeshares-worth-it.md',
    slug: 'are-timeshares-worth-it',
    title: 'Are Timeshares Worth It in 2026? A Brutally Honest Breakdown',
    excerpt: 'A data-driven analysis of when timeshares are worth it and when they are not, with real cost comparisons and the maintenance fee math most buyers skip.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=900&fit=crop',
    readTime: '10 min read',
    seoTitle: 'Are Timeshares Worth It? Honest Cost Breakdown for 2026',
    metaDescription: 'Are timeshares worth it? We break down the real math, compare developer vs. resale pricing, and show when a timeshare makes sense — and when it doesn\'t.',
    focusKeyphrase: 'are timeshares worth it',
  },
  {
    file: 'vacation-club-membership.md',
    slug: 'vacation-club-membership',
    title: 'Vacation Club Memberships Explained: Cost, Benefits, and the Best Options for 2026',
    excerpt: 'Everything you need to know about vacation club memberships — how they work, what they cost, the top clubs for 2026, and how they compare to timeshares.',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&h=900&fit=crop',
    readTime: '9 min read',
    seoTitle: 'Vacation Club Membership Guide: Cost, Benefits & Best Clubs (2026)',
    metaDescription: 'Vacation club memberships explained: how they work, what they cost, the best clubs for 2026, and how they compare to traditional timeshares.',
    focusKeyphrase: 'vacation club membership',
  },
  {
    file: 'timeshare-cost.md',
    slug: 'timeshare-cost',
    title: 'How Much Does a Timeshare Really Cost? The Full Breakdown for 2026',
    excerpt: 'The true cost of timeshare ownership broken down: purchase price, maintenance fees, financing, hidden fees, and a full 10-year cost calculation by brand.',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1600&h=900&fit=crop',
    readTime: '10 min read',
    seoTitle: 'How Much Does a Timeshare Cost? Full 2026 Price Breakdown',
    metaDescription: 'How much does a timeshare really cost? We break down purchase prices, maintenance fees, financing, hidden costs, and the full 10-year total by brand.',
    focusKeyphrase: 'timeshare cost',
  },
  {
    file: 'timeshare-pros-and-cons.md',
    slug: 'timeshare-pros-and-cons',
    title: 'Timeshare Pros and Cons: The Honest Truth From Both Sides',
    excerpt: 'An honest look at the pros and cons of timeshare ownership — from villa-style accommodations and loyalty perks to rising fees and brutal resale values.',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1600&h=900&fit=crop',
    readTime: '9 min read',
    seoTitle: 'Timeshare Pros and Cons: The Honest Truth (2026 Guide)',
    metaDescription: 'The real pros and cons of timeshare ownership. We cover benefits like villa-style stays and points flexibility, plus downsides like rising fees and poor resale.',
    focusKeyphrase: 'timeshare pros and cons',
  },
  {
    file: 'best-timeshare-companies.md',
    slug: 'best-timeshare-companies',
    title: 'The 7 Best Timeshare Companies in 2026 (Ranked and Compared)',
    excerpt: 'We ranked and compared the 7 best timeshare companies in 2026 across resort quality, pricing, flexibility, resale value, and owner satisfaction.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&h=900&fit=crop',
    readTime: '11 min read',
    seoTitle: 'Best Timeshare Companies 2026: Top 7 Ranked & Compared',
    metaDescription: 'The 7 best timeshare companies in 2026, ranked by resort quality, pricing, flexibility, and resale value. Marriott, Hilton, Wyndham, Disney, and more.',
    focusKeyphrase: 'best timeshare companies',
  },
  {
    file: 'best-vacation-clubs.md',
    slug: 'best-vacation-clubs',
    title: 'The Best Vacation Clubs in 2026: Honest Reviews and Comparisons',
    excerpt: 'We reviewed every major vacation club — from Inspirato and Marriott to Capital Vacations and Pacaso — to help you find the right fit for how you travel.',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600&h=900&fit=crop',
    readTime: '12 min read',
    seoTitle: 'Best Vacation Clubs 2026: Reviews, Costs & Comparisons',
    metaDescription: 'The best vacation clubs in 2026, honestly reviewed. Compare Inspirato, Marriott, Hilton, Wyndham, Capital Vacations, Pacaso, and Arrived side by side.',
    focusKeyphrase: 'best vacation clubs',
  },
  {
    file: 'is-a-timeshare-a-good-investment.md',
    slug: 'is-a-timeshare-a-good-investment',
    title: 'Is a Timeshare a Good Investment? Here\'s What the Numbers Actually Say',
    excerpt: 'A data-driven look at whether timeshares are good investments. Spoiler: they are not — but there are real vacation investments that actually build wealth.',
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1600&h=900&fit=crop',
    readTime: '10 min read',
    seoTitle: 'Is a Timeshare a Good Investment? The Real Numbers (2026)',
    metaDescription: 'Is a timeshare a good investment? We analyze resale data, depreciation, maintenance fees, and the real ROI math. Plus alternatives that actually build wealth.',
    focusKeyphrase: 'is a timeshare a good investment',
  },
  {
    file: 'timeshare-vs-vacation-club.md',
    slug: 'timeshare-vs-vacation-club',
    title: 'Timeshare vs. Vacation Club: What\'s the Difference (and Which Is Better for You)?',
    excerpt: 'A clear comparison of timeshares vs. vacation clubs — ownership structure, costs, flexibility, exit options, and how to tell if a "club" is really a timeshare.',
    image: 'https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?w=1600&h=900&fit=crop',
    readTime: '8 min read',
    seoTitle: 'Timeshare vs. Vacation Club: Key Differences Explained (2026)',
    metaDescription: 'Timeshare vs. vacation club: what\'s the difference? Compare ownership, costs, flexibility, and exit options to find the right fit for your travel style.',
    focusKeyphrase: 'timeshare vs vacation club',
  },
  {
    file: 'what-is-a-vacation-club.md',
    slug: 'what-is-a-vacation-club',
    title: 'What Is a Vacation Club? How It Works, What It Costs, and Whether It\'s Worth It',
    excerpt: 'A complete guide to vacation clubs — how they work, the four types, what they cost, how they compare to timeshares, and how to spot a legitimate one.',
    image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1600&h=900&fit=crop',
    readTime: '11 min read',
    seoTitle: 'What Is a Vacation Club? Complete Guide to Types, Costs & More',
    metaDescription: 'What is a vacation club? Learn how vacation clubs work, the 4 types, what they cost, how they compare to timeshares, and how to spot red flags before joining.',
    focusKeyphrase: 'what is a vacation club',
  },
  {
    file: 'are-vacation-clubs-worth-it.md',
    slug: 'are-vacation-clubs-worth-it',
    title: 'Are Vacation Clubs Worth It? What to Know Before You Join',
    excerpt: 'A practical guide to whether vacation clubs are worth the cost. Includes the break-even math, warning signs of bad clubs, and smarter alternatives.',
    image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1600&h=900&fit=crop',
    readTime: '11 min read',
    seoTitle: 'Are Vacation Clubs Worth It? Honest Analysis for 2026',
    metaDescription: 'Are vacation clubs worth it? We run the break-even math, cover warning signs of bad clubs, and compare alternatives so you can decide with confidence.',
    focusKeyphrase: 'are vacation clubs worth it',
  },
];

// ============================================================
// Internal link mapping for [LINK: ...] placeholders
// ============================================================

const linkMap = [
  // Exact and variant matches — order matters (longer/more specific first)
  { patterns: ['What Is a Timeshare? Everything You Need to Know Before You Buy', 'What Is a Timeshare? Everything You Need to Know Before Buying', 'What Is a Timeshare'], href: '/blog/what-is-a-timeshare' },
  { patterns: ['Vacation Ownership Guide', 'Vacation Ownership'], href: '/blog/vacation-ownership' },
  { patterns: ['Are Timeshares Worth It'], href: '/blog/are-timeshares-worth-it' },
  { patterns: ['Vacation Club Memberships Explained', 'Vacation Club Membership', 'Vacation Club Memberships', 'Vacation Clubs'], href: '/blog/vacation-club-membership' },
  { patterns: ['How Much Does a Timeshare Really Cost', 'How Much Does a Timeshare Really Cost?', 'How Much Does a Timeshare Cost', 'Timeshare Cost'], href: '/blog/timeshare-cost' },
  { patterns: ['Timeshare Pros and Cons'], href: '/blog/timeshare-pros-and-cons' },
  { patterns: ['Best Timeshare Companies'], href: '/blog/best-timeshare-companies' },
  { patterns: ['Best Vacation Clubs Compared', 'Best Vacation Clubs and Timeshare Companies', 'Best Vacation Clubs 2026', 'Best Vacation Clubs'], href: '/blog/best-vacation-clubs' },
  { patterns: ['Is a Timeshare a Good Investment', 'Is a Timeshare a Good Investment?'], href: '/blog/is-a-timeshare-a-good-investment' },
  { patterns: ["Timeshare vs. Vacation Club: What's the Difference (and Which Is Better for You)?", 'Timeshare vs. Vacation Club', 'Timeshare vs Vacation Club'], href: '/blog/timeshare-vs-vacation-club' },
  { patterns: ["What Is a Vacation Club? How It Works, What It Costs, and Whether It's Worth It", 'What Is a Vacation Club'], href: '/blog/what-is-a-vacation-club' },
  { patterns: ['Are Vacation Clubs Worth It? What to Know Before You Join', 'Are Vacation Clubs Worth It'], href: '/blog/are-vacation-clubs-worth-it' },
  { patterns: ['Best All-Inclusive Resorts for 2026', 'Best All-Inclusive Resorts', 'All-Inclusive Vacation Deals', 'All-Inclusive Packages', 'All-Inclusive Resort'], href: '/deals/all-inclusive' },
  { patterns: ['Timeshare Maintenance Fees'], href: '/blog/timeshare-maintenance-fees' },
  // Catch-all references to deals/newsletter
  { patterns: ['VacationPro Deals', 'VacationPro Newsletter'], href: '/deals' },
  // Specific review links that don't have dedicated pages yet — link to the parent list
  { patterns: ['Disney Vacation Club Review', 'Hilton Grand Vacations Review', 'Inspirato Review', 'Wyndham Vacation Club Review'], href: '/blog/best-vacation-clubs' },
  { patterns: ['Vacation Club Comparison Guide'], href: '/blog/best-vacation-clubs' },
];

/**
 * Replace [LINK: ...] placeholders with <a> tags or plain text
 */
function replaceLinks(html) {
  return html.replace(/\[LINK:\s*([^\]]+)\]/g, (match, linkText) => {
    const trimmed = linkText.trim();
    for (const entry of linkMap) {
      for (const pattern of entry.patterns) {
        if (trimmed.toLowerCase() === pattern.toLowerCase()) {
          return `<a href="${entry.href}">${trimmed}</a>`;
        }
      }
    }
    // No match found — just output the text without a link
    return trimmed;
  });
}

// ============================================================
// Markdown → HTML converter (vanilla, no dependencies)
// ============================================================

function markdownToHtml(md) {
  // Remove the H1 title (first line starting with #)
  let lines = md.split('\n');
  if (lines[0].startsWith('# ')) {
    lines = lines.slice(1);
  }
  let text = lines.join('\n').trim();

  // Remove horizontal rules
  text = text.replace(/^---+\s*$/gm, '');

  // Convert tables
  text = convertTables(text);

  // Convert blockquotes
  text = text.replace(/^>\s?(.*)$/gm, '<blockquote>$1</blockquote>');
  // Merge adjacent blockquotes
  text = text.replace(/<\/blockquote>\n<blockquote>/g, '\n');

  // Convert headers (h2 and h3 only, h1 already removed)
  text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');

  // Convert bold and italic (bold first to avoid conflict)
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Convert links [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Convert unordered lists
  text = convertLists(text);

  // Convert ordered lists
  text = convertOrderedLists(text);

  // Wrap remaining paragraphs
  text = wrapParagraphs(text);

  // Replace [LINK: ...] placeholders
  text = replaceLinks(text);

  // Clean up extra whitespace
  text = text.replace(/\n{3,}/g, '\n\n').trim();

  return text;
}

/**
 * Convert markdown tables to HTML tables
 */
function convertTables(text) {
  const lines = text.split('\n');
  const result = [];
  let i = 0;

  while (i < lines.length) {
    // Detect a table: line with |, next line is separator (|---|)
    if (
      lines[i] &&
      lines[i].includes('|') &&
      i + 1 < lines.length &&
      /^\|?[\s-:|]+\|/.test(lines[i + 1])
    ) {
      // Parse header
      const headerCells = parseTableRow(lines[i]);
      // Skip separator line
      i += 2;

      let tableHtml = '<table>\n<thead>\n<tr>';
      for (const cell of headerCells) {
        tableHtml += `<th>${cell}</th>`;
      }
      tableHtml += '</tr>\n</thead>\n<tbody>';

      // Parse body rows
      while (i < lines.length && lines[i] && lines[i].includes('|')) {
        const cells = parseTableRow(lines[i]);
        tableHtml += '\n<tr>';
        for (const cell of cells) {
          tableHtml += `<td>${cell}</td>`;
        }
        tableHtml += '</tr>';
        i++;
      }

      tableHtml += '\n</tbody>\n</table>';
      result.push(tableHtml);
    } else {
      result.push(lines[i]);
      i++;
    }
  }

  return result.join('\n');
}

function parseTableRow(line) {
  return line
    .split('|')
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
}

/**
 * Convert unordered lists (lines starting with - )
 */
function convertLists(text) {
  const lines = text.split('\n');
  const result = [];
  let inList = false;

  for (const line of lines) {
    const match = line.match(/^- (.+)$/);
    if (match) {
      if (!inList) {
        result.push('<ul>');
        inList = true;
      }
      result.push(`<li>${match[1]}</li>`);
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      result.push(line);
    }
  }
  if (inList) {
    result.push('</ul>');
  }

  return result.join('\n');
}

/**
 * Convert ordered lists (lines starting with 1. 2. etc.)
 */
function convertOrderedLists(text) {
  const lines = text.split('\n');
  const result = [];
  let inList = false;

  for (const line of lines) {
    const match = line.match(/^\d+\.\s+(.+)$/);
    if (match) {
      if (!inList) {
        result.push('<ol>');
        inList = true;
      }
      result.push(`<li>${match[1]}</li>`);
    } else {
      if (inList) {
        result.push('</ol>');
        inList = false;
      }
      result.push(line);
    }
  }
  if (inList) {
    result.push('</ol>');
  }

  return result.join('\n');
}

/**
 * Wrap loose text lines in <p> tags
 */
function wrapParagraphs(text) {
  const lines = text.split('\n');
  const result = [];
  const blockTags = /^<(h[1-6]|ul|ol|li|\/li|\/ul|\/ol|table|\/table|thead|\/thead|tbody|\/tbody|tr|\/tr|th|td|blockquote|\/blockquote|p|\/p)/;

  let paraLines = [];

  function flushPara() {
    if (paraLines.length > 0) {
      const content = paraLines.join(' ').trim();
      if (content) {
        result.push(`<p>${content}</p>`);
      }
      paraLines = [];
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === '') {
      flushPara();
      continue;
    }

    if (blockTags.test(trimmed)) {
      flushPara();
      result.push(trimmed);
      continue;
    }

    paraLines.push(trimmed);
  }

  flushPara();

  return result.join('\n');
}

/**
 * Estimate read time from word count
 */
function estimateReadTime(text) {
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / 225);
  return `${minutes} min read`;
}

// ============================================================
// Build mutations and publish
// ============================================================

async function main() {
  console.log('Reading and converting 12 timeshare articles...\n');

  const baseDate = new Date('2026-04-06T10:00:00Z');
  const mutations = [];

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    const filePath = join(ARTICLES_DIR, article.file);

    let md;
    try {
      md = readFileSync(filePath, 'utf-8');
    } catch (err) {
      console.error(`Failed to read ${article.file}: ${err.message}`);
      continue;
    }

    const bodyHtml = markdownToHtml(md);
    const publishedAt = new Date(baseDate.getTime() + i * 3600000).toISOString();

    const doc = {
      _id: `blog-${article.slug}`,
      _type: 'blogPost',
      brand: 'vacationpro',
      title: article.title,
      slug: { _type: 'slug', current: article.slug },
      status: 'published',
      excerpt: article.excerpt,
      bodyHtml,
      image: article.image,
      author: 'VacationPro Editorial',
      publishedAt,
      readTime: article.readTime,
      seoTitle: article.seoTitle,
      metaDescription: article.metaDescription,
      focusKeyphrase: article.focusKeyphrase,
    };

    mutations.push({ createOrReplace: doc });

    console.log(`  [${i + 1}/12] ${article.title}`);
    console.log(`         slug: ${article.slug}`);
    console.log(`         published: ${publishedAt}`);
    console.log(`         bodyHtml: ${bodyHtml.length} chars\n`);
  }

  if (mutations.length === 0) {
    console.error('No articles were converted. Aborting.');
    process.exit(1);
  }

  console.log(`\nPublishing ${mutations.length} articles to Sanity...\n`);

  const response = await fetch(
    `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ mutations }),
    }
  );

  const result = await response.json();

  if (result.results) {
    console.log(`Successfully published ${result.results.length} blog posts to Sanity.`);
    for (const r of result.results) {
      console.log(`  - ${r.id} (${r.operation})`);
    }
  } else {
    console.error('Error from Sanity:', JSON.stringify(result, null, 2));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
