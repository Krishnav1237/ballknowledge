import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const STATE_COOKIE = 'bk_oauth_state';
const STATE_TTL_SECONDS = 300; // 5 minutes

/**
 * GET /api/auth/oauth-init?provider=discord|facebook
 *
 * Generates a cryptographically random CSRF state token, stores it in a
 * short-lived HttpOnly cookie, and returns the OAuth authorization URL for
 * the requested provider. The client should redirect (or open a popup) to
 * the returned URL.
 *
 * The state token is verified on the callback route before processing any
 * code exchange, preventing login CSRF attacks.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider');

  if (!provider || !['discord', 'facebook'].includes(provider)) {
    return NextResponse.json({ error: 'Invalid provider. Must be discord or facebook.' }, { status: 400 });
  }

  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (process.env.NODE_ENV === 'production' && !configuredOrigin) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_SITE_URL must be configured in production.' }, { status: 500 });
  }
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
  const appOrigin = configuredOrigin || `${protocol}://${host}`;

  // Generate a cryptographically random CSRF state token
  const stateToken = crypto.randomBytes(24).toString('hex');

  let authUrl: string;

  if (provider === 'discord') {
    const clientId = process.env.DISCORD_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({ error: 'Discord OAuth is not configured on this server.' }, { status: 503 });
    }
    const redirectUri = encodeURIComponent(`${appOrigin}/api/auth/callback?provider=discord`);
    const scopes = encodeURIComponent('identify email');
    authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}&state=${stateToken}`;
  } else {
    // facebook
    const clientId = process.env.FACEBOOK_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({ error: 'Facebook OAuth is not configured on this server.' }, { status: 503 });
    }
    const redirectUri = encodeURIComponent(`${appOrigin}/api/auth/callback?provider=facebook`);
    authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=email&state=${stateToken}`;
  }

  const cookieAttrs = [
    `${STATE_COOKIE}=${stateToken}`,
    'Path=/api/auth',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${STATE_TTL_SECONDS}`,
  ];
  if (process.env.NODE_ENV === 'production') cookieAttrs.push('Secure');

  const response = NextResponse.json({ url: authUrl });
  response.headers.set('Set-Cookie', cookieAttrs.join('; '));
  return response;
}
