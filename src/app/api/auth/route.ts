import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function hashPassword(password: string, username: string) {
  // Dynamic per-user salt derived from their canonical lowercase username and global secret key
  const globalSecret = process.env.AUTH_SALT || 'ball_knowledge_salt_secret_2026';
  const userSalt = crypto.createHash('sha256').update(username.toLowerCase() + globalSecret).digest('hex');
  return crypto.pbkdf2Sync(password, userSalt, 100000, 64, 'sha512').toString('hex');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, username, password, favoriteClub, favoriteNation } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
    }

    const cleanUsername = username.trim().replace(/\s+/g, '_');

    if (action === 'signup') {
      // 1. Check if profile already exists
      const existing = await prisma.footballIQProfile.findUnique({
        where: { username: cleanUsername }
      });

      if (existing) {
        return NextResponse.json({ error: 'Username is already taken.' }, { status: 409 });
      }

      // 2. Hash password and create new profile in database
      const passwordHash = hashPassword(password, cleanUsername);
      const profile = await prisma.footballIQProfile.create({
        data: {
          username: cleanUsername,
          passwordHash,
          avatarStyle: 'fun-emoji',
          avatarSeed: 'Reputation',
          favoriteClub: favoriteClub || 'VAR FC',
          favoriteNation: favoriteNation || 'Argentina',
          overallRating: 50,
          predictionRating: 50,
          hotTakeRating: 50,
          managerRating: 50,
          roastScore: 50,
          role: 'FREE',
          season: 'World Cup 2026'
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Account created successfully!',
        profile: {
          id: profile.id,
          username: profile.username,
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

    } else if (action === 'signin') {
      // 1. Find profile by username
      const profile = await prisma.footballIQProfile.findUnique({
        where: { username: cleanUsername }
      });

      if (!profile) {
        return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
      }

      // 2. Validate password hash
      const passwordHash = hashPassword(password, cleanUsername);
      if (profile.passwordHash && profile.passwordHash !== passwordHash) {
        return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
      }

      // 3. Fallback migration if profile was created without a password previously
      if (!profile.passwordHash) {
        await prisma.footballIQProfile.update({
          where: { id: profile.id },
          data: { passwordHash }
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Access granted. Welcome back, Manager!',
        profile: {
          id: profile.id,
          username: profile.username,
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
    }

    return NextResponse.json({ error: 'Invalid authentication action.' }, { status: 400 });

  } catch (error) {
    console.error('[Auth API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
