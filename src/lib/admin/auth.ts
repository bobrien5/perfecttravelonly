import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-dev-secret-change-me'
);

const COOKIE_NAME = 'vp-admin-token';
const TOKEN_EXPIRY = '24h';

export { COOKIE_NAME };

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) throw new Error('ADMIN_PASSWORD_HASH is not set');
  return bcrypt.compare(password, hash);
}

export async function createToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

/**
 * Server-side admin check for server components, server actions and route
 * handlers. Middleware already guards /admin and /api/admin; this is the
 * second lock for code that reads or writes traveler data directly.
 */
export async function isAdminSession(): Promise<boolean> {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) return false;
  const { cookies } = await import('next/headers');
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return token ? verifyToken(token) : false;
}
