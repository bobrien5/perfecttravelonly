import { createHash } from 'crypto';
import { after, NextRequest, NextResponse } from 'next/server';
import { handleQuoteSubmission } from '@/lib/quote/handle';
import { sendQuoteNotifications } from '@/lib/quote/notify';
import { supabaseQuoteStore } from '@/lib/quote/store';

const MAX_BODY_BYTES = 32 * 1024;

function ipHash(req: NextRequest): string | null {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '';
  if (!ip) return null;
  const salt = process.env.QUOTE_IP_SALT || process.env.JWT_SECRET || 'vacationpro';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32);
}

/**
 * POST /api/quote-requests
 *
 * Validates on the server, stores the request durably, and only then reports
 * success with a reference. Email, CRM and newsletter (consent only) run
 * after the response and their outcome is written back to the row, so a
 * request stays visible in /admin/quotes even if every notification fails.
 */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (Buffer.byteLength(raw) > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: 'Request too large.', retryable: false }, { status: 413 });
  }
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.', retryable: true }, { status: 400 });
  }

  const outcome = await handleQuoteSubmission(body, { store: supabaseQuoteStore, ipHash: ipHash(req) });

  if (outcome.created) {
    const { stored, input } = outcome.created;
    after(async () => {
      try {
        const result = await sendQuoteNotifications(input, stored);
        await supabaseQuoteStore.recordNotification(stored.id, result);
      } catch (err) {
        console.error('quote notification step failed:', err);
        try {
          await supabaseQuoteStore.recordNotification(stored.id, {
            travelerEmail: 'failed',
            advisorEmail: 'failed',
            crm: 'failed',
            errors: [err instanceof Error ? err.message : 'notification error'],
            at: new Date().toISOString(),
          });
        } catch {
          // the request itself is already stored; nothing more to do
        }
      }
    });
  }

  return NextResponse.json(outcome.body, { status: outcome.status });
}
