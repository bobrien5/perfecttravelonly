/**
 * Unwraps Partnerize (prf.hn) affiliate links in blog bodies back to their raw
 * Expedia destination URL, so Stay22's LMA script auto-monetizes them instead.
 *
 * A prf.hn link looks like:
 *   https://prf.hn/click/camref:1101l474Rp/destination:https://www.expedia.com/Foo.h123.Hotel-Information
 * and we rewrite the href to just the destination URL.
 *
 * Dry-run by default. Pass --write to apply.
 *   node scripts/unwrap-partnerize-links.mjs
 *   node scripts/unwrap-partnerize-links.mjs --write
 */
import { createClient } from "@sanity/client";
import { readFileSync } from "fs";

const WRITE = process.argv.includes("--write");
const ENVTXT = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const env = Object.fromEntries(
  ENVTXT.split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    })
);
const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2026-03-09",
  useCdn: false,
  token: env.SANITY_API_WRITE_TOKEN,
});

const PRF_RE = /^https?:\/\/prf\.hn\/click\/camref:[^/]+\/destination:(.+)$/;

function unwrap(href) {
  const m = href.match(PRF_RE);
  if (!m) return null;
  let dest = m[1];
  if (/%3A|%2F/i.test(dest)) {
    try {
      dest = decodeURIComponent(dest);
    } catch {
      return null;
    }
  }
  return dest;
}

async function main() {
  const posts = await client.fetch(
    `*[_type=="blogPost" && defined(body)]{_id,"slug":slug.current,body}`
  );
  let changedPosts = 0;
  let changedLinks = 0;
  let unparseable = 0;
  const hosts = new Set();

  for (const p of posts) {
    let touched = 0;
    const body = p.body.map((b) => {
      if (!Array.isArray(b.markDefs) || b.markDefs.length === 0) return b;
      const markDefs = b.markDefs.map((md) => {
        if (md._type !== "link" || !md.href) return md;
        const raw = unwrap(md.href);
        if (!raw) return md;
        let host;
        try {
          host = new URL(raw).host;
        } catch {
          unparseable++;
          return md;
        }
        hosts.add(host);
        touched++;
        return { ...md, href: raw };
      });
      return { ...b, markDefs };
    });

    if (touched > 0) {
      changedPosts++;
      changedLinks += touched;
      console.log(`${WRITE ? "PATCH" : "would unwrap"} ${String(touched).padStart(2)}  ${p.slug}`);
      if (WRITE) await client.patch(p._id).set({ body }).commit();
    }
  }

  console.log(`\n${WRITE ? "Unwrapped" : "Dry run:"} ${changedLinks} links across ${changedPosts} posts.`);
  console.log(`Destination hosts seen: ${[...hosts].join(", ") || "(none)"}`);
  if (unparseable > 0) {
    console.log(`WARNING: ${unparseable} prf.hn link(s) had an unparseable destination and were left untouched.`);
  }
  const nonExpedia = [...hosts].filter((h) => !/(^|\.)expedia\.com$/.test(h));
  if (nonExpedia.length > 0) {
    console.log(`WARNING: non-Expedia destination host(s) found: ${nonExpedia.join(", ")}`);
  }
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
