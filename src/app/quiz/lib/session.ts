import { QuizAnswers } from '@/lib/match/types';

const SESSION_STORAGE_KEY = 'vacationpro.quiz.session.v1';

export interface SessionPayload {
  sessionId: string;
  answers: QuizAnswers;
  topMatches: { slug: string; pct: number }[];
  email?: string;
}

/**
 * Single implementation of the quiz-session POST, shared by every screen
 * that fires it (previously duplicated in Matches.tsx and Vibes.tsx).
 * Resolves to `true` when the server accepted the session (HTTP ok), and
 * `false` on a non-ok response or a network/throw failure. Never rejects.
 */
export async function postSession(payload: SessionPayload): Promise<boolean> {
  try {
    const res = await fetch('/api/quiz-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (err) {
    console.error('quiz-session post failed:', err);
    return false;
  }
}

export function getSessionId(): string {
  if (typeof window === 'undefined') {
    return crypto.randomUUID();
  }

  try {
    const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;

    const created = crypto.randomUUID();
    window.localStorage.setItem(SESSION_STORAGE_KEY, created);
    return created;
  } catch {
    return crypto.randomUUID();
  }
}
