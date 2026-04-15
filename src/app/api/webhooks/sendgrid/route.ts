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

  return NextResponse.json({ ok: true, processed, errors });
}
