import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

import { updateSession } from '@/lib/supabase/middleware';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-dev-secret-change-me'
);

const COOKIE_NAME = 'vp-admin-token';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Trip Hub: refresh the Supabase session cookies on the way in. Auth
  // gating itself stays page-level (see src/lib/supabase/middleware.ts);
  // this branch never touches the /admin logic below.
  if (pathname.startsWith('/trips')) {
    return updateSession(request);
  }

  // Admin API routes need the same admin session as the admin pages. They
  // were previously reachable without it (this branch skipped all of /api/),
  // which exposed lead data. /api/admin/auth stays open so login can work.
  if (pathname.startsWith('/api/admin/')) {
    if (pathname === '/api/admin/auth') return NextResponse.next();
    const apiToken = request.cookies.get(COOKIE_NAME)?.value;
    if (apiToken) {
      try {
        await jwtVerify(apiToken, JWT_SECRET);
        return NextResponse.next();
      } catch {
        // fall through to 401
      }
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Skip login page and all other API routes
  if (pathname === '/admin/login' || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: ['/admin/:path*', '/trips/:path*', '/api/admin/:path*'],
};
