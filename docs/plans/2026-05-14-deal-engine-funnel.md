# Deal Engine Funnel (Track 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the keyword-to-deal funnel that connects a ManyChat comment keyword to a VacationPro landing page: a deal registry, a resolve endpoint ManyChat calls, the `vacationpro deal` CLI, and a per-keyword landing route.

**Architecture:** A Supabase `deal_keywords` table is the registry (written by the CLI, read at runtime so no redeploy is needed). A thin registry module wraps it, with pure helper logic (keyword normalization, CSV parsing, validation) unit-tested separately. A new `GET /api/manychat/resolve` endpoint looks up a keyword and returns DM copy plus a landing URL. A new `(landing)/d/[keyword]` route renders the existing `ClaimOfferForm` for the resolved deal. The `vacationpro deal` CLI (`add`, `list`, `status`, `sync`) manages the registry.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Supabase (`@supabase/supabase-js`, already installed), `tsx` (already installed) for the CLI, Vitest (added in Task 1) for tests.

**What already exists (do not rebuild):** `/api/ghl/claim-offer` (lead → GHL contact + Tristar pipeline opportunity), `ClaimOfferForm` component, `(landing)/quote/page.tsx`, `src/lib/supabase/client.ts`, `src/lib/ghl/` client. The funnel's lead-capture tail is done; this plan builds the keyword-to-landing-page head.

---

## File Structure

| File | Responsibility |
|---|---|
| `vitest.config.ts` (create) | Vitest config |
| `package.json` (modify) | Add `test` and `deal` scripts, Vitest dev deps |
| `supabase/migrations/0001_deal_keywords.sql` (create) | `deal_keywords` table schema |
| `src/lib/deal-registry/types.ts` (create) | `DealKeyword`, `DealEntryInput` types |
| `src/lib/deal-registry/helpers.ts` (create) | Pure logic: `normalizeKeyword`, `validateDealEntry`, `parseDealSheetCsv` |
| `src/lib/deal-registry/helpers.test.ts` (create) | Unit tests for helpers |
| `src/lib/deal-registry/index.ts` (create) | DB-backed CRUD: `findByKeyword`, `listActive`, `addKeyword`, `keywordExists` |
| `src/app/api/manychat/resolve/route.ts` (create) | `GET ?keyword=X` → DM copy + landing URL |
| `src/app/api/manychat/resolve/route.test.ts` (create) | Endpoint logic tests |
| `src/app/(landing)/d/[keyword]/page.tsx` (create) | Per-keyword landing page rendering `ClaimOfferForm` |
| `scripts/deal-cli.ts` (create) | The `vacationpro deal` CLI entrypoint |
| `scripts/deal-cli.test.ts` (create) | CLI command-routing + arg-parsing tests |

---

## Task 1: Add Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install Vitest**

Run: `npm install -D vitest@^3`
Expected: `vitest` added to devDependencies, no errors.

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

- [ ] **Step 3: Add scripts to `package.json`**

In the `"scripts"` block, add:

```json
"test": "vitest run",
"test:watch": "vitest",
"deal": "tsx scripts/deal-cli.ts"
```

- [ ] **Step 4: Create a smoke test to verify the runner**

Create `src/lib/deal-registry/helpers.test.ts` with a placeholder:

```ts
import { describe, it, expect } from 'vitest';

describe('vitest smoke', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run the test to verify the runner works**

Run: `npm test`
Expected: PASS, 1 test passed.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/lib/deal-registry/helpers.test.ts
git commit -m "chore: add vitest test runner"
```

---

## Task 2: Supabase `deal_keywords` table

**Files:**
- Create: `supabase/migrations/0001_deal_keywords.sql`

- [ ] **Step 1: Write the migration SQL**

Create `supabase/migrations/0001_deal_keywords.sql`:

