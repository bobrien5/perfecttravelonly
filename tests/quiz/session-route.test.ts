import { describe, it, expect } from 'vitest';
import { validateSessionPayload } from '@/app/api/quiz-session/validate';

describe('validateSessionPayload', () => {
  const good = { sessionId: '3b241101-e2bb-4255-8caf-4136c566a962', answers: { path: 'discover' }, topMatches: [{ slug: 'aruba', pct: 94 }] };
  it('accepts a valid payload', () => expect(validateSessionPayload(good).ok).toBe(true));
  it('rejects bad email', () => expect(validateSessionPayload({ ...good, email: 'nope' }).ok).toBe(false));
  it('rejects missing sessionId', () => expect(validateSessionPayload({ ...good, sessionId: '' }).ok).toBe(false));
});
