/**
 * fix-literal-links.mjs
 * Repairs blog bodies where markdown links wrapped in bold (**[text](url)**) were
 * stored as LITERAL text spans (marks:["strong"]) instead of real PortableText
 * link marks. Walks every vacationpro blogPost body, finds literal [label](url)
 * inside any span, and splits it into a proper link span (preserving existing
 * marks like strong) with a new markDef.
 *
 * Usage: node scripts/fix-literal-links.mjs         (dry run)
 *        node scripts/fix-literal-links.mjs --write  (patch Sanity)
 */
import { createClient } from "@sanity/client";
import { readFileSync } from "fs";

const WRITE = process.argv.includes("--write");
const ENVTXT = readFileSync("/Users/brendanobrien/Documents/Claude/vacationpro/.env.local", "utf8");
const env = Object.fromEntries(ENVTXT.split("\n").filter(l => l && !l.startsWith("#") && l.includes("=")).map(l => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; }));
const client = createClient({ projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID, dataset: env.NEXT_PUBLIC_SANITY_DATASET || "production", apiVersion: "2026-03-09", useCdn: false, token: env.SANITY_API_WRITE_TOKEN });

const LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^)]+|\/[^)]+)\)/g;
let keyc = 0;
const nk = () => `fx${Date.now().toString(36)}${keyc++}`;

function fixBlock(block) {
  if (block._type !== "block" || !Array.isArray(block.children)) return { block, changed: 0 };
  let changed = 0;
  const markDefs = [...(block.markDefs || [])];
  const children = [];
  for (const ch of block.children) {
    if (ch._type !== "span" || typeof ch.text !== "string" || !ch.text.includes("](")) { children.push(ch); continue; }
    const text = ch.text, marks = ch.marks || [];
    let last = 0, m; LINK_RE.lastIndex = 0; let hit = false;
    while ((m = LINK_RE.exec(text)) !== null) {
      hit = true;
      if (m.index > last) children.push({ _type: "span", _key: nk(), text: text.slice(last, m.index), marks });
      const href = m[2];
      const lk = nk();
      markDefs.push({ _type: "link", _key: lk, href, blank: /^https?:/.test(href) });
      children.push({ _type: "span", _key: nk(), text: m[1], marks: [...marks, lk] });
      last = m.index + m[0].length;
      changed++;
    }
    if (!hit) { children.push(ch); continue; }
    if (last < text.length) children.push({ _type: "span", _key: nk(), text: text.slice(last), marks });
  }
  return { block: { ...block, children, markDefs }, changed };
}

async function main() {
  const posts = await client.fetch(`*[_type=="blogPost" && (brand=="vacationpro" || !defined(brand)) && defined(body)]{_id,"slug":slug.current,body}`);
  let totalFixed = 0, postsChanged = 0;
  for (const p of posts) {
    let changed = 0;
    const newBody = p.body.map(b => { const r = fixBlock(b); changed += r.changed; return r.block; });
    if (changed > 0) {
      postsChanged++; totalFixed += changed;
      console.log(`${WRITE ? "PATCH" : "would fix"} ${String(changed).padStart(2)} links  ${p.slug}`);
      if (WRITE) await client.patch(p._id).set({ body: newBody }).commit();
    }
  }
  console.log(`\n${WRITE ? "Patched" : "Dry run:"} ${totalFixed} links across ${postsChanged} posts (of ${posts.length} scanned).`);
}
main().catch(e => { console.error("FAILED:", e.message); process.exit(1); });
