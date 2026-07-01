import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';
import { attachSessionCookie, cleanShortText, cleanUsername, expiredSessionCookieHeader } from '@/lib/authSession';

export const dynamic = 'force-dynamic';

function hashPassword(password: string, username: string) {
  // Dynamic per-user salt derived from their canonical lowercase username and global secret key
  const globalSecret = process.env.AUTH_SALT || process.env.AUTH_SECRET;
  if (!globalSecret && process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SALT or AUTH_SECRET must be set in production.');
  }
  const userSalt = crypto.createHash('sha256').update(username.toLowerCase() + globalSecret).digest('hex');
  return crypto.pbkdf2Sync(password, userSalt, 100000, 64, 'sha512').toString('hex');
}

function safeCompareHash(a: string, b: string) {
  const aBuf = Buffer.from(a, 'hex');
  const bBuf = Buffer.from(b, 'hex');
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function validateCredentials(username: string, password: string) {
  if (!username || username.length < 3 || username.length > 32) {
    return 'Username must be 3-32 letters, numbers, or underscores.';
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Username can only contain letters, numbers, and underscores.';
  }
  if (!password || password.length < 8 || password.length > 128) {
    return 'Password must be 8-128 characters.';
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, username, password, favoriteClub, favoriteNation } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
    }

    const normalizedUsername = cleanUsername(username);
    const normalizedPassword = String(password);
    const validationError = validateCredentials(normalizedUsername, normalizedPassword);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    if (action === 'signup') {
      // 1. Check if profile already exists
      const existing = await prisma.footballIQProfile.findUnique({
        where: { username: normalizedUsername }
      });

      if (existing) {
        return NextResponse.json({ error: 'Username is already taken.' }, { status: 409 });
      }

      // 2. Hash password and create new profile in database
      const passwordHash = hashPassword(normalizedPassword, normalizedUsername);
      const profile = await prisma.footballIQProfile.create({
        data: {
          username: normalizedUsername,
          passwordHash,
          avatarStyle: 'fun-emoji',
          avatarSeed: 'Reputation',
          favoriteClub: cleanShortText(favoriteClub, 80) || 'VAR FC',
          favoriteNation: cleanShortText(favoriteNation, 80) || 'Argentina',
          overallRating: 50,
          predictionRating: 50,
          hotTakeRating: 50,
          managerRating: 50,
          roastScore: 50,
          role: 'FREE',
          season: 'World Cup 2026'
        }
      });

      const response = NextResponse.json({
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
      return attachSessionCookie(response, { profileId: profile.id, username: profile.username, role: profile.role });

    } else if (action === 'signin') {
      // 1. Find profile by username
      const profile = await prisma.footballIQProfile.findUnique({
        where: { username: normalizedUsername }
      });

      if (!profile) {
        return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
      }

      // 2. Validate password hash
      if (!profile.passwordHash) {
        return NextResponse.json({ error: 'This account does not have password sign-in enabled. Use the original sign-in provider.' }, { status: 401 });
      }

      const passwordHash = hashPassword(normalizedPassword, normalizedUsername);
      if (!safeCompareHash(profile.passwordHash, passwordHash)) {
        return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
      }

      const response = NextResponse.json({
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
      return attachSessionCookie(response, { profileId: profile.id, username: profile.username, role: profile.role });
    }

    return NextResponse.json({ error: 'Invalid authentication action.' }, { status: 400 });

  } catch (error) {
    console.error('[Auth API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.headers.append('Set-Cookie', expiredSessionCookieHeader());
  return response;
}
