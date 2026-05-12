/**
 * Push approved blog post drafts from Outbox into Sanity as `status: draft`.
 *
 * Usage:
 *   npx tsx vacationpro/scripts/publish-blog-drafts.ts <YYYY-MM-DD>
 *
 * Requires SANITY_API_WRITE_TOKEN in vacationpro/.env.local with create + update permissions.
 *
 * Approval signal: `approved: true` in the markdown frontmatter. Drafts without this flag are skipped.
 *
 * Posts are created with status='draft'. Brendan still needs to hit Publish in Sanity Studio.
 */

// Run with: node --env-file=vacationpro/.env.local --import tsx vacationpro/scripts/publish-blog-drafts.ts <date>
import { createClient } from '@sanity/client';
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-03-09';
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID');
  process.exit(1);
}
if (!token) {
  console.error('Missing SANITY_API_WRITE_TOKEN. Add a Sanity API token with editor or admin permissions to vacationpro/.env.local.');
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

const dateArg = process.argv[2];
if (!dateArg) {
  console.error('Usage: tsx publish-blog-drafts.ts <YYYY-MM-DD>');
  process.exit(1);
}

// Outbox lives one level up from the vacationpro repo root.
// Allow override via DRAFTS_ROOT env var for flexibility.
const outboxBase =
  process.env.DRAFTS_ROOT ||
  join(process.cwd(), '..', 'Outbox', 'Deliverables', 'vacationpro-blog-drafts');
const draftsDir = join(outboxBase, dateArg);
if (!existsSync(draftsDir)) {
  console.error(`No drafts directory at ${draftsDir}`);
  process.exit(1);
}

type Frontmatter = {
  title: string;
  seoTitle?: string;
  metaDescription?: string;
  slug: string;
  publishDate?: string;
  primaryKeyword?: string;
  supportingKeywords?: string[];
  excerpt?: string;
  approved?: boolean;
  heroImagePrompt?: string;
};

function parseFrontmatter(text: string): { fm: Frontmatter; body: string } {
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error('No frontmatter');
  const yaml = m[1];
  const body = m[2];
  const fm: Record<string, unknown> = {};
  let currentList: string | null = null;
  for (const line of yaml.split('\n')) {
    if (currentList && line.startsWith('  - ')) {
      (fm[currentList] as string[]).push(line.slice(4).trim());
      continue;
    }
    currentList = null;
    const kv = line.match(/^([a-zA-Z]+):\s*(.*)$/);
    if (!kv) continue;
    const [, k, v] = kv;
    if (v === '') {
      fm[k] = [];
      currentList = k;
    } else if (v === 'true') fm[k] = true;
    else if (v === 'false') fm[k] = false;
    else if (v.startsWith('[') && v.endsWith(']'))
      fm[k] = v.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
    else fm[k] = v.replace(/^["']|["']$/g, '');
  }
  return { fm: fm as Frontmatter, body };
}

// Markdown → Portable Text (minimal: H2, H3, paragraph, bullet list, bold, italic, links)
type Span = { _type: 'span'; _key: string; text: string; marks: string[] };
type MarkDef = { _type: 'link'; _key: string; href: string };
type Block = {
  _type: 'block';
  _key: string;
  style: string;
  listItem?: 'bullet' | 'number';
  level?: number;
  markDefs: MarkDef[];
  children: Span[];
};

let keyCounter = 0;
const k = () => `b${++keyCounter}`;

function parseInline(text: string): { children: Span[]; markDefs: MarkDef[] } {
  const markDefs: MarkDef[] = [];
  const children: Span[] = [];
  // tokenize for [text](url), **bold**, *italic*
  const tokenRegex = /(\[[^\]]+\]\([^)]+\))|(\*\*[^*]+\*\*)|(\*[^*]+\*)/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  const pushSpan = (t: string, marks: string[] = []) => {
    if (!t) return;
    children.push({ _type: 'span', _key: k(), text: t, marks });
  };
  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIdx) pushSpan(text.slice(lastIdx, match.index));
    if (match[1]) {
      // link
      const lm = match[1].match(/\[([^\]]+)\]\(([^)]+)\)/)!;
      const linkKey = k();
      markDefs.push({ _type: 'link', _key: linkKey, href: lm[2] });
      pushSpan(lm[1], [linkKey]);
    } else if (match[2]) {
      pushSpan(match[2].slice(2, -2), ['strong']);
    } else if (match[3]) {
      pushSpan(match[3].slice(1, -1), ['em']);
    }
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < text.length) pushSpan(text.slice(lastIdx));
  return { children, markDefs };
}

