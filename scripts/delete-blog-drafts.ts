/**
 * Delete blog post drafts in Sanity by document ID.
 * Use only for re-publishing after content updates. Status='draft' only.
 *
 * Usage: node --env-file=.env.local --import tsx scripts/delete-blog-drafts.ts <id1> <id2> ...
 */
import { createClient } from '@sanity/client';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-03-09';
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN');
  process.exit(1);
}

const ids = process.argv.slice(2);
if (ids.length === 0) {
  console.error('Usage: delete-blog-drafts.ts <id1> <id2> ...');
  process.exit(1);
}

async function main() {
  const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });
  for (const id of ids) {
    const doc = await client.fetch<{ _id: string; status?: string; _type?: string } | null>(
      '*[_id==$id][0]{ _id, status, _type }', { id }
    );
    if (!doc) { console.log(`  not found: ${id}`); continue; }
    if (doc._type !== 'blogPost') { console.log(`  skip ${id}: type=${doc._type}`); continue; }
    if (doc.status === 'published') { console.log(`  skip ${id}: status=published`); continue; }
    await client.delete(id);
    console.log(`  deleted: ${id} (status=${doc.status})`);
  }
  console.log('done');
}
main().catch(e => { console.error(e); process.exit(1); });
