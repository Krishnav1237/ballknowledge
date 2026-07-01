import { NextResponse } from 'next/server';
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
    const { credential, expectedNonce } = await request.json();

    if (!credential) {
      return NextResponse.json({ error: 'Credential token is required' }, { status: 400 });
    }

    const payload = await verifyGoogleJwt(credential);
    if (!payload || !payload.email) {
      return NextResponse.json({ error: 'Invalid Google credential token' }, { status: 400 });
    }

    if (expectedNonce && payload.nonce !== expectedNonce) {
      return NextResponse.json({ error: 'Invalid Google login nonce' }, { status: 400 });
    }

    const { email, name, picture } = payload;

    // 1. Check if a profile with this email already exists
    let profile = await prisma.footballIQProfile.findUnique({
      where: { email }
    });

    if (!profile) {
      // 2. If no profile exists, create a unique username (alias) from their email or name
      const baseAlias = cleanUsername(name || email.split('@')[0]) || 'Manager';
      let uniqueAlias = baseAlias;
      
      // Ensure unique constraint in DB
      let existingAlias = await prisma.footballIQProfile.findUnique({
        where: { username: uniqueAlias }
      });
      let attempts = 0;
      while (existingAlias && attempts < 10) {
        uniqueAlias = cleanUsername(`${baseAlias}_${Math.floor(Math.random() * 1000)}`);
        existingAlias = await prisma.footballIQProfile.findUnique({
          where: { username: uniqueAlias }
        });
        attempts++;
      }

      // Create new profile with Google Auth details
      profile = await prisma.footballIQProfile.create({
        data: {
          username: uniqueAlias,
          email,
          name,
          avatarStyle: 'fun-emoji',
          avatarSeed: picture || 'Reputation',
          favoriteClub: 'VAR FC',
          favoriteNation: 'Argentina',
          overallRating: 50,
          predictionRating: 50,
          hotTakeRating: 50,
          managerRating: 50,
          roastScore: 50,
          role: 'FREE',
          season: 'World Cup 2026'
        }
      });
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
