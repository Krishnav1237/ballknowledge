import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { attachSessionCookie, cleanUsername } from '@/lib/authSession';

export const dynamic = 'force-dynamic';

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '1047514336049-7gr11k2iirfphv7242m8u8v83q89k6e8.apps.googleusercontent.com';

type GoogleTokenInfo = {
  aud?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  picture?: string;
  exp?: string;
  nonce?: string;
};

async function verifyGoogleJwt(token: string): Promise<GoogleTokenInfo | null> {
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) return null;
  const payload = await res.json() as GoogleTokenInfo;
  const emailVerified = payload.email_verified === true || payload.email_verified === 'true';
  const exp = Number(payload.exp || 0);
  if (payload.aud !== GOOGLE_CLIENT_ID || !payload.email || !emailVerified || exp * 1000 < Date.now()) {
    return null;
  }
  return payload;
}

export async function POST(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid Google authentication payload' }, { status: 400 });
    }

    const { credential, expectedNonce } = body;

    if (!credential || typeof credential !== 'string') {
      return NextResponse.json({ error: 'Credential token is required' }, { status: 400 });
    }

    const payload = await verifyGoogleJwt(credential);
    if (!payload || !payload.email) {
      return NextResponse.json({ error: 'Invalid Google credential token' }, { status: 400 });
    }

    // Nonce enforcement: if the Google JWT contains a nonce, the client MUST have sent
    // the matching expectedNonce that was stored in sessionStorage before the GSI flow.
    // This prevents token replay attacks where an old/stolen credential is submitted again.
    if (payload.nonce) {
      // JWT has a nonce claim — client must prove it holds the matching value
      if (!expectedNonce || payload.nonce !== expectedNonce) {
        return NextResponse.json({ error: 'Invalid or missing Google login nonce' }, { status: 400 });
      }
    }

    const { email, name, picture } = payload;

    // 1. Check if a profile with this email already exists
    let profile = await prisma.footballIQProfile.findUnique({
      where: { email }
    });

    if (!profile) {
      const baseAlias = cleanUsername(name || email.split('@')[0]) || 'Manager';
      for (let attempts = 0; attempts < 12 && !profile; attempts++) {
        const uniqueAlias = attempts === 0
          ? baseAlias
          : cleanUsername(`${baseAlias}_${Math.floor(Math.random() * 10000)}`);
        try {
          profile = await prisma.footballIQProfile.create({
            data: {
              username: uniqueAlias,
              email,
              name,
              avatarStyle: 'fun-emoji',
              avatarSeed: picture || 'Reputation',
              favoriteClub: 'Arsenal',
              favoriteNation: 'England',
              overallRating: 50,
              predictionRating: 50,
              hotTakeRating: 50,
              managerRating: 50,
              roastScore: 50,
              role: 'FREE',
              season: 'Premier League 2026/27'
            }
          });
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            const existingEmail = await prisma.footballIQProfile.findUnique({ where: { email } });
            if (existingEmail) {
              profile = existingEmail;
              break;
            }
            continue;
          }
          throw error;
        }
      }
      if (!profile) {
        return NextResponse.json({ error: 'Could not create a unique manager alias.' }, { status: 409 });
      }
    } else {
      // If profile exists, update Google profile picture if avatarSeed is not a customized upload
      if (picture && (!profile.avatarSeed.startsWith('data:image') && profile.avatarSeed === 'Reputation')) {
        profile = await prisma.footballIQProfile.update({
          where: { id: profile.id },
          data: {
            avatarSeed: picture,
            name: name || profile.name
          }
        });
      }
    }

    const response = NextResponse.json({
      success: true,
      message: 'Successfully authenticated with Google!',
      profile: {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        name: profile.name,
        avatarStyle: profile.avatarStyle,
        avatarSeed: profile.avatarSeed,
        favoriteClub: profile.favoriteClub,
        favoriteNation: profile.favoriteNation,
        overallRating: profile.overallRating,
        predictionRating: profile.predictionRating,
        hotTakeRating: profile.hotTakeRating,
        managerRating: profile.managerRating,
        roastScore: profile.roastScore,
        role: profile.role,
        season: profile.season
      }
    });
    return attachSessionCookie(response, { profileId: profile.id, username: profile.username, role: profile.role });

  } catch (error) {
    console.error('[Google Auth API] POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
