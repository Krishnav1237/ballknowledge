import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

function decodeGoogleJwt(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (payloadBase64.length % 4)) % 4;
    const padded = payloadBase64 + '='.repeat(padLen);
    const decodedStr = Buffer.from(padded, 'base64').toString('utf8');
    return JSON.parse(decodedStr);
  } catch (err) {
    console.error('[Google Auth API] JWT decode failed:', err);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json({ error: 'Credential token is required' }, { status: 400 });
    }

    const payload = decodeGoogleJwt(credential);
    if (!payload || !payload.email) {
      return NextResponse.json({ error: 'Invalid Google credential token' }, { status: 400 });
    }

    const { email, name, picture } = payload;

    // 1. Check if a profile with this email already exists
    let profile = await prisma.footballIQProfile.findUnique({
      where: { email }
    });

    if (!profile) {
      // 2. If no profile exists, create a unique username (alias) from their email or name
      const baseAlias = name ? name.trim().replace(/\s+/g, '_') : email.split('@')[0];
      let uniqueAlias = baseAlias.replace(/[^a-zA-Z0-9_]/g, '');
      
      // Ensure unique constraint in DB
      let existingAlias = await prisma.footballIQProfile.findUnique({
        where: { username: uniqueAlias }
      });
      let attempts = 0;
      while (existingAlias && attempts < 10) {
        uniqueAlias = `${baseAlias}_${Math.floor(Math.random() * 1000)}`;
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

    return NextResponse.json({
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

  } catch (error) {
    console.error('[Google Auth API] POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
