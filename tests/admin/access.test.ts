import { describe, it, expect, vi, beforeAll } from 'vitest';
import { NextRequest } from 'next/server';

// The Trip Hub branch of middleware imports the Supabase SSR helper; it is not under test here.
vi.mock('@/lib/supabase/middleware', () => ({ updateSession: vi.fn() }));

let middleware: (req: NextRequest) => Promise<Response>;
let createToken: () => Promise<string>;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret-at-least-32-characters-long!!';
  ({ middleware } = await import('@/middleware'));
  ({ createToken } = await import('@/lib/admin/auth'));
});

function req(path: string, token?: string) {
  const r = new NextRequest(new URL(path, 'https://www.vacationpro.co'));
  if (token) r.cookies.set('vp-admin-token', token);
  return r;
}

describe('admin access control', () => {
  it('rejects admin API calls without a session', async () => {
    const res = await middleware(req('/api/admin/leads'));
    expect(res.status).toBe(401);
  });

  it('rejects a forged or wrong-secret token', async () => {
    const res = await middleware(req('/api/admin/revenue', 'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYWRtaW4ifQ.bad'));
    expect(res.status).toBe(401);
  });

  it('allows admin API calls with a valid session', async () => {
    const res = await middleware(req('/api/admin/leads', await createToken()));
    expect(res.headers.get('x-middleware-next')).toBe('1');
  });

  it('keeps the login endpoint reachable', async () => {
    const res = await middleware(req('/api/admin/auth'));
    expect(res.headers.get('x-middleware-next')).toBe('1');
  });

  it('redirects admin pages, including quote requests, to login', async () => {
    const res = await middleware(req('/admin/quotes'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/admin/login');
  });

  it('leaves public quote submission open', async () => {
    const res = await middleware(req('/api/quote-requests'));
    expect(res.headers.get('x-middleware-next')).toBe('1');
  });
});
