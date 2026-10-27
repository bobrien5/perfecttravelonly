import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

// The route must refuse before it ever looks up a user or calls Stripe.
const getServerUser = vi.fn();
vi.mock('@/lib/supabase/server', () => ({ getServerUser, createServerSupabase: vi.fn() }));

describe('Vacation Vault sales are closed', () => {
  it('refuses new checkouts with 410 and never reaches Stripe or auth', async () => {
    const { POST } = await import('@/app/api/stripe/vault-checkout/route');
    const res = await POST(new NextRequest('https://x.test/api/stripe/vault-checkout', { method: 'POST', body: JSON.stringify({ interval: 'year' }) }));
    expect(res.status).toBe(410);
    expect((await res.json()).error).toMatch(/no longer accepting new members/);
    expect(getServerUser).not.toHaveBeenCalled();
  });
});
