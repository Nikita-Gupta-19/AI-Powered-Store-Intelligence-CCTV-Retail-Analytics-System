import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

// Fail hard in production if JWT_SECRET is not set
const rawSecret = process.env.JWT_SECRET;
if (!rawSecret && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable must be set in production');
}
const secret = new TextEncoder().encode(rawSecret || 'dev-secret-change-me-in-production');

export async function hashPassword(p: string) {
  return bcrypt.hash(p, 12); // bcrypt rounds: 12 in production, 10 is fine for dev
}

export async function verifyPassword(p: string, h: string) {
  return bcrypt.compare(p, h);
}

export async function signSession(payload: {
  id: string;
  email: string;
  role: string;
  name: string;
}) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function getSession() {
  const token = cookies().get('session')?.value;
  if (!token) return null;
  try {
    return (await jwtVerify(token, secret)).payload as {
      id: string;
      email: string;
      role: string;
      name: string;
    };
  } catch {
    return null;
  }
}

export function setSessionCookie(token: string) {
  cookies().set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}
