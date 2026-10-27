import { NextRequest, NextResponse } from 'next/server';
import { isResortQuizState, matchResorts, type TripAnswers } from '@vacationpro/engine';
import { escapeHtml, sendTransactional, simpleEmailHtml } from '@/lib/email/transactional';
import { subscribeWithConsent } from '@/lib/newsletter/beehiiv';
import { ACTIVE_RESORTS, destinationName } from '@/lib/resorts/catalog';
import { supabase } from '@/lib/supabase/client';
import { EMAIL_RE, UUID_RE } from '@/app/api/quiz-session/validate';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vacationpro.co';
const ROLE: Record<string, string> = { 'best-overall': 'Best overall fit', 'best-value': 'Best value', 'worth-the-upgrade': 'Worth the upgrade', 'also-strong': 'Also a strong fit' };

/**
 * POST /api/quiz-results/email
 *
 * Optional, never required to see results. Re-runs the deterministic matcher
 * on the server from the submitted answers (so the email cannot carry
 * arbitrary client text), sends it as a transactional email, and records the
 * email and the separate marketing consent on the quiz session.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const sessionId = typeof body.sessionId === 'string' && UUID_RE.test(body.sessionId) ? body.sessionId : null;
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ ok: false, error: 'Enter a valid email address.' }, { status: 400 });
  }
  // Reuse the quiz state guard so only well-formed answers are matched.
  if (!isResortQuizState({ step: 'results', answers: body.answers, returnTo: null })) {
    return NextResponse.json({ ok: false, error: 'Your answers could not be read. Refresh and try again.' }, { status: 400 });
  }
  const answers = body.answers as TripAnswers;
  const marketing = body.marketingConsent === true;
  const result = matchResorts(answers, ACTIVE_RESORTS);

  const items = result.recommendations
    .map(
      (r) => `<div style="border:1px solid #e5e7eb;border-radius:10px;padding:14px 16px;margin:0 0 12px;">
<p style="margin:0;font-size:12px;font-weight:800;text-transform:uppercase;color:#007b41;">${ROLE[r.role]}</p>
<p style="margin:4px 0 6px;font-size:18px;font-weight:800;">${escapeHtml(r.resort.name)}</p>
<p style="margin:0 0 6px;color:#4b5563;">${escapeHtml(destinationName(r.resort.destination))}</p>
<p style="margin:0 0 6px;">${escapeHtml(r.whyItFits.join(' '))}</p>
<p style="margin:0 0 6px;"><strong>Tradeoff:</strong> ${escapeHtml(r.tradeoff)}</p>
<p style="margin:0;"><a href="${SITE_URL}/resorts/${r.resort.id}" style="color:#007b41;font-weight:700;">Resort details</a> · <a href="${SITE_URL}/concierge-planning?resort=${r.resort.id}&from=results-email#quote" style="color:#007b41;font-weight:700;">Get a quote from Brendan</a></p>
</div>`,
    )
    .join('');
  const html = simpleEmailHtml(
    'Your VacationPro resort matches',
    `${items || `<p>${escapeHtml(result.limitations.join(' '))}</p>`}
<p style="font-size:13px;color:#6b7280;margin:16px 0 0;">Prices on VacationPro are estimates, not live rates. <a href="${SITE_URL}/quiz" style="color:#007b41;">Open your results</a> on the same device to compare or adjust them.</p>`,
  );
  const text = result.recommendations.map((r) => `${ROLE[r.role]}: ${r.resort.name}\n${SITE_URL}/resorts/${r.resort.id}`).join('\n\n');

  const sent = await sendTransactional({ to: email, subject: 'Your VacationPro resort matches', html, text });
  if (sent !== 'sent') {
    return NextResponse.json(
      { ok: false, error: sent === 'skipped' ? 'Email is not available right now. Your results are saved on this device.' : 'We could not send that email. Please try again.' },
      { status: 503 },
    );
  }

  if (sessionId) {
    try {
      await supabase
        .from('quiz_sessions')
        .update({ email, results_emailed_at: new Date().toISOString(), marketing_consent: marketing })
        .eq('session_id', sessionId);
    } catch (err) {
      console.error('quiz-results email: session update failed', err);
    }
  }
  if (marketing) await subscribeWithConsent(email, { source: 'vacationpro', medium: 'quiz', campaign: 'quiz-results' });

  return NextResponse.json({ ok: true });
}
