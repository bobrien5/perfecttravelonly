import { describe, it, expect } from 'vitest';
import { validateSessionPayload } from '@/app/api/quiz-session/validate';

describe('validateSessionPayload', () => {
  const good = { sessionId: '3b241101-e2bb-4255-8caf-4136c566a962', answers: { path: 'discover' }, topMatches: [{ slug: 'aruba', pct: 94 }] };
  it('accepts a valid payload', () => expect(validateSessionPayload(good).ok).toBe(true));
  it('rejects bad email', () => expect(validateSessionPayload({ ...good, email: 'nope' }).ok).toBe(false));
  it('rejects missing sessionId', () => expect(validateSessionPayload({ ...good, sessionId: '' }).ok).toBe(false));
  it('accepts topMatches at the 16-entry cap', () => {
    const topMatches = Array.from({ length: 16 }, (_, i) => ({ slug: `dest-${i}`, pct: 50 }));
    expect(validateSessionPayload({ ...good, topMatches }).ok).toBe(true);
  });
  it('rejects topMatches over the 16-entry cap', () => {
    const topMatches = Array.from({ length: 17 }, (_, i) => ({ slug: `dest-${i}`, pct: 50 }));
    expect(validateSessionPayload({ ...good, topMatches }).ok).toBe(false);
  });
  it('accepts an email at the 254-char cap', () => {
    const email = `${'a'.repeat(242)}@example.com`; // 254 chars
    expect(email.length).toBe(254);
    expect(validateSessionPayload({ ...good, email }).ok).toBe(true);
  });
  it('rejects an email over the 254-char cap', () => {
    const email = `${'a'.repeat(243)}@example.com`; // 255 chars
    expect(email.length).toBe(255);
    expect(validateSessionPayload({ ...good, email }).ok).toBe(false);
  });
});
