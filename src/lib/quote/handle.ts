import { DEFAULT_COMMISSION_RATE, QUOTE_DUPLICATE_WINDOW_MINUTES, QUOTE_RATE_LIMIT_PER_HOUR } from './config';
import { StoreError, type QuoteStore, type StoredQuote } from './store';
import { makeReference, validateQuote, type QuoteInput } from './validate';

export type QuoteOutcome =
  | { status: 201 | 200; body: { ok: true; reference: string; duplicate: boolean }; created: { stored: StoredQuote; input: QuoteInput } | null }
  | { status: 400 | 429 | 503; body: { ok: false; error: string; fields?: Record<string, string>; retryable: boolean }; created: null };

/**
 * Quote submission logic, independent of Next so it can be tested with a fake
 * store. Success is only returned after the row is durably stored; the caller
 * sends notifications afterwards and records their result on the row.
 */
export async function handleQuoteSubmission(
  body: unknown,
  ctx: { store: QuoteStore; ipHash: string | null; now?: number; random?: () => number },
): Promise<QuoteOutcome> {
  const now = ctx.now ?? Date.now();
  const v = validateQuote(body, now);
  if (!v.ok) {
    return {
      status: 400,
      body: { ok: false, error: v.spam ? 'We could not accept that request. Please try again.' : 'Some details need attention.', fields: v.spam ? undefined : v.errors, retryable: true },
      created: null,
    };
  }
  const input = v.value;

  try {
    // A retried submission (double tap, network retry) returns the original.
    const existing = await ctx.store.findByIdempotencyKey(input.idempotencyKey);
    if (existing) return { status: 200, body: { ok: true, reference: existing.reference, duplicate: true }, created: null };

    const dupSince = new Date(now - QUOTE_DUPLICATE_WINDOW_MINUTES * 60_000).toISOString();
    const dup = await ctx.store.findRecentDuplicate(input.email, input.selectedResortId, dupSince);
    if (dup) return { status: 200, body: { ok: true, reference: dup.reference, duplicate: true }, created: null };

    if (ctx.ipHash) {
      const hourAgo = new Date(now - 3_600_000).toISOString();
      const recent = await ctx.store.countRecentByIp(ctx.ipHash, hourAgo);
      if (recent >= QUOTE_RATE_LIMIT_PER_HOUR) {
        return { status: 429, body: { ok: false, error: 'Too many requests from this connection. Please try again later.', retryable: false }, created: null };
      }
    }

    // References are unique in the table; retry on the rare collision.
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const stored = await ctx.store.insert(input, {
          reference: makeReference(ctx.random),
          ipHash: ctx.ipHash,
          commissionRate: DEFAULT_COMMISSION_RATE,
        });
        return { status: 201, body: { ok: true, reference: stored.reference, duplicate: false }, created: { stored, input } };
      } catch (err) {
        const isUnique = err instanceof StoreError && err.code === '23505';
        if (isUnique) {
          // Same idempotency key raced in from a parallel retry.
          const raced = await ctx.store.findByIdempotencyKey(input.idempotencyKey);
          if (raced) return { status: 200, body: { ok: true, reference: raced.reference, duplicate: true }, created: null };
          continue; // reference collision, try a new one
        }
        throw err;
      }
    }
    throw new StoreError('Could not allocate a reference.');
  } catch (err) {
    console.error('quote submission storage error:', err);
    return {
      status: 503,
      body: { ok: false, error: 'We could not save your request just now. Nothing was submitted. Please try again in a moment.', retryable: true },
      created: null,
    };
  }
}