```sql
create table if not exists deal_keywords (
  id           uuid primary key default gen_random_uuid(),
  keyword      text not null unique,
  deal_slug    text not null,
  deal_title   text not null,
  destination  text not null,
  price        integer not null,
  landing_path text not null,
  dm_copy      text not null,
  status       text not null default 'active' check (status in ('active', 'paused', 'expired')),
  expires_at   date,
  created_at   timestamptz not null default now()
);

create index if not exists deal_keywords_keyword_idx on deal_keywords (keyword);
create index if not exists deal_keywords_status_idx on deal_keywords (status);
```

- [ ] **Step 2: Apply the migration**

Run it against the VacationPro Supabase project via the Supabase SQL editor or `psql`. (No automated test; this is a schema change.)
Expected: Table `deal_keywords` exists.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0001_deal_keywords.sql
git commit -m "feat: add deal_keywords table migration"
```

---

## Task 3: Registry types and pure helpers

**Files:**
- Create: `src/lib/deal-registry/types.ts`
- Create: `src/lib/deal-registry/helpers.ts`
- Test: `src/lib/deal-registry/helpers.test.ts`

- [ ] **Step 1: Create the types file**

Create `src/lib/deal-registry/types.ts`:

```ts
export interface DealKeyword {
  id: string;
  keyword: string;
  dealSlug: string;
  dealTitle: string;
  destination: string;
  price: number;
  landingPath: string;
  dmCopy: string;
  status: 'active' | 'paused' | 'expired';
  expiresAt: string | null;
  createdAt: string;
}

export interface DealEntryInput {
  keyword: string;
  dealSlug: string;
  dealTitle: string;
  destination: string;
  price: number;
  landingPath: string;
  dmCopy: string;
  expiresAt?: string | null;
}
```

- [ ] **Step 2: Write the failing tests for helpers**

Replace the contents of `src/lib/deal-registry/helpers.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { normalizeKeyword, validateDealEntry, parseDealSheetCsv } from './helpers';

describe('normalizeKeyword', () => {
  it('uppercases and trims', () => {
    expect(normalizeKeyword('  puntacana ')).toBe('PUNTACANA');
  });
  it('strips non-alphanumeric characters', () => {
    expect(normalizeKeyword('punta-cana!')).toBe('PUNTACANA');
  });
});

describe('validateDealEntry', () => {
  const valid = {
    keyword: 'ARUBA',
    dealSlug: 'aruba-3-night',
    dealTitle: 'Aruba 3 Nights',
    destination: 'Aruba',
    price: 720,
    landingPath: '/d/aruba',
    dmCopy: 'Here is your Aruba deal!',
  };
  it('returns null for a valid entry', () => {
    expect(validateDealEntry(valid)).toBeNull();
  });
  it('rejects an empty keyword', () => {
    expect(validateDealEntry({ ...valid, keyword: '' })).toMatch(/keyword/i);
  });
  it('rejects a non-positive price', () => {
    expect(validateDealEntry({ ...valid, price: 0 })).toMatch(/price/i);
  });
  it('rejects empty dm copy', () => {
    expect(validateDealEntry({ ...valid, dmCopy: '' })).toMatch(/dm copy/i);
  });
});

