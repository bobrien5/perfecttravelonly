import { NextRequest, NextResponse } from 'next/server';
import { parseAnswers, recommendFor } from '@/lib/resorts/recommend';

/**
 * POST /api/recommendations
 *
 * Runs the deterministic matcher on the server (the catalog is too large to
 * ship to phones). Takes quiz answers only; no personal data.
 */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (raw.length > 16_000) return NextResponse.json({ error: 'Request too large.' }, { status: 413 });
  let body: { answers?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  const answers = parseAnswers(body.answers);
  if (!answers) return NextResponse.json({ error: 'Your answers could not be read. Start the quiz again.' }, { status: 400 });
  return NextResponse.json(recommendFor(answers));
}
