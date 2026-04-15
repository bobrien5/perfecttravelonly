# Beehiiv + SendGrid Email Architecture Split — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split VacationPro's email stack so Beehiiv is the master subscriber list + broadcast newsletter tool (Boarding Pass Mon / Deal Alert Thu) and SendGrid handles triggered sequences (welcome, re-engagement, lead-magnet follow-up, WOW nurture, promotional drops), with bidirectional subscription/unsubscribe sync via custom Next.js webhook handlers.

**Architecture:** Site form writes to Beehiiv. Beehiiv webhook notifies our Next.js API when a subscription is created/deleted, which triggers SendGrid sequence operations. SendGrid Event Webhook notifies our Next.js API when someone unsubscribes in SendGrid, which syncs back to Beehiiv. Signature verification on both webhooks.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Node runtime. Beehiiv Publications API v2 (Svix-signed webhooks). SendGrid v3 (ECDSA-signed event webhook, `@sendgrid/eventwebhook`). No test framework installed — verification is manual via curl + dev server smoke tests.

**Execution notes:**
- Repo is **not git-tracked**. Replace "commit" steps with **review checkpoints** (show diff / file, wait for approval).
- Do Tasks 1-2 before anything else (foundation).
- Task 3 (data migration) must happen before Task 5 (new subscribe route goes live) OR you'll strand the 14 existing SendGrid contacts.
- Tasks 6 + 9 register live webhooks in external dashboards — do those ONLY after code is deployed to preview/prod; don't register against `localhost`.

---

## 1. File Structure

| Path | Purpose |
|------|---------|
| `src/lib/beehiiv/client.ts` | **NEW.** Typed Beehiiv API client — `createSubscription`, `deleteSubscription`, `getSubscription`. |
| `src/lib/beehiiv/webhook.ts` | **NEW.** Svix signature verification for incoming Beehiiv webhooks. |
| `src/lib/email/sequences.ts` | **NEW.** SendGrid Marketing Campaigns "Automation" enrollment helper — one function per sequence (`enrollInWelcome`, `enrollInReengagement`, etc.). |
| `src/lib/sendgrid/webhook.ts` | **NEW.** ECDSA signature verification for incoming SendGrid event webhooks. |
| `src/app/api/newsletter/subscribe/route.ts` | **MODIFY.** Replace SendGrid upsert+send with Beehiiv `createSubscription` call. Remove inline welcome email HTML. |
| `src/app/api/webhooks/beehiiv/route.ts` | **NEW.** Receives Beehiiv events. Routes `subscription.created` → enroll in SendGrid welcome; `subscription.deleted` → unsubscribe from SendGrid. |
| `src/app/api/webhooks/sendgrid/route.ts` | **NEW.** Receives SendGrid events. Routes `unsubscribe` / `group_unsubscribe` / `spamreport` → remove/archive from Beehiiv. |
| `scripts/migrate-sendgrid-to-beehiiv.ts` | **NEW.** One-shot migration script — pulls 14 SendGrid contacts, posts each to Beehiiv as "imported" (no welcome fires). |
| `src/lib/email/welcome-sequence.ts` | **DELETE** after migration is verified. Replaced by SendGrid Automation configured in SG dashboard + content in Brand/emails/. |
| `src/app/api/newsletter/welcome-sequence/route.ts` | **DELETE** after migration is verified. Cron that drove step-2..5 emails is replaced by SendGrid's native Automation engine. |
| `vacationpro/Brand/emails/welcome/0[1-5]-*.html` | **NEW.** Brand-playbook-compliant HTML for welcome emails 1-5 (to paste into SendGrid Automation). |
| `.env.local` | **MODIFY.** Add `BEEHIIV_WEBHOOK_SECRET`, `SENDGRID_WEBHOOK_PUBLIC_KEY`. |

---

## Phase 1: Foundation — Beehiiv Client (Tasks 1-2)

### Task 1: Create Beehiiv API client

**Files:**
- Create: `vacationpro/src/lib/beehiiv/client.ts`

- [ ] **Step 1: Write the client**

