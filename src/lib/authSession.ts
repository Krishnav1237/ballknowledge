import crypto from 'crypto';
import { NextResponse } from 'next/server';

export const SESSION_COOKIE = 'bk_session';

export type SessionPayload = {
  profileId: string;
  username: string;
  role: string;
  exp: number;
};

const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET || process.env.AUTH_SALT;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET or AUTH_SALT must be set in production.');
  }
  return secret || 'dev-only-ballknowledge-session-secret';
}

function base64url(input: string | Buffer) {
  return Buffer.from(input).toString('base64url');
}

function signPayload(payloadB64: string) {
  return crypto.createHmac('sha256', getAuthSecret()).update(payloadB64).digest('base64url');
}

function timingSafeEqualString(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function createSessionToken(input: Omit<SessionPayload, 'exp'>, maxAgeSeconds = ONE_WEEK_SECONDS) {
  const payload: SessionPayload = {
    ...input,
    exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
  };
  const payloadB64 = base64url(JSON.stringify(payload));
  return `${payloadB64}.${signPayload(payloadB64)}`;
}

export function verifySessionToken(token?: string | null): SessionPayload | null {
  if (!token) return null;
  const [payloadB64, sig] = token.split('.');
  if (!payloadB64 || !sig) return null;
  const expected = signPayload(payloadB64);
  if (!timingSafeEqualString(sig, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as SessionPayload;
    if (!payload.profileId || !payload.username || !payload.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(request: Request): SessionPayload | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  const token = cookie ? decodeURIComponent(cookie.slice(SESSION_COOKIE.length + 1)) : null;
  return verifySessionToken(token);
}

export function sessionCookieHeader(token: string, maxAgeSeconds = ONE_WEEK_SECONDS) {
  const attrs = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (process.env.NODE_ENV === 'production') attrs.push('Secure');
  return attrs.join('; ');
}

export function expiredSessionCookieHeader() {
  const attrs = [
    `${SESSION_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (process.env.NODE_ENV === 'production') attrs.push('Secure');
  return attrs.join('; ');
}

export function attachSessionCookie<T>(response: NextResponse<T>, input: Omit<SessionPayload, 'exp'>) {
  const token = createSessionToken(input);
  response.headers.append('Set-Cookie', sessionCookieHeader(token));
  return response;
}

export function requireSession(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }),
    };
  }
  return { session, response: null };
}

export function cleanUsername(input: unknown) {
  return String(input || '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .slice(0, 32);
}

export function cleanShortText(input: unknown, maxLength = 80) {
  return String(input || '').trim().slice(0, maxLength);
}
