const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export interface SessionPayload {
  sessionId: string;
  answers: Record<string, unknown>;
  topMatches: { slug: string; pct: number }[];
  email?: string;
}

export type ValidationResult = { ok: true } | { ok: false; error: string };

export function validateSessionPayload(body: unknown): ValidationResult {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Payload must be an object.' };
  }

  const payload = body as Record<string, unknown>;

  const { sessionId, answers, topMatches, email } = payload;

  if (typeof sessionId !== 'string' || !UUID_RE.test(sessionId)) {
    return { ok: false, error: 'sessionId must be a valid UUID.' };
  }

  if (typeof answers !== 'object' || answers === null || Array.isArray(answers)) {
    return { ok: false, error: 'answers must be an object.' };
  }

  if (!Array.isArray(topMatches)) {
    return { ok: false, error: 'topMatches must be an array.' };
  }

  for (const match of topMatches) {
    if (
      typeof match !== 'object' ||
      match === null ||
      typeof (match as { slug?: unknown }).slug !== 'string' ||
      typeof (match as { pct?: unknown }).pct !== 'number'
    ) {
      return { ok: false, error: 'topMatches entries must have a slug and pct.' };
    }
  }

  if (email !== undefined && (typeof email !== 'string' || !EMAIL_RE.test(email))) {
    return { ok: false, error: 'email must be a valid email address.' };
  }

  return { ok: true };
}
