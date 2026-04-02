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
  console.log('[auth] hash length:', hash.length, 'starts with:', hash.substring(0, 4));
  console.log('[auth] password length:', password.length);
  const result = await bcrypt.compare(password, hash);
  console.log('[auth] compare result:', result);
  return result;
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
