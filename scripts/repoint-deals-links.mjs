/**
 * Repoints /deals internal links in blog bodies to /destinations after the
 * deals catalog is removed. Dry-run by default; --write applies.
 * Leaves /go affiliate links and external links untouched.
 */
import { createClient } from "@sanity/client";
import { readFileSync } from "fs";

const WRITE = process.argv.includes("--write");
const ENVTXT = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const env = Object.fromEntries(ENVTXT.split("\n").filter(l => l && !l.startsWith("#") && l.includes("=")).map(l => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; }));
const client = createClient({ projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID, dataset: env.NEXT_PUBLIC_SANITY_DATASET || "production", apiVersion: "2026-03-09", useCdn: false, token: env.SANITY_API_WRITE_TOKEN });

function repointHref(href, destSlugs) {
  // /deals/<category>/<slug> or /deals/<category> -> /destinations/<slug> if slug is a known destination, else /destinations
  const parts = href.replace(/^\/deals\/?/, "").split("/").filter(Boolean);
  for (const p of parts) if (destSlugs.has(p)) return `/destinations/${p}`;
  return "/destinations";
}

async function main() {
  const destSlugs = new Set(await client.fetch(`*[_type=="destination"].slug.current`));
  const posts = await client.fetch(`*[_type=="blogPost" && defined(body)]{_id,"slug":slug.current,body}`);
  let changedPosts = 0, changedLinks = 0;
  for (const p of posts) {
    let touched = 0;
    const body = p.body.map(b => {
      if (!Array.isArray(b.markDefs)) return b;
      const markDefs = b.markDefs.map(md => {
        if (md._type === "link" && typeof md.href === "string" && md.href.startsWith("/deals")) {
          touched++; changedLinks++;
          return { ...md, href: repointHref(md.href, destSlugs) };
        }
        return md;
      });
      return { ...b, markDefs };
    });
    if (touched > 0) {
      changedPosts++;
      console.log(`${WRITE ? "PATCH" : "would fix"} ${String(touched).padStart(2)} links  ${p.slug}`);
      if (WRITE) await client.patch(p._id).set({ body }).commit();
    }
  }
  console.log(`\n${WRITE ? "Patched" : "Dry run:"} ${changedLinks} links across ${changedPosts} posts.`);
}
main().catch(e => { console.error("FAILED:", e.message); process.exit(1); });
