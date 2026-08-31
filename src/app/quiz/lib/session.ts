const SESSION_STORAGE_KEY = 'vacationpro.quiz.session.v1';

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