```typescript
// src/lib/beehiiv/client.ts
const API_BASE = 'https://api.beehiiv.com/v2';

function getConfig() {
  const apiKey = process.env.BEEHIIV_API_KEY;
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;
  if (!apiKey || !publicationId) {
    throw new Error('Missing BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID');
  }
  return { apiKey, publicationId };
}

export interface BeehiivSubscription {
  id: string;
  email: string;
  status: 'active' | 'inactive' | 'pending' | 'validating';
  created: number;
  subscription_tier?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referring_site?: string;
}

export interface CreateSubscriptionInput {
  email: string;
  firstName?: string;
  reactivateExisting?: boolean;
  sendWelcomeEmail?: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referringSite?: string;
  customFields?: Array<{ name: string; value: string }>;
}

export async function createSubscription(
  input: CreateSubscriptionInput
): Promise<BeehiivSubscription> {
  const { apiKey, publicationId } = getConfig();
  const body: Record<string, unknown> = {
    email: input.email.toLowerCase().trim(),
    reactivate_existing: input.reactivateExisting ?? true,
    send_welcome_email: input.sendWelcomeEmail ?? false, // Beehiiv welcome OFF — SendGrid handles it
  };
  if (input.utmSource) body.utm_source = input.utmSource;
  if (input.utmMedium) body.utm_medium = input.utmMedium;
  if (input.utmCampaign) body.utm_campaign = input.utmCampaign;
  if (input.referringSite) body.referring_site = input.referringSite;
  if (input.customFields) body.custom_fields = input.customFields;
  if (input.firstName) {
    body.custom_fields = [
      ...((body.custom_fields as Array<{ name: string; value: string }>) ?? []),
      { name: 'First Name', value: input.firstName },
    ];
  }

  const res = await fetch(
    `${API_BASE}/publications/${publicationId}/subscriptions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Beehiiv createSubscription failed (${res.status}): ${text}`);
  }
  const json = (await res.json()) as { data: BeehiivSubscription };
  return json.data;
}

export async function deleteSubscription(email: string): Promise<void> {
  const { apiKey, publicationId } = getConfig();
  // Beehiiv expects the subscription ID or email — email lookup via ?email=
  const lookup = await fetch(
    `${API_BASE}/publications/${publicationId}/subscriptions/by_email/${encodeURIComponent(
      email.toLowerCase().trim()
    )}`,
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );
  if (lookup.status === 404) return; // already gone
  if (!lookup.ok) {
    throw new Error(`Beehiiv lookup failed (${lookup.status})`);
  }
  const { data } = (await lookup.json()) as { data: BeehiivSubscription };

  const res = await fetch(
    `${API_BASE}/publications/${publicationId}/subscriptions/${data.id}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${apiKey}` },
    }
  );
  if (!res.ok && res.status !== 404) {
    throw new Error(`Beehiiv deleteSubscription failed (${res.status})`);
  }
}

export async function getSubscription(
  email: string
): Promise<BeehiivSubscription | null> {
  const { apiKey, publicationId } = getConfig();
  const res = await fetch(
    `${API_BASE}/publications/${publicationId}/subscriptions/by_email/${encodeURIComponent(
      email.toLowerCase().trim()
    )}`,
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Beehiiv getSubscription failed (${res.status})`);
  const { data } = (await res.json()) as { data: BeehiivSubscription };
  return data;
}
```

- [ ] **Step 2: Manual smoke test**

Run in a temporary script or `node -e` with TS compiled:

```bash
cd vacationpro
npx tsx -e "import('./src/lib/beehiiv/client').then(async c => {
  const s = await c.createSubscription({ email: 'test+vp-$(date +%s)@example.com', utmCampaign: 'smoke_test' });
  console.log('created:', s.id, s.status);
  const found = await c.getSubscription(s.email);
  console.log('found:', found?.id);
  await c.deleteSubscription(s.email);
  console.log('deleted OK');
})"
```

Expected output: three log lines — `created:`, `found:`, `deleted OK`.

- [ ] **Step 3: Checkpoint** — user reviews client file + smoke test output.

---

### Task 2: Create Beehiiv webhook verifier

**Files:**
- Create: `vacationpro/src/lib/beehiiv/webhook.ts`

**Background:** Beehiiv signs webhooks using Svix. Headers: `svix-id`, `svix-timestamp`, `svix-signature`. Signature format: `v1,<base64>` (one or more comma-separated).

- [ ] **Step 1: Install svix package**

```bash
cd vacationpro && npm install svix
```

- [ ] **Step 2: Write the verifier**

```typescript
// src/lib/beehiiv/webhook.ts
import { Webhook, WebhookRequiredHeaders } from 'svix';

