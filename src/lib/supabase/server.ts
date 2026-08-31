import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Server (Server Component / Route Handler / Server Action) Supabase client,
 * bound to the anon/public key and the request's cookie jar.
 *
 * Requires the following env vars (see .env.example):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * Never use this for privileged server work; the service-role client lives
 * separately at src/lib/supabase/client.ts for existing API routes only.
 */
export async function createServerSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!supabaseAnonKey) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if there is middleware/proxy refreshing
          // user sessions, or if this call happens in a context (e.g. a
          // page render) that never needs to write cookies itself.
        }
      },
    },
  });
}
