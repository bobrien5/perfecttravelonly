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

  // Skip login page, all admin API routes, and auth API
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
  matcher: ['/admin/:path*', '/trips/:path*'],
};
