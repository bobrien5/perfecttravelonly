/**
 * One-off repair: the 2026-09-14 blog batch was published before table support
 * existed in the markdown->Portable Text converter, so posts with pipe tables
 * got the raw "| Header | Header |" text dumped into paragraph blocks. This
 * re-parses each affected draft's original markdown (unchanged on disk) with
 * the now-fixed shared parser and patches the live Sanity document's body.
 *
 * Run with: node --env-file=.env.local --import tsx scripts/repair-table-posts.ts
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';
import { join } from 'path';
import { markdownToBlocks } from './lib/markdown-to-portable-text';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-03-09';
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN');
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

const draftsDir = join(process.cwd(), '..', 'Outbox', 'Deliverables', 'vacationpro-blog-drafts', '2026-09-14');

const TARGETS: Array<{ slug: string; file: string }> = [
  { slug: 'destination-wedding-all-inclusive-resorts', file: 'destination-wedding-all-inclusive-resorts.md' },
  { slug: 'excellence-riviera-cancun-review', file: 'excellence-riviera-cancun-review.md' },
  { slug: 'sandals-vs-beaches-resorts', file: 'sandals-vs-beaches-resorts.md' },
  { slug: 'black-friday-all-inclusive-deals', file: 'black-friday-all-inclusive-deals.md' },
];

function parseBody(text: string): string {
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error('No frontmatter');
  return m[2];
}

(async () => {
  for (const t of TARGETS) {
    const existing = await client.fetch<{ _id: string } | null>(
      `*[_type == "blogPost" && slug.current == $slug][0]{ _id }`,
      { slug: t.slug }
    );
    if (!existing) {
      console.log(`SKIP ${t.slug}: not found in Sanity`);
      continue;
    }
    const text = readFileSync(join(draftsDir, t.file), 'utf-8');
    const body = parseBody(text);
    const blocks = markdownToBlocks(body);
    const tableCount = blocks.filter((b) => b._type === 'table').length;
    await client.patch(existing._id).set({ body: blocks }).commit();
    console.log(`REPAIRED ${t.slug} (${existing._id}), ${blocks.length} blocks, ${tableCount} table(s)`);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
