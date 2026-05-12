import { createClient } from '@sanity/client';
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-03-09',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});
async function main() {
  const deals = await client.fetch<any[]>(
    `*[_type=="deal"]{ "slug": slug.current, categorySlug, title } | order(categorySlug asc, slug asc)`
  );
  console.log(`${deals.length} deals (using direct categorySlug field):`);
  for (const d of deals) console.log(`  /deals/${d.categorySlug}/${d.slug}  —  ${d.title}`);
}
main().catch(e => { console.error(e); process.exit(1); });