function markdownToBlocks(md: string): Block[] {
  const blocks: Block[] = [];
  const lines = md.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') { i++; continue; }
    if (line.startsWith('# ')) {
      // skip top-level H1 since title is in frontmatter
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      const { children, markDefs } = parseInline(line.slice(3).trim());
      blocks.push({ _type: 'block', _key: k(), style: 'h2', markDefs, children });
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      const { children, markDefs } = parseInline(line.slice(4).trim());
      blocks.push({ _type: 'block', _key: k(), style: 'h3', markDefs, children });
      i++;
      continue;
    }
    if (line.match(/^[-*]\s/)) {
      while (i < lines.length && lines[i].match(/^[-*]\s/)) {
        const { children, markDefs } = parseInline(lines[i].replace(/^[-*]\s/, ''));
        blocks.push({ _type: 'block', _key: k(), style: 'normal', listItem: 'bullet', level: 1, markDefs, children });
        i++;
      }
      continue;
    }
    if (line.match(/^\d+\.\s/)) {
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        const { children, markDefs } = parseInline(lines[i].replace(/^\d+\.\s/, ''));
        blocks.push({ _type: 'block', _key: k(), style: 'normal', listItem: 'number', level: 1, markDefs, children });
        i++;
      }
      continue;
    }
    // paragraph: gather lines until blank or new structural marker
    const para: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].match(/^[-*]\s/) &&
      !lines[i].match(/^\d+\.\s/)
    ) {
      para.push(lines[i]);
      i++;
    }
    const { children, markDefs } = parseInline(para.join(' '));
    blocks.push({ _type: 'block', _key: k(), style: 'normal', markDefs, children });
  }
  return blocks;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const files = readdirSync(draftsDir).filter(f => f.endsWith('.md') && f !== '_manifest.md');
console.log(`Found ${files.length} draft files in ${draftsDir}`);

const results: Array<{ file: string; action: string; sanityId?: string; reason?: string }> = [];

(async () => {
  for (const file of files) {
    const text = readFileSync(join(draftsDir, file), 'utf-8');
    let parsed;
    try {
      parsed = parseFrontmatter(text);
    } catch (e) {
      results.push({ file, action: 'skipped', reason: 'no frontmatter' });
      continue;
    }
    const { fm, body } = parsed;
    if (!fm.approved) {
      results.push({ file, action: 'skipped', reason: 'not approved (approved: true missing)' });
      continue;
    }
    const slug = fm.slug || slugify(fm.title);
    // Check for existing post with this slug
    const existing = await client.fetch<{ _id: string } | null>(
      `*[_type == "blogPost" && slug.current == $slug][0]{ _id }`,
      { slug }
    );
    if (existing) {
      results.push({ file, action: 'skipped', reason: `slug "${slug}" already exists in Sanity (${existing._id})` });
      continue;
    }
    keyCounter = 0;
    const blocks = markdownToBlocks(body);
    const doc = {
      _type: 'blogPost',
      brand: 'vacationpro',
      title: fm.title,
      slug: { _type: 'slug', current: slug },
      status: 'draft',
      excerpt: fm.excerpt || '',
      body: blocks,
      seoTitle: fm.seoTitle || fm.title,
      metaDescription: fm.metaDescription || fm.excerpt || '',
      focusKeyphrase: fm.primaryKeyword || '',
      author: 'VacationPro Editorial',
      publishedAt: fm.publishDate ? new Date(fm.publishDate).toISOString() : null,
    };
    const created = await client.create(doc);
    results.push({ file, action: 'created', sanityId: created._id });
    console.log(`  created ${slug} → ${created._id}`);
  }

  // Write a publish report alongside the manifest
  const reportPath = join(draftsDir, '_publish_report.md');
  const lines: string[] = [
    `# VacationPro Blog Draft Publish Report`,
    ``,
    `Date: ${dateArg}`,
    `Sanity dataset: ${dataset}`,
    `Total drafts: ${files.length}`,
    `Created: ${results.filter(r => r.action === 'created').length}`,
    `Skipped: ${results.filter(r => r.action === 'skipped').length}`,
    ``,
    `## Results`,
    ``,
  ];
  for (const r of results) {
    lines.push(`- **${r.file}** — ${r.action}${r.sanityId ? ` (${r.sanityId})` : ''}${r.reason ? `: ${r.reason}` : ''}`);
  }
  lines.push('');
  lines.push(`Open Sanity Studio at http://localhost:3000/studio (local) or your deployed Studio URL to review and publish.`);
  writeFileSync(reportPath, lines.join('\n'));
  console.log(`\nReport: ${reportPath}`);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
