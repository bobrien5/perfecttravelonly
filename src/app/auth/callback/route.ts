import { NextResponse } from 'next/server';

import { createServerSupabase } from '@/lib/supabase/server';

// Exchanges the PKCE auth code from Supabase (email OTP link or OAuth
// redirect) for a session, then sends the user on to `next` (default
// /trips). On any failure, sends them back to sign in with a readable
// error in the query string.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  let next = searchParams.get('next') ?? '/trips';
  if (!next.startsWith('/')) {
    next = '/trips';
  }

  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }

    return NextResponse.redirect(
      `${origin}/auth/signin?error=${encodeURIComponent(error.message)}`
    );
  }

  return NextResponse.redirect(
    `${origin}/auth/signin?error=${encodeURIComponent('Missing sign-in code. Please try again.')}`
  );
}
