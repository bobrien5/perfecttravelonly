import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { validateSessionPayload, SessionPayload } from './validate';

const MAX_BODY_BYTES = 10 * 1024; // 10KB

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: 'Request body too large.' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body.' }, { status: 400 });
  }

  const result = validateSessionPayload(body);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  const { sessionId, answers, topMatches, email } = body as SessionPayload;

  try {
    const { error } = await supabase
      .from('quiz_sessions')
      .upsert(
        {
          session_id: sessionId,
          answers,
          top_matches: topMatches,
          email: email ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'session_id' }
      );

    if (error) {
      console.error('quiz-session upsert error:', error);
      return NextResponse.json({ ok: false, error: 'storage' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('quiz-session upsert threw:', err);
    return NextResponse.json({ ok: false, error: 'storage' }, { status: 500 });
  }
}