export function verifyBeehiivWebhook(
  rawBody: string,
  headers: {
    'svix-id'?: string;
    'svix-timestamp'?: string;
    'svix-signature'?: string;
  }
): unknown {
  const secret = process.env.BEEHIIV_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('Missing BEEHIIV_WEBHOOK_SECRET');
  }

  const svixHeaders: WebhookRequiredHeaders = {
    'svix-id': headers['svix-id'] ?? '',
    'svix-timestamp': headers['svix-timestamp'] ?? '',
    'svix-signature': headers['svix-signature'] ?? '',
  };
  if (!svixHeaders['svix-id'] || !svixHeaders['svix-timestamp'] || !svixHeaders['svix-signature']) {
    throw new Error('Missing Svix headers');
  }

  const wh = new Webhook(secret);
  // Throws on invalid signature.
  return wh.verify(rawBody, svixHeaders);
}
```

- [ ] **Step 3: Checkpoint** — user reviews verifier.

---

## Phase 2: Migration (Task 3)

### Task 3: Migrate 14 SendGrid contacts to Beehiiv

**Files:**
- Create: `vacationpro/scripts/migrate-sendgrid-to-beehiiv.ts`

**Why this order:** The new subscribe route (Task 4) and live webhook registration (Task 6) will stop all SendGrid writes. If you flip that switch before migrating, those 14 contacts never land in Beehiiv.

- [ ] **Step 1: Install tsx if missing**

```bash
cd vacationpro && npm install --save-dev tsx
```

- [ ] **Step 2: Write the migration script**

```typescript
// scripts/migrate-sendgrid-to-beehiiv.ts
import sgClient from '@sendgrid/client';
import { createSubscription } from '../src/lib/beehiiv/client';

const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) throw new Error('Missing SENDGRID_API_KEY');
sgClient.setApiKey(apiKey);

interface SgContact {
  id: string;
  email: string;
  first_name?: string;
  custom_fields?: Record<string, string>;
}

async function listAllContacts(): Promise<SgContact[]> {
  // SendGrid exports contacts via a signed download; simplest for 14 contacts
  // is the search endpoint.
  const [, body] = await sgClient.request({
    url: '/v3/marketing/contacts/search',
    method: 'POST',
    body: {
      query: "email LIKE '%@%'", // match all
    },
  });
  const data = body as { result: SgContact[] };
  return data.result ?? [];
}

async function main() {
  const contacts = await listAllContacts();
  console.log(`Found ${contacts.length} SendGrid contacts.`);

  let migrated = 0;
  let skipped = 0;
  let failed = 0;
  const errors: Array<{ email: string; error: string }> = [];

  for (const c of contacts) {
    try {
      await createSubscription({
        email: c.email,
        firstName: c.first_name,
        utmSource: 'migration',
        utmCampaign: 'sendgrid_to_beehiiv_2026_04',
        reactivateExisting: true,
        sendWelcomeEmail: false,
      });
      migrated++;
      console.log(`✓ ${c.email}`);
    } catch (err) {
      failed++;
      errors.push({ email: c.email, error: String(err) });
      console.error(`✗ ${c.email}: ${err}`);
    }
  }

  console.log(`\nSummary: ${migrated} migrated, ${skipped} skipped, ${failed} failed.`);
  if (errors.length) {
    console.error('\nErrors:', JSON.stringify(errors, null, 2));
    process.exitCode = 1;
  }
}

main();
```

- [ ] **Step 3: Dry-run against Beehiiv sandbox first (OPTIONAL)**

Skip if you only have one Beehiiv publication. Otherwise temporarily set `BEEHIIV_PUBLICATION_ID` to a test pub before running.

- [ ] **Step 4: Run the migration**

```bash
cd vacationpro && npx tsx scripts/migrate-sendgrid-to-beehiiv.ts
```

Expected output: 14 `✓` lines, `Summary: 14 migrated, 0 skipped, 0 failed.`

If anything fails, DO NOT proceed — diagnose, fix, re-run only the failed contacts.

- [ ] **Step 5: Verify in Beehiiv**

Log into Beehiiv → Subscribers. You should see the new 14 contacts tagged with `utm_campaign=sendgrid_to_beehiiv_2026_04`.

- [ ] **Step 6: Checkpoint** — user confirms subscriber count in Beehiiv matches expectations.

---

## Phase 3: Subscribe Route Refactor (Task 4)

### Task 4: Refactor `/api/newsletter/subscribe` to write to Beehiiv

**Files:**
- Modify: `vacationpro/src/app/api/newsletter/subscribe/route.ts` (replace entirely)

**Purpose:** Public signup form now writes to Beehiiv. Beehiiv's webhook (Task 5) will fire SendGrid welcome. We stop sending the welcome email inline from this route.

- [ ] **Step 1: Replace the file**

```typescript
// src/app/api/newsletter/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSubscription } from '@/lib/beehiiv/client';

interface SubscribeRequest {
  email: string;
  firstName?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referringSite?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SubscribeRequest = await request.json();

