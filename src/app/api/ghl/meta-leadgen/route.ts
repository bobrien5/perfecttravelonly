import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { contacts, opportunities, GHLError } from '@/lib/ghl';

/**
 * Meta Lead Ads → GHL bridge
 *
 * Flow:
 *   1. Meta posts a leadgen webhook to this endpoint
 *   2. We fetch the full lead via Graph API (using the Page Access Token)
 *   3. Map answer values to GHL custom fields
 *   4. Upsert GHL contact + create Marketing Pipeline opportunity
 *
 * One-time setup in Meta App Dashboard:
 *   Webhooks → Page → leadgen
 *   Callback URL: https://www.vacationpro.co/api/ghl/meta-leadgen
 *   Verify Token: <set META_LEADGEN_VERIFY_TOKEN in env>
 *
 * Required env:
 *   META_LEADGEN_VERIFY_TOKEN  – any random string; matches Meta's webhook config
 *   META_APP_SECRET            – from Meta App Dashboard, used to verify X-Hub-Signature-256
 *   META_PAGE_ACCESS_TOKEN     – Page Access Token (long-lived) for the VacationPro page
 */

const PIPELINE_ID = 'p9PU7opJfYkgYvL8mHhU';
const NEW_LEAD_STAGE_ID = 'cee31e33-19cc-4310-8d86-4ea743c3f5f6';

const CF_AGE_RANGE = 'HOpwlwfhgkXu2OfXCWIt';
const CF_DESTINATION = 'wOKgs75uBGMUWHZwihEM';

const META_API_VERSION = process.env.META_API_VERSION || 'v22.0';

interface MetaLeadgenChange {
  field: 'leadgen';
  value: {
    leadgen_id: string;
    page_id: string;
    form_id: string;
    adgroup_id?: string;
    ad_id?: string;
    created_time: number;
  };
}

interface MetaWebhookEntry {
  id: string;
  time: number;
  changes: MetaLeadgenChange[];
}

interface MetaLeadFieldData {
  name: string;
  values: string[];
}

interface MetaLeadResponse {
  id: string;
  created_time: string;
  field_data: MetaLeadFieldData[];
  ad_id?: string;
  ad_name?: string;
  form_id: string;
  is_organic?: boolean;
  platform?: string;
}

// ─── Webhook verification (GET) ──────────────────────────────

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const mode = params.get('hub.mode');
  const token = params.get('hub.verify_token');
  const challenge = params.get('hub.challenge');

  if (
    mode === 'subscribe' &&
    token &&
    token === process.env.META_LEADGEN_VERIFY_TOKEN
  ) {
    return new NextResponse(challenge ?? '', { status: 200 });
  }
  return NextResponse.json({ error: 'verify_token mismatch' }, { status: 403 });
}

// ─── Webhook delivery (POST) ─────────────────────────────────

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  // Verify Meta signature
  const sig = request.headers.get('x-hub-signature-256') || '';
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) {
    console.error('META_APP_SECRET not set; cannot verify webhook');
    return NextResponse.json({ error: 'server misconfigured' }, { status: 500 });
  }
  const expected =
    'sha256=' +
    crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
  if (
    !sig ||
    !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    return NextResponse.json({ error: 'bad signature' }, { status: 401 });
  }

  let body: { entry?: MetaWebhookEntry[]; object?: string };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  if (body.object !== 'page') {
    return NextResponse.json({ ok: true, ignored: 'non-page event' });
  }

  const results = [];
  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      if (change.field !== 'leadgen') continue;
      try {
        const r = await processLead(change.value);
        results.push({ leadgen_id: change.value.leadgen_id, ...r });
      } catch (err) {
        console.error('Lead processing failed:', err);
        results.push({
          leadgen_id: change.value.leadgen_id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }
  return NextResponse.json({ ok: true, processed: results });
}

// ─── Lead processing ─────────────────────────────────────────

async function processLead(value: MetaLeadgenChange['value']) {
  const pageToken = process.env.META_PAGE_ACCESS_TOKEN;
  if (!pageToken) throw new Error('META_PAGE_ACCESS_TOKEN not set');

  // Fetch the full lead from Graph API
  const url = new URL(
    `https://graph.facebook.com/${META_API_VERSION}/${value.leadgen_id}`
  );
  url.searchParams.set('access_token', pageToken);
  url.searchParams.set(
    'fields',
    'id,created_time,field_data,ad_id,ad_name,form_id,is_organic,platform'
  );
  const resp = await fetch(url.toString());
  if (!resp.ok) {
    throw new Error(`Graph fetch failed: ${resp.status} ${await resp.text()}`);
  }
  const lead = (await resp.json()) as MetaLeadResponse;

  const fields: Record<string, string> = {};
  for (const f of lead.field_data) {
    fields[f.name] = f.values?.[0] ?? '';
  }

  // Standard Meta fields
  const fullName = (fields.full_name || fields.first_name || '').trim();
  const [firstName, ...rest] = fullName.split(' ');
  const lastName = rest.join(' ') || fields.last_name || '';
  const email = (fields.email || '').trim().toLowerCase();
  const phone = (fields.phone_number || fields.phone || '').trim();
  const state = fields.state || '';

  if (!email && !phone) {
    throw new Error('No email or phone in lead');
  }

  // Custom qualifying fields (keys match meta_create_lead_form)
  const married = fields.married_3plus_years || '';
  const homeowner = fields.homeowner || '';
  const ageRange = fields.age_range || '';
  const householdIncome = fields.household_income || '';
  const usCitizen = fields.us_citizen || '';
  const majorCard = fields.major_card || '';

  // Tristar qualifying logic — match only if all six checks pass
  const qualified =
    married.toLowerCase() === 'yes' &&
    homeowner.toLowerCase() === 'yes' &&
    ageRange.includes('50') &&
    !ageRange.toLowerCase().includes('under') &&
    !householdIncome.toLowerCase().includes('under') &&
    usCitizen.toLowerCase() === 'yes' &&
    majorCard.toLowerCase() === 'yes';

  const customFields = [
    { id: CF_AGE_RANGE, field_value: ageRange },
    { id: CF_DESTINATION, field_value: lead.ad_name || '' },
  ];

  const tags = ['meta-lead', 'vacationpro'];
  if (qualified) tags.push('tristar-qualified');
  else tags.push('tristar-unqualified');
  if (lead.platform) tags.push(`platform-${lead.platform}`);

  const contact = await contacts.upsert({
    firstName: firstName || 'Unknown',
    lastName: lastName || '',
    email: email || `${phone}@no-email.local`,
    phone,
    source: `Meta Ads — ${lead.ad_name || 'lead form'}`,
    tags,
    customFields,
  });

  let opportunityId: string | null = null;
  try {
    const opp = await opportunities.create({
      pipelineId: PIPELINE_ID,
      pipelineStageId: NEW_LEAD_STAGE_ID,
      contactId: contact.contact.id,
      name: `Meta Lead — ${lead.ad_name || 'Form'} — ${firstName} ${lastName}`.slice(0, 120),
      source: 'Meta Ads',
      status: 'open',
    });
    opportunityId = opp.opportunity.id;
  } catch (oppErr) {
    console.error('Opportunity create failed:', oppErr);
  }

  return {
    contactId: contact.contact.id,
    opportunityId,
    qualified,
    answers: {
      married,
      homeowner,
      ageRange,
      householdIncome,
      usCitizen,
      majorCard,
      state,
    },
  };
}
