#!/usr/bin/env node
/**
 * Publish 2 keyword-targeted blog posts to Sanity CMS
 * Keywords: "vacation ownership" and "vacation clubs"
 * Run: node scripts/publish-keyword-articles-2026-04-16.mjs
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

const articles = [
  {
    file: 'vacation-ownership-guide.md',
    slug: 'vacation-ownership-guide',
    title: 'Vacation Ownership in 2026: How It Works, What It Costs, and Whether It\'s Right for You',
    excerpt: 'A comprehensive guide to vacation ownership — how it works, what it really costs over 20 years, who it\'s best for, and how to evaluate an offer without getting pressured.',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&h=900&fit=crop',
    readTime: '11 min read',
    seoTitle: 'Vacation Ownership Guide 2026: How It Works, Costs & Is It Worth It?',
    metaDescription: 'Everything you need to know about vacation ownership in 2026. How it works, what it costs (upfront + 20-year total), who it\'s best for, and how to evaluate an offer.',
    focusKeyphrase: 'vacation ownership',
  },
  {
    file: 'vacation-clubs-guide.md',
    slug: 'vacation-clubs-guide',
    title: 'What Is a Vacation Club? The Honest Guide to How They Work in 2026',
    excerpt: 'A clear, honest guide to vacation clubs — how they work, what they cost, the best clubs in 2026, and how to tell if a membership is actually worth it.',
    image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1600&h=900&fit=crop',
    readTime: '11 min read',
    seoTitle: 'What Is a Vacation Club? Honest Guide to How They Work (2026)',
    metaDescription: 'What is a vacation club and is it worth it? We cover how vacation clubs work, what they cost, the best clubs in 2026, and red flags to watch for.',
    focusKeyphrase: 'vacation clubs',
  },
];

// ============================================================
// Markdown → HTML converter
// ============================================================

function markdownToHtml(md) {
  let lines = md.split('\n');
  if (lines[0].startsWith('# ')) {
    lines = lines.slice(1);
  }
  let text = lines.join('\n').trim();

  text = text.replace(/^---+\s*$/gm, '');
  text = convertTables(text);
  text = text.replace(/^>\s?(.*)$/gm, '<blockquote>$1</blockquote>');
  text = text.replace(/<\/blockquote>\n<blockquote>/g, '\n');
  text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  text = convertLists(text);
  text = convertOrderedLists(text);
  text = wrapParagraphs(text);
  text = text.replace(/\n{3,}/g, '\n\n').trim();

  return text;
}

function convertTables(text) {
  const lines = text.split('\n');
  const result = [];
  let i = 0;

  while (i < lines.length) {
    if (
      lines[i] &&
      lines[i].includes('|') &&
      i + 1 < lines.length &&
      /^\|?[\s-:|]+\|/.test(lines[i + 1])
    ) {
      const headerCells = parseTableRow(lines[i]);
      i += 2;

      let tableHtml = '<table>\n<thead>\n<tr>';
      for (const cell of headerCells) {
        tableHtml += `<th>${cell}</th>`;
      }
      tableHtml += '</tr>\n</thead>\n<tbody>';

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

// ============================================================
// Build mutations and publish
// ============================================================

async function main() {
  console.log('Reading and converting 2 keyword-targeted articles...\n');

  const baseDate = new Date('2026-04-16T12:00:00Z');
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
      date: '2026-04-16',
      readTime: article.readTime,
      seoTitle: article.seoTitle,
      metaDescription: article.metaDescription,
      focusKeyphrase: article.focusKeyphrase,
    };

    mutations.push({ createOrReplace: doc });

    console.log(`  [${i + 1}/2] ${article.title}`);
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