describe('parseDealSheetCsv', () => {
  it('parses rows into DealEntryInput objects', () => {
    const csv = [
      'keyword,dealSlug,dealTitle,destination,price,landingPath,dmCopy,expiresAt',
      'JAMAICA,jamaica-3n,Jamaica 3 Nights,Montego Bay,799,/d/jamaica,Here is Jamaica,2026-06-30',
    ].join('\n');
    const rows = parseDealSheetCsv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({
      keyword: 'JAMAICA',
      dealSlug: 'jamaica-3n',
      dealTitle: 'Jamaica 3 Nights',
      destination: 'Montego Bay',
      price: 799,
      landingPath: '/d/jamaica',
      dmCopy: 'Here is Jamaica',
      expiresAt: '2026-06-30',
    });
  });
  it('skips blank lines', () => {
    const csv = 'keyword,dealSlug,dealTitle,destination,price,landingPath,dmCopy,expiresAt\n\n';
    expect(parseDealSheetCsv(csv)).toHaveLength(0);
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL with "Cannot find module './helpers'" or undefined exports.

- [ ] **Step 4: Implement the helpers**

Create `src/lib/deal-registry/helpers.ts`:

```ts
import type { DealEntryInput } from './types';

export function normalizeKeyword(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function validateDealEntry(entry: Partial<DealEntryInput>): string | null {
  if (!entry.keyword?.trim()) return 'keyword is required';
  if (!entry.dealSlug?.trim()) return 'dealSlug is required';
  if (!entry.dealTitle?.trim()) return 'dealTitle is required';
  if (!entry.destination?.trim()) return 'destination is required';
  if (typeof entry.price !== 'number' || entry.price <= 0) return 'price must be a positive number';
  if (!entry.landingPath?.trim()) return 'landingPath is required';
  if (!entry.dmCopy?.trim()) return 'dm copy is required';
  return null;
}

export function parseDealSheetCsv(csv: string): DealEntryInput[] {
  const lines = csv.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length <= 1) return [];
  const rows = lines.slice(1); // skip header
  return rows.map((line) => {
    const [keyword, dealSlug, dealTitle, destination, price, landingPath, dmCopy, expiresAt] =
      line.split(',');
    return {
      keyword: normalizeKeyword(keyword),
      dealSlug: dealSlug.trim(),
      dealTitle: dealTitle.trim(),
      destination: destination.trim(),
      price: Number(price),
      landingPath: landingPath.trim(),
      dmCopy: dmCopy.trim(),
      expiresAt: expiresAt?.trim() || null,
    };
  });
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS, all helper tests green.

- [ ] **Step 6: Commit**

```bash
git add src/lib/deal-registry/types.ts src/lib/deal-registry/helpers.ts src/lib/deal-registry/helpers.test.ts
git commit -m "feat: add deal registry types and pure helpers"
```

---

## Task 4: Registry DB module

**Files:**
- Create: `src/lib/deal-registry/index.ts`
- Reference: `src/lib/supabase/client.ts` (existing Supabase client)

> Note: these functions are thin Supabase wrappers and are exercised by the endpoint and CLI tasks rather than unit-tested in isolation (mocking Supabase adds no real coverage). Keep them thin so the logic that matters lives in `helpers.ts`.

- [ ] **Step 1: Inspect the existing Supabase client**

Run: `cat src/lib/supabase/client.ts`
Expected: Confirm the export name and whether a service-role client is available. If only a public client is exported, this module creates a service-role client inline using `process.env.NEXT_PUBLIC_SUPABASE_URL` and `process.env.SUPABASE_SERVICE_ROLE_KEY` (both confirmed present in `.env.local`).

- [ ] **Step 2: Implement the registry module**

Create `src/lib/deal-registry/index.ts`:

```ts
import { createClient } from '@supabase/supabase-js';
import type { DealKeyword, DealEntryInput } from './types';
import { normalizeKeyword } from './helpers';

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

function rowToDealKeyword(row: Record<string, unknown>): DealKeyword {
  return {
    id: row.id as string,
    keyword: row.keyword as string,
    dealSlug: row.deal_slug as string,
    dealTitle: row.deal_title as string,
    destination: row.destination as string,
    price: row.price as number,
    landingPath: row.landing_path as string,
    dmCopy: row.dm_copy as string,
    status: row.status as DealKeyword['status'],
    expiresAt: (row.expires_at as string) ?? null,
    createdAt: row.created_at as string,
  };
}

export async function findByKeyword(keyword: string): Promise<DealKeyword | null> {
  const { data, error } = await db()
    .from('deal_keywords')
    .select('*')
    .eq('keyword', normalizeKeyword(keyword))
    .eq('status', 'active')
    .maybeSingle();
  if (error) throw new Error(`findByKeyword failed: ${error.message}`);
  return data ? rowToDealKeyword(data) : null;
}

export async function keywordExists(keyword: string): Promise<boolean> {
  const { data, error } = await db()
    .from('deal_keywords')
    .select('id')
    .eq('keyword', normalizeKeyword(keyword))
    .maybeSingle();
  if (error) throw new Error(`keywordExists failed: ${error.message}`);
  return !!data;
}

export async function listActive(): Promise<DealKeyword[]> {
  const { data, error } = await db()
    .from('deal_keywords')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`listActive failed: ${error.message}`);
  return (data ?? []).map(rowToDealKeyword);
}

export async function addKeyword(entry: DealEntryInput): Promise<DealKeyword> {
  const { data, error } = await db()
    .from('deal_keywords')
    .insert({
      keyword: normalizeKeyword(entry.keyword),
      deal_slug: entry.dealSlug,
      deal_title: entry.dealTitle,
      destination: entry.destination,
      price: entry.price,
      landing_path: entry.landingPath,
      dm_copy: entry.dmCopy,
      expires_at: entry.expiresAt ?? null,
    })
    .select('*')
    .single();
  if (error) throw new Error(`addKeyword failed: ${error.message}`);
  return rowToDealKeyword(data);
}

export type { DealKeyword, DealEntryInput };
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors in `src/lib/deal-registry/`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/deal-registry/index.ts
git commit -m "feat: add deal registry Supabase module"
```

---

## Task 5: Resolve endpoint

**Files:**
- Create: `src/app/api/manychat/resolve/route.ts`
- Test: `src/app/api/manychat/resolve/route.test.ts`

The endpoint builds the response from a `DealKeyword`. The response-building logic is pure and gets unit-tested; the route handler wires it to `findByKeyword`.

- [ ] **Step 1: Write the failing test**

Create `src/app/api/manychat/resolve/route.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buildResolveResponse } from './route';
import type { DealKeyword } from '@/lib/deal-registry/types';

const deal: DealKeyword = {
  id: '1',
  keyword: 'ARUBA',
  dealSlug: 'aruba-3n',
  dealTitle: 'Aruba 3 Nights',
  destination: 'Aruba',
  price: 720,
  landingPath: '/d/aruba',
  dmCopy: 'Here is your Aruba deal!',
  status: 'active',
  expiresAt: null,
  createdAt: '2026-05-14T00:00:00Z',
};

describe('buildResolveResponse', () => {
  it('returns found payload for a deal', () => {
    const res = buildResolveResponse(deal, 'https://www.vacationpro.co');
    expect(res).toEqual({
      found: true,
      keyword: 'ARUBA',
      dealTitle: 'Aruba 3 Nights',
      dmText: 'Here is your Aruba deal!',
      landingUrl: 'https://www.vacationpro.co/d/aruba',
    });
  });
  it('returns not-found payload for null', () => {
    const res = buildResolveResponse(null, 'https://www.vacationpro.co');
    expect(res.found).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test src/app/api/manychat/resolve/route.test.ts`
Expected: FAIL with "Cannot find module './route'" or `buildResolveResponse` undefined.

- [ ] **Step 3: Implement the route**

Create `src/app/api/manychat/resolve/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { findByKeyword } from '@/lib/deal-registry';
import { normalizeKeyword } from '@/lib/deal-registry/helpers';
import type { DealKeyword } from '@/lib/deal-registry/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vacationpro.co';

interface ResolveResponse {
  found: boolean;
  keyword: string;
  dealTitle?: string;
  dmText?: string;
  landingUrl?: string;
}

export function buildResolveResponse(deal: DealKeyword | null, siteUrl: string): ResolveResponse {
  if (!deal) return { found: false, keyword: '' };
  return {
    found: true,
    keyword: deal.keyword,
    dealTitle: deal.dealTitle,
    dmText: deal.dmCopy,
    landingUrl: `${siteUrl}${deal.landingPath}`,
  };
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('keyword');
  if (!raw) {
    return NextResponse.json({ error: 'keyword query param is required' }, { status: 400 });
  }
  try {
    const deal = await findByKeyword(normalizeKeyword(raw));
    return NextResponse.json(buildResolveResponse(deal, SITE_URL));
  } catch (err) {
    console.error('resolve error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test src/app/api/manychat/resolve/route.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/manychat/resolve/route.ts src/app/api/manychat/resolve/route.test.ts
git commit -m "feat: add ManyChat resolve endpoint"
```

---

## Task 6: Per-keyword landing route

**Files:**
- Create: `src/app/(landing)/d/[keyword]/page.tsx`
- Reference: `src/app/(landing)/quote/page.tsx` (existing pattern), `src/components/ui/ClaimOfferForm.tsx`

- [ ] **Step 1: Implement the landing page**

Create `src/app/(landing)/d/[keyword]/page.tsx`. It mirrors the structure of `(landing)/quote/page.tsx` but resolves the deal from the registry by keyword and 404s if not found:

```tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ClaimOfferForm from '@/components/ui/ClaimOfferForm';
import { findByKeyword } from '@/lib/deal-registry';

interface PageProps {
  params: Promise<{ keyword: string }>;
}

export const metadata: Metadata = {
  title: 'Claim Your Vacation Deal',
  description: 'Tell us about your trip and we will email verified pricing within 24 hours.',
  robots: { index: false, follow: true },
};

export default async function DealLandingPage({ params }: PageProps) {
  const { keyword } = await params;
  const deal = await findByKeyword(keyword);
  if (!deal) notFound();

  return (
    <main className="min-h-screen bg-cream-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <span className="inline-block bg-brand-50 text-brand-700 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full">
            Verified Pricing · Limited Inventory
          </span>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-forest mb-3 leading-tight">
            {deal.destination} — from ${deal.price}
          </h1>
          <p className="text-lg text-gray-600">
            {deal.dealTitle}. Fill out the form and we will email verified pricing within 24 hours.
            <br />
            No spam, no commitment, no surprise fees.
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <ClaimOfferForm
            dealTitle={deal.dealTitle}
            dealDestination={deal.destination}
            dealPrice={deal.price}
            ctaText="Get My Quote"
          />
        </div>
        <p className="text-xs text-gray-500 text-center mt-6">
          By submitting, you agree to our{' '}
          <a href="/privacy" className="underline hover:text-gray-700">Privacy Policy</a>. We will
          email or call you with your quote and may share your details with our travel partner.
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Type-check and build**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Manual smoke test**

Run: `npm run dev`, then visit `http://localhost:3000/d/TESTKEY`.
Expected: 404 page (no `TESTKEY` in the registry yet). This confirms the route resolves and the not-found path works. A real keyword is tested end-to-end in Task 8.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(landing)/d/[keyword]/page.tsx"
git commit -m "feat: add per-keyword deal landing route"
```

---

## Task 7: The `vacationpro deal` CLI core (add, list, status)

**Files:**
- Create: `scripts/deal-cli.ts`
- Test: `scripts/deal-cli.test.ts`

The CLI's arg-parsing and command-routing logic is pure and unit-tested. The DB calls reuse the Task 4 registry module.

- [ ] **Step 1: Write the failing test for arg parsing**

Create `scripts/deal-cli.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { parseArgs, parseAddFlags } from './deal-cli';

describe('parseArgs', () => {
  it('extracts the command and rest args', () => {
    expect(parseArgs(['add', '--keyword', 'ARUBA'])).toEqual({
      command: 'add',
      rest: ['--keyword', 'ARUBA'],
    });
  });
  it('defaults to a help command when empty', () => {
    expect(parseArgs([])).toEqual({ command: 'help', rest: [] });
  });
});

describe('parseAddFlags', () => {
  it('parses all add flags into a DealEntryInput', () => {
    const result = parseAddFlags([
      '--keyword', 'aruba',
      '--deal-slug', 'aruba-3n',
      '--title', 'Aruba 3 Nights',
      '--destination', 'Aruba',
      '--price', '720',
      '--landing-path', '/d/aruba',
      '--dm-copy', 'Here is your Aruba deal!',
      '--expires', '2026-06-30',
    ]);
    expect(result).toEqual({
      keyword: 'ARUBA',
      dealSlug: 'aruba-3n',
      dealTitle: 'Aruba 3 Nights',
      destination: 'Aruba',
      price: 720,
      landingPath: '/d/aruba',
      dmCopy: 'Here is your Aruba deal!',
      expiresAt: '2026-06-30',
    });
  });
  it('throws when a required flag is missing', () => {
    expect(() => parseAddFlags(['--keyword', 'ARUBA'])).toThrow(/required/i);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test scripts/deal-cli.test.ts`
Expected: FAIL with "Cannot find module './deal-cli'".

- [ ] **Step 3: Implement the CLI**

Create `scripts/deal-cli.ts`:

```ts
import { readFileSync } from 'fs';
import { addKeyword, keywordExists, listActive } from '../src/lib/deal-registry';
import { normalizeKeyword, validateDealEntry, parseDealSheetCsv } from '../src/lib/deal-registry/helpers';
import type { DealEntryInput } from '../src/lib/deal-registry/types';

export function parseArgs(argv: string[]): { command: string; rest: string[] } {
  if (argv.length === 0) return { command: 'help', rest: [] };
  return { command: argv[0], rest: argv.slice(1) };
}

function getFlag(flags: string[], name: string): string | undefined {
  const i = flags.indexOf(name);
  return i >= 0 && i + 1 < flags.length ? flags[i + 1] : undefined;
}

export function parseAddFlags(flags: string[]): DealEntryInput {
  const keyword = getFlag(flags, '--keyword');
  const dealSlug = getFlag(flags, '--deal-slug');
  const dealTitle = getFlag(flags, '--title');
  const destination = getFlag(flags, '--destination');
  const priceStr = getFlag(flags, '--price');
  const landingPath = getFlag(flags, '--landing-path');
  const dmCopy = getFlag(flags, '--dm-copy');
  const expiresAt = getFlag(flags, '--expires') ?? null;

  if (!keyword || !dealSlug || !dealTitle || !destination || !priceStr || !landingPath || !dmCopy) {
    throw new Error(
      'Missing required flag. Required: --keyword --deal-slug --title --destination --price --landing-path --dm-copy'
    );
  }
  return {
    keyword: normalizeKeyword(keyword),
    dealSlug,
    dealTitle,
    destination,
    price: Number(priceStr),
    landingPath,
    dmCopy,
    expiresAt,
  };
}

async function cmdAdd(rest: string[]) {
  const entry = parseAddFlags(rest);
  const err = validateDealEntry(entry);
  if (err) throw new Error(`Invalid deal: ${err}`);
  if (await keywordExists(entry.keyword)) {
    throw new Error(`Keyword "${entry.keyword}" already exists. Pick a unique keyword.`);
  }
  const created = await addKeyword(entry);
  console.log(`✓ Added ${created.keyword} → ${created.landingPath} (${created.dealTitle})`);
}

async function cmdList() {
  const deals = await listActive();
  if (deals.length === 0) {
    console.log('No active deal keywords.');
    return;
  }
  console.log(`${deals.length} active deal keywords:`);
  for (const d of deals) {
    console.log(`  ${d.keyword.padEnd(16)} $${String(d.price).padEnd(6)} ${d.landingPath.padEnd(20)} ${d.dealTitle}`);
  }
}

async function cmdStatus(rest: string[]) {
  const keyword = rest[0] ? normalizeKeyword(rest[0]) : '';
  if (!keyword) throw new Error('Usage: deal status <KEYWORD>');
  const deals = await listActive();
  const found = deals.find((d) => d.keyword === keyword);
  if (!found) {
    console.log(`Keyword "${keyword}" not found among active deals.`);
    return;
  }
  console.log(JSON.stringify(found, null, 2));
}

async function cmdSync(rest: string[]) {
  const csvPath = rest[0];
  if (!csvPath) throw new Error('Usage: deal sync <path-to-deal-sheet.csv>');
  const csv = readFileSync(csvPath, 'utf8');
  const entries = parseDealSheetCsv(csv);
  let added = 0;
  let skipped = 0;
  for (const entry of entries) {
    const err = validateDealEntry(entry);
    if (err) {
      console.log(`  ✗ ${entry.keyword || '(blank)'}: ${err}`);
      skipped++;
      continue;
    }
    if (await keywordExists(entry.keyword)) {
      console.log(`  - ${entry.keyword}: already exists, skipped`);
      skipped++;
      continue;
    }
    await addKeyword(entry);
    console.log(`  ✓ ${entry.keyword} → ${entry.landingPath}`);
    added++;
  }
  console.log(`\nSync complete: ${added} added, ${skipped} skipped.`);
}

function cmdHelp() {
  console.log(`vacationpro deal — deal keyword registry CLI

Usage:
  npm run deal add --keyword <KW> --deal-slug <slug> --title <title> \\
    --destination <dest> --price <n> --landing-path </d/kw> --dm-copy <text> [--expires YYYY-MM-DD]
  npm run deal list
  npm run deal status <KEYWORD>
  npm run deal sync <path-to-deal-sheet.csv>
`);
}

async function main() {
  const { command, rest } = parseArgs(process.argv.slice(2));
  switch (command) {
    case 'add': return cmdAdd(rest);
    case 'list': return cmdList();
    case 'status': return cmdStatus(rest);
    case 'sync': return cmdSync(rest);
    default: return cmdHelp();
  }
}

// Only run main when executed directly, not when imported by tests.
if (process.argv[1] && process.argv[1].endsWith('deal-cli.ts')) {
  main().catch((e) => {
    console.error(`Error: ${e instanceof Error ? e.message : e}`);
    process.exit(1);
  });
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test scripts/deal-cli.test.ts`
Expected: PASS.

- [ ] **Step 5: Verify the help command runs**

Run: `npm run deal`
Expected: Prints the usage text, exit 0.

- [ ] **Step 6: Commit**

```bash
git add scripts/deal-cli.ts scripts/deal-cli.test.ts
git commit -m "feat: add vacationpro deal CLI (add, list, status, sync)"
```

---

## Task 8: Full test run and end-to-end smoke test

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: All tests pass (helpers, resolve, deal-cli).

- [ ] **Step 2: Type-check the whole project**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Add one real deal via the CLI**

Run:
```bash
npm run deal add --keyword PUNTACANA --deal-slug punta-cana-3n \
  --title "Punta Cana 3 Nights + Flights" --destination "Punta Cana" \
  --price 720 --landing-path /d/puntacana \
  --dm-copy "Here is your Punta Cana deal! Tap below for verified pricing."
```
Expected: `✓ Added PUNTACANA → /d/puntacana ...`

- [ ] **Step 4: Verify it lists**

Run: `npm run deal list`
Expected: `PUNTACANA` appears in the output.

- [ ] **Step 5: Verify the resolve endpoint**

Run: `npm run dev`, then `curl "http://localhost:3000/api/manychat/resolve?keyword=puntacana"`
Expected: JSON with `"found": true`, `"landingUrl": ".../d/puntacana"`, `"dmText": "Here is your Punta Cana deal!..."`.

- [ ] **Step 6: Verify the landing page renders**

Visit `http://localhost:3000/d/puntacana`.
Expected: Landing page renders with "Punta Cana — from $720" and the `ClaimOfferForm`.

- [ ] **Step 7: Commit any final fixes**

```bash
git add -A
git commit -m "test: verify deal engine funnel end-to-end"
```

---

## Out of scope for this plan (handled elsewhere)

- **ManyChat universal flow UI setup** — building the flow + Dynamic Content block in ManyChat's UI (operational, Day 3 of the rollout timeline). This plan provides the `/api/manychat/resolve` endpoint that flow calls.
- **Booking-routing mode** of the landing page — Phase 4 of the rollout. The current landing page is lead-gen mode (routes to GHL/Tristar via the existing `ClaimOfferForm`).
- **Content templates** (Track 1) and **host agency search** (Track 3) — operational tracks, run off the rollout timeline checklists.
- **Deploying the resolve endpoint** — happens via the normal Vercel push deploy once tasks are committed.