    if (!body.email || !body.email.includes('@')) {
      return NextResponse.json(
        { error: 'A valid email address is required' },
        { status: 400 }
      );
    }

    await createSubscription({
      email: body.email,
      firstName: body.firstName,
      utmSource: body.utmSource,
      utmMedium: body.utmMedium,
      utmCampaign: body.utmCampaign ?? 'deal_alerts',
      referringSite: body.referringSite,
      reactivateExisting: true,
      sendWelcomeEmail: false, // SendGrid Automation handles welcome
    });

    return NextResponse.json(
      {
        success: true,
        message: "You're subscribed! Check your inbox for a welcome email.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Smoke test the new route**

Start the dev server (if not running):
```bash
cd vacationpro && npm run dev
```

Post to the route with a fresh email:
```bash
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test+subscribe-$(date +%s)@example.com","firstName":"Test","utmCampaign":"manual_smoke"}'
```

Expected: HTTP 200 with `{"success":true,...}`.

Verify in Beehiiv dashboard that the contact appeared.

- [ ] **Step 3: Checkpoint** — user confirms subscribe endpoint works end-to-end against Beehiiv.

---

## Phase 4: Beehiiv → SendGrid Webhook (Tasks 5-6)

### Task 5: Create `/api/webhooks/beehiiv` route

**Files:**
- Create: `vacationpro/src/lib/email/sequences.ts`
- Create: `vacationpro/src/app/api/webhooks/beehiiv/route.ts`

**Events handled:**
- `subscription.created` → add to SendGrid list `welcome_series` (triggers SendGrid Automation)
- `subscription.deleted` → delete from SendGrid contact DB

- [ ] **Step 1: Write the sequences helper**

```typescript
// src/lib/email/sequences.ts
import sgClient from '@sendgrid/client';

const apiKey = process.env.SENDGRID_API_KEY;
if (apiKey) sgClient.setApiKey(apiKey);

const WELCOME_LIST_ID = process.env.SENDGRID_WELCOME_LIST_ID;

export async function enrollInWelcome(email: string, firstName?: string): Promise<void> {
  if (!WELCOME_LIST_ID) {
    throw new Error('Missing SENDGRID_WELCOME_LIST_ID');
  }
  await sgClient.request({
    url: '/v3/marketing/contacts',
    method: 'PUT',
    body: {
      list_ids: [WELCOME_LIST_ID],
      contacts: [
        {
          email: email.toLowerCase().trim(),
          ...(firstName ? { first_name: firstName } : {}),
          custom_fields: {
            // Hook into the SendGrid Automation entry criteria:
            // configure the Automation to enroll anyone added to this list.
          },
        },
      ],
    },
  });
}

export async function removeFromSendGrid(email: string): Promise<void> {
  // Look up the contact ID by email
  const [, searchBody] = await sgClient.request({
    url: '/v3/marketing/contacts/search',
    method: 'POST',
    body: { query: `email = '${email.toLowerCase().trim()}'` },
  });
  const result = (searchBody as { result: Array<{ id: string }> }).result;
  if (!result?.length) return;
  const ids = result.map((r) => r.id).join(',');
  await sgClient.request({
    url: `/v3/marketing/contacts?ids=${ids}`,
    method: 'DELETE',
  });
}
```

- [ ] **Step 2: Write the webhook route**

```typescript
// src/app/api/webhooks/beehiiv/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyBeehiivWebhook } from '@/lib/beehiiv/webhook';
import { enrollInWelcome, removeFromSendGrid } from '@/lib/email/sequences';

interface BeehiivEvent {
  type: 'subscription.created' | 'subscription.deleted' | 'subscription.updated' | string;
  data: {
    id: string;
    email: string;
    status?: string;
    custom_fields?: Array<{ name: string; value: string }>;
  };
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  let event: BeehiivEvent;
  try {
    event = verifyBeehiivWebhook(rawBody, {
      'svix-id': request.headers.get('svix-id') ?? undefined,
      'svix-timestamp': request.headers.get('svix-timestamp') ?? undefined,
      'svix-signature': request.headers.get('svix-signature') ?? undefined,
    }) as BeehiivEvent;
  } catch (err) {
    console.error('[beehiiv webhook] signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    const firstName = event.data.custom_fields?.find((f) => f.name === 'First Name')?.value;

    switch (event.type) {
      case 'subscription.created':
        await enrollInWelcome(event.data.email, firstName);
        console.log(`[beehiiv webhook] enrolled ${event.data.email} in welcome`);
        break;
      case 'subscription.deleted':
        await removeFromSendGrid(event.data.email);
        console.log(`[beehiiv webhook] removed ${event.data.email} from SendGrid`);
        break;
      default:
        console.log(`[beehiiv webhook] ignored event type: ${event.type}`);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[beehiiv webhook] handler error:', err);
    // Return 500 so Beehiiv retries.
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }
}
```

- [ ] **Step 3: Local verification (without live webhook)**

Simulate a signed Beehiiv event locally — use Svix's test-signature tool or temporarily bypass verification with a dev flag. Easiest path: deploy to preview and test end-to-end there. For local-only testing, post a mocked payload with signature disabled:

Temporarily add at the top of the route (remove before prod):
```typescript
if (process.env.NODE_ENV === 'development' && request.headers.get('x-dev-skip-svix') === '1') {
  // dev bypass
}
```

Then:
```bash
curl -X POST http://localhost:3000/api/webhooks/beehiiv \
  -H "Content-Type: application/json" \
  -H "x-dev-skip-svix: 1" \
  -d '{"type":"subscription.created","data":{"id":"sub_test","email":"test+whook@example.com"}}'
```

Expected: HTTP 200 `{"ok":true}`. SendGrid Marketing Contacts should now show the test email in `welcome_series` list.

**Remove the dev bypass before Step 4.**

- [ ] **Step 4: Checkpoint** — user reviews both files + local test output.

---

### Task 6: Register Beehiiv webhook (live — requires deployed URL)

**Files:** none (external config).

**Prerequisite:** code from Tasks 4-5 must be deployed to your Vercel preview or prod. Webhook URL must be internet-reachable.

- [ ] **Step 1: Create a SendGrid list called "welcome_series"**

SendGrid dashboard → Marketing → Contacts → Create List → name it "welcome_series". Copy the list ID.

- [ ] **Step 2: Build a SendGrid Automation**

SendGrid dashboard → Marketing → Automations → New → Single Send trigger: "Contact added to list 'welcome_series'". Add 5 steps per the Brand playbook cadence (Day 0, 2, 4, 7, 10). For now create empty placeholders — content gets filled in Task 9.

- [ ] **Step 3: Add `SENDGRID_WELCOME_LIST_ID` to Vercel env**

Vercel → Project Settings → Environment Variables → Add `SENDGRID_WELCOME_LIST_ID` with the list ID from Step 1. Redeploy.

- [ ] **Step 4: Register the Beehiiv webhook**

Beehiiv dashboard → Settings → Integrations → Webhooks → Add Endpoint:
- **URL:** `https://www.vacationpro.co/api/webhooks/beehiiv`
- **Events:** `subscription.created`, `subscription.deleted`, `subscription.updated`

Copy the signing secret Beehiiv displays. Add to Vercel env: `BEEHIIV_WEBHOOK_SECRET`. Redeploy.

- [ ] **Step 5: End-to-end test**

Submit the live signup form on vacationpro.co with a fresh email. Within ~60 seconds:
- Beehiiv should show the new subscriber.
- Vercel function logs should show `[beehiiv webhook] enrolled ... in welcome`.
- SendGrid `welcome_series` list should contain the email.
- Welcome email 1 should arrive in the inbox.

- [ ] **Step 6: Checkpoint** — user confirms the full chain works live.

---

## Phase 5: SendGrid → Beehiiv Webhook (Tasks 7-8)

### Task 7: Create `/api/webhooks/sendgrid` route

**Files:**
- Create: `vacationpro/src/lib/sendgrid/webhook.ts`
- Create: `vacationpro/src/app/api/webhooks/sendgrid/route.ts`

**Events handled:**
- `unsubscribe`, `group_unsubscribe`, `spamreport` → `deleteSubscription` on Beehiiv

- [ ] **Step 1: Install SendGrid event webhook verifier**

```bash
cd vacationpro && npm install @sendgrid/eventwebhook
```

- [ ] **Step 2: Write the verifier**

```typescript
// src/lib/sendgrid/webhook.ts
import { EventWebhook, EventWebhookHeader } from '@sendgrid/eventwebhook';

export function verifySendgridWebhook(
  rawBody: string,
  signature: string | null,
  timestamp: string | null
): boolean {
  const publicKey = process.env.SENDGRID_WEBHOOK_PUBLIC_KEY;
  if (!publicKey) throw new Error('Missing SENDGRID_WEBHOOK_PUBLIC_KEY');
  if (!signature || !timestamp) return false;
  const ew = new EventWebhook();
  const ecdsaPublicKey = ew.convertPublicKeyToECDSA(publicKey);
  return ew.verifySignature(ecdsaPublicKey, rawBody, signature, timestamp);
}

export const SG_SIGNATURE_HEADER = EventWebhookHeader.SIGNATURE().toLowerCase();
export const SG_TIMESTAMP_HEADER = EventWebhookHeader.TIMESTAMP().toLowerCase();
```

- [ ] **Step 3: Write the route**

```typescript
// src/app/api/webhooks/sendgrid/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  verifySendgridWebhook,
  SG_SIGNATURE_HEADER,
  SG_TIMESTAMP_HEADER,
} from '@/lib/sendgrid/webhook';
import { deleteSubscription } from '@/lib/beehiiv/client';

interface SgEvent {
  email: string;
  event: string;
  timestamp: number;
  sg_event_id: string;
  sg_message_id: string;
}

const REMOVAL_EVENTS = new Set(['unsubscribe', 'group_unsubscribe', 'spamreport']);

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get(SG_SIGNATURE_HEADER);
  const timestamp = request.headers.get(SG_TIMESTAMP_HEADER);

  let ok = false;
  try {
    ok = verifySendgridWebhook(rawBody, signature, timestamp);
  } catch (err) {
    console.error('[sendgrid webhook] verify error:', err);
    return NextResponse.json({ error: 'verify error' }, { status: 500 });
  }
  if (!ok) {
    console.warn('[sendgrid webhook] invalid signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let events: SgEvent[];
  try {
    events = JSON.parse(rawBody) as SgEvent[];
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  let processed = 0;
  let errors = 0;
  for (const ev of events) {
    if (!REMOVAL_EVENTS.has(ev.event)) continue;
    try {
      await deleteSubscription(ev.email);
      processed++;
      console.log(`[sendgrid webhook] removed ${ev.email} from Beehiiv (${ev.event})`);
    } catch (err) {
      errors++;
      console.error(`[sendgrid webhook] failed to remove ${ev.email}:`, err);
    }
  }

  // Return 200 even with handler errors — SendGrid retries indefinitely otherwise.
  return NextResponse.json({ ok: true, processed, errors });
}
```

- [ ] **Step 4: Checkpoint** — user reviews files.

---

### Task 8: Register SendGrid Event Webhook (live)

**Files:** none (external config).

- [ ] **Step 1: Enable Signed Event Webhook in SendGrid**

SendGrid dashboard → Settings → Mail Settings → Event Webhook → HTTPS Post URL: `https://www.vacationpro.co/api/webhooks/sendgrid`. Check the boxes for `Unsubscribe`, `Group Unsubscribe`, and `Spam Reports` under the "Engagement Events" section.

Enable "Signed Event Webhook". SendGrid displays a public key (ECDSA).

- [ ] **Step 2: Add `SENDGRID_WEBHOOK_PUBLIC_KEY` to Vercel env**

Paste the full public key string from Step 1 (including `-----BEGIN PUBLIC KEY-----` lines). Redeploy.

- [ ] **Step 3: Use SendGrid's "Test Your Integration" button**

Hit the test button in the SendGrid webhook UI. Verify Vercel logs show a 200 response with a valid signature.

- [ ] **Step 4: Live end-to-end test**

Send yourself a welcome email (signup with a test address). Click the unsubscribe link. Within ~60 seconds:
- SendGrid should mark you unsubscribed.
- Vercel logs should show `[sendgrid webhook] removed ... from Beehiiv`.
- Beehiiv should show the subscription deleted.

- [ ] **Step 5: Checkpoint** — user confirms reverse sync works live.

---

## Phase 6: Welcome Sequence Content (Tasks 9-10)

### Task 9: Write Welcome Email 1 (Day 0) per Brand playbook

**Files:**
- Create: `vacationpro/Brand/emails/welcome/01-welcome.html`

**Voice:** per [Brand/playbooks/email.md](../../Brand/playbooks/email.md) §1 — warm, orienting. Subject: `Welcome to VacationPro. Here's how we work.` Preview text: `Boarding Pass every Monday. Deal Alert every Thursday.`

- [ ] **Step 1: Write the email**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to VacationPro</title>
</head>
<body style="margin:0;padding:0;background:#fff8ec;font-family:'Inter',Arial,sans-serif;">
  <div style="display:none;font-size:1px;color:#fff8ec;">Boarding Pass every Monday. Deal Alert every Thursday.</div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#fff8ec;">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">

        <tr><td style="padding:24px 32px;">
          <table width="100%"><tr>
            <td align="left" style="font-family:Inter,Arial,sans-serif;font-weight:700;color:#0f2e1a;font-size:18px;">
              <span style="display:inline-block;width:24px;height:24px;border-radius:50%;background:#4ac850;vertical-align:middle;margin-right:8px;"></span>
              VacationPro
            </td>
            <td align="right" style="font-family:Inter,Arial,sans-serif;font-weight:500;color:#6b7280;font-size:12px;letter-spacing:2px;text-transform:uppercase;">
              WELCOME · 1 OF 5
            </td>
          </tr></table>
        </td></tr>

        <tr><td style="padding:16px 32px 32px;">
          <div style="font-family:Inter,Arial,sans-serif;font-weight:700;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#4ac850;margin-bottom:8px;">YOU'RE IN</div>
          <div style="font-family:Inter,Arial,sans-serif;font-weight:900;font-size:32px;letter-spacing:-0.03em;color:#0f2e1a;line-height:1.1;">Welcome. Here's how we work.</div>
        </td></tr>

        <tr><td style="padding:0 32px 24px;">
          <div style="background:#fff;border-radius:12px;padding:24px;font-family:Inter,Arial,sans-serif;color:#0f2e1a;font-size:16px;line-height:1.55;font-weight:500;">
            <p style="margin:0 0 14px;">Hey — thanks for signing up.</p>
            <p style="margin:0 0 14px;">Quick intro so you know what to expect.</p>
            <p style="margin:0 0 14px;"><strong style="color:#0f2e1a;">We check package deals.</strong> Every week we look at 100+ all-inclusive packages across Cancun, Punta Cana, Jamaica, DR, and a few more. We pull the ones worth your time and explain exactly why — including the catch.</p>
            <p style="margin:0 0 14px;"><strong style="color:#0f2e1a;">You'll get two emails a week from us:</strong></p>
            <ul style="margin:0 0 14px;padding-left:20px;">
              <li style="margin-bottom:6px;"><strong>Monday — Boarding Pass.</strong> The week's verified deals, ranked.</li>
              <li><strong>Thursday — Deal Alert.</strong> One deep dive: is this specific deal worth it?</li>
            </ul>
            <p style="margin:0 0 14px;">Plus 4 more notes from me over the next 10 days to show you how we vet deals. After that, just Boarding Pass and Deal Alert.</p>
            <p style="margin:0;">— The VacationPro Team</p>
          </div>
        </td></tr>

        <tr><td style="padding:0 32px 40px;" align="center">
          <a href="https://www.vacationpro.co" style="display:inline-block;background:#4ac850;color:#fff;text-decoration:none;font-family:Inter,Arial,sans-serif;font-weight:700;font-size:16px;padding:14px 28px;border-radius:8px;">See this week's deals →</a>
        </td></tr>

        <tr><td style="padding:0 32px 48px;" align="center">
          <div style="font-family:Inter,Arial,sans-serif;font-weight:500;font-size:13px;color:#6b7280;line-height:1.5;">
            The best package deals, verified weekly.<br>
            <a href="https://www.vacationpro.co" style="color:#4ac850;text-decoration:none;font-weight:700;">vacationpro.co</a> ·
            <a href="%asm_group_unsubscribe_raw_url%" style="color:#6b7280;text-decoration:underline;">Unsubscribe</a>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
```

- [ ] **Step 2: Paste into SendGrid Automation step 1 (Day 0)**

SendGrid dashboard → Marketing → Automations → [welcome series] → Email 1 → paste HTML. Set subject and preview text per playbook.

- [ ] **Step 3: Checkpoint** — user reviews email on both desktop + mobile previews.

---

### Task 10: Scaffold Welcome Emails 2-5

**Files:**
- Create: `vacationpro/Brand/emails/welcome/02-how-we-check.html`
- Create: `vacationpro/Brand/emails/welcome/03-case-study.html`
- Create: `vacationpro/Brand/emails/welcome/04-segment.html`
- Create: `vacationpro/Brand/emails/welcome/05-feedback.html`

**Per playbook:**

| # | Day | Subject | Theme |
|---|-----|---------|-------|
| 2 | Day 2 | The 3 things we check on every deal | methodology |
| 3 | Day 4 | A deal we almost passed on | case study |
| 4 | Day 7 | What kind of traveler are you? | segmentation |
| 5 | Day 10 | How are we doing? (honest feedback welcome) | feedback |

- [ ] **Step 1: Copy Task 9's HTML to each file as a starting template, then swap the title/body per row above**

Use the **exact same wrapper** (header, container, CTA, footer) from Task 9 for each of the 4 files. Only change:
- Eyebrow label (e.g., `WELCOME · 2 OF 5`)
- Title
- Body paragraphs
- Primary CTA link + text
- Preview text in the hidden preheader

For emails 2-3, the body is ~200-300 words. For email 4 (segmentation), add 2-3 radio-button-style links that point to UTM-tagged URLs (e.g., `?pref=couples`, `?pref=family`, `?pref=adults-only`). For email 5, link to a one-question form (Typeform or Google Forms).

- [ ] **Step 2: Paste each into corresponding SendGrid Automation step**

- [ ] **Step 3: Checkpoint** — user reviews each email.

---

## Phase 7: Cleanup + Verification (Tasks 11-12)

### Task 11: Delete legacy welcome-sequence files

**Files:**
- Delete: `vacationpro/src/lib/email/welcome-sequence.ts`
- Delete: `vacationpro/src/app/api/newsletter/welcome-sequence/route.ts`
- Audit: any cron jobs or scheduled functions that called the legacy welcome-sequence route.

- [ ] **Step 1: Search for callers**

```bash
cd vacationpro && grep -rn "welcome-sequence" src/
```

Expected callers: maybe a Vercel cron config, maybe nothing else. If Vercel cron (vercel.json) references `/api/newsletter/welcome-sequence`, remove that cron entry too.

- [ ] **Step 2: Check vercel.json**

```bash
cat vacationpro/vercel.json
```

If there's a `crons:` entry targeting the welcome-sequence path, remove it.

- [ ] **Step 3: Delete the files**

```bash
rm vacationpro/src/lib/email/welcome-sequence.ts
rm -r vacationpro/src/app/api/newsletter/welcome-sequence
```

- [ ] **Step 4: Verify build still passes**

```bash
cd vacationpro && npm run build
```

Expected: clean build, no TS errors about missing welcome-sequence imports.

- [ ] **Step 5: Checkpoint** — user confirms build.

---

### Task 12: End-to-end regression test

**Files:** none (verification only).

- [ ] **Step 1: Happy path — new signup**

Submit vacationpro.co signup form with a throwaway email.

Verify within 2 minutes:
- [ ] Beehiiv: subscription shown as `active`.
- [ ] SendGrid `welcome_series` list: contact present.
- [ ] Welcome email 1 delivered to inbox.
- [ ] Vercel logs: `[beehiiv webhook] enrolled ... in welcome`.

- [ ] **Step 2: Reverse path — unsubscribe in SendGrid**

Click unsubscribe link in welcome email.

Verify within 2 minutes:
- [ ] SendGrid shows contact unsubscribed.
- [ ] Vercel logs: `[sendgrid webhook] removed ... from Beehiiv`.
- [ ] Beehiiv shows subscription deleted.
- [ ] No further emails in any sequence.

- [ ] **Step 3: Reverse path — unsubscribe in Beehiiv**

Sign up a fresh email. After welcome email 1 lands, go to Beehiiv dashboard and manually delete that subscriber.

Verify within 2 minutes:
- [ ] Vercel logs: `[beehiiv webhook] removed ... from SendGrid`.
- [ ] SendGrid contact archived / removed from welcome_series list.
- [ ] No further welcome emails arrive.

- [ ] **Step 4: Edge — duplicate signup**

Sign up with an email that already exists in Beehiiv.

Expected:
- Beehiiv: subscription reactivated (because `reactivateExisting: true`), not duplicated.
- SendGrid: contact re-added to list (no harm — automation won't re-fire if already enrolled, or will, depending on your SG Automation config).

- [ ] **Step 5: Edge — malformed email**

`curl -X POST` to the subscribe endpoint with `{"email":"not-an-email"}`.

Expected: HTTP 400 `{"error":"A valid email address is required"}`.

- [ ] **Step 6: Checkpoint** — user signs off on end-to-end behavior.

---

## Rollback Plan

If something breaks in prod:

1. **Beehiiv webhook failing?** Disable it in Beehiiv dashboard. New signups still land in Beehiiv but won't trigger SendGrid welcome. No data loss.
2. **SendGrid webhook failing?** Disable event webhook in SendGrid. Unsubs stop syncing to Beehiiv until re-enabled. Contact state drifts — fix by running a reconciliation script (list SendGrid unsubs since disable, delete each from Beehiiv).
3. **Subscribe route broken?** Revert `src/app/api/newsletter/subscribe/route.ts` to the previous version (pre-Task 4). Re-deploy. Signups go back to SendGrid-only temporarily.
4. **Totally borked?** The original SendGrid welcome sequence is still functional if you restore the files deleted in Task 11 from the spec or this plan. Nothing is actually destroyed — the data lives in both places.
