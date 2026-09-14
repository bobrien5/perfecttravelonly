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
import { readFileSync, readdirSync, writeFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';
import { markdownToBlocks } from './lib/markdown-to-portable-text';

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
    const blocks = markdownToBlocks(body);
    const doc: Record<string, unknown> = {
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

    // Attach a hero image if <slug>-hero.png exists next to the draft
    const heroPath = join(draftsDir, `${slug}-hero.png`);
    if (existsSync(heroPath) && statSync(heroPath).size > 10000) {
      const asset = await client.assets.upload('image', readFileSync(heroPath), {
        filename: `${slug}-hero.png`,
      });
      doc.featuredImage = {
        _type: 'image',
        asset: { _type: 'reference', _ref: asset._id },
        alt: fm.title,
      };
      console.log(`  uploaded hero image for ${slug} -> ${asset._id}`);
    }

    const created = await client.create(doc as unknown as { _type: string; [key: string]: unknown });
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
