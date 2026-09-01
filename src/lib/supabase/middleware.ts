import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Refreshes the Supabase auth session cookies for a request, following the
 * @supabase/ssr Next.js guide
 * (supabase.com/docs/guides/auth/server-side/nextjs). Only called for
 * /trips/:path* (see src/middleware.ts and its matcher).
 *
 * This does not gate access itself. Each /trips page already checks auth
 * server-side and redirects to /auth/signin when signed out (see
 * getServerUser() in src/lib/supabase/server.ts and the pages under
 * src/app/trips). This helper's only job is to keep the auth cookies fresh
 * on the way in, so those page-level checks always see an up-to-date
 * session instead of a stale/expired one.
 *
 * No-ops (passes the request through unchanged) when the Supabase anon key
 * env vars are absent, e.g. a preview/dev environment without Supabase
 * configured yet, so it never crashes the request.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request (per the guide).
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: do not run any other code between createServerClient() and
  // this call. A stray call to a Supabase auth method in between can cause
  // the user's session to be randomly refreshed or lost (per the guide).
  //
  // This return value is intentionally unused: the guide's redirect-if-
  // signed-out behavior is handled per-page (see the comment above), so all
  // this call needs to do is trigger the token refresh and let setAll()
  // above write the refreshed cookies onto supabaseResponse.
  await supabase.auth.getClaims();

  return supabaseResponse;
}
