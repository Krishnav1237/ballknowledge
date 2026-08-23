import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import crypto from 'crypto';
import { anonymousAuthBody, attachSessionCookie, cleanShortText, cleanUsername, expiredSessionCookieHeader, getSessionFromRequest } from '@/lib/authSession';

export const dynamic = 'force-dynamic';

const CANDIDATE_SALTS = [
  process.env.AUTH_SALT || process.env.AUTH_SECRET || '',
  'ball_knowledge_salt_secret_2026',
  'replace_with_at_least_32_random_bytes',
  'replace_with_32_random_bytes_openssl_rand_hex_32',
  ''
];

function hashPasswordWithSecret(password: string, username: string, secret: string) {
  const userSalt = crypto.createHash('sha256').update(username.toLowerCase() + secret).digest('hex');
  return crypto.pbkdf2Sync(password, userSalt, 100000, 64, 'sha512').toString('hex');
}

function hashPassword(password: string, username: string) {
  const globalSecret = process.env.AUTH_SALT || process.env.AUTH_SECRET;
  if (!globalSecret && process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SALT or AUTH_SECRET must be set in production.');
  }
  return hashPasswordWithSecret(password, username, globalSecret || '');
}

function verifyPasswordHash(password: string, username: string, storedHash: string) {
  for (const saltSecret of CANDIDATE_SALTS) {
    const candidateHash = hashPasswordWithSecret(password, username, saltSecret);
    if (safeCompareHash(storedHash, candidateHash)) {
      const isPrimary = saltSecret === (process.env.AUTH_SALT || process.env.AUTH_SECRET || '');
      return { matches: true, isPrimary };
    }
  }
  return { matches: false, isPrimary: false };
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

function validateEmail(email: string) {
  if (!email || email.length < 5 || email.length > 254) {
    return 'Email must be 5-254 characters.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email address format.';
  }
  return null;
}

export async function POST(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid authentication payload.' }, { status: 400 });
    }

    const { action, username, password, email, favoriteClub, favoriteNation } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username/Email and password are required.' }, { status: 400 });
    }

    const normalizedPassword = String(password);

    if (action === 'signup') {
      const normalizedUsername = cleanUsername(username);
      const validationError = validateCredentials(normalizedUsername, normalizedPassword);
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
      }

      if (!email) {
        return NextResponse.json({ error: 'Email is required for signup.' }, { status: 400 });
      }

      const normalizedEmail = String(email).trim().toLowerCase();
      const emailError = validateEmail(normalizedEmail);
      if (emailError) {
        return NextResponse.json({ error: emailError }, { status: 400 });
      }

      // Check if username already exists
      const existingUser = await prisma.footballIQProfile.findUnique({
        where: { username: normalizedUsername }
      });
      if (existingUser) {
        return NextResponse.json({ error: 'Username is already taken.' }, { status: 409 });
      }

      // Check if email already registered
      const existingEmail = await prisma.footballIQProfile.findUnique({
        where: { email: normalizedEmail }
      });
      if (existingEmail) {
        return NextResponse.json({ error: 'Email is already registered.' }, { status: 409 });
      }

      const passwordHash = hashPassword(normalizedPassword, normalizedUsername);
      let profile;
      try {
        profile = await prisma.footballIQProfile.create({
          data: {
            username: normalizedUsername,
            email: normalizedEmail,
            passwordHash,
            avatarStyle: 'fun-emoji',
            avatarSeed: 'Reputation',
            favoriteClub: cleanShortText(favoriteClub, 80) || 'Arsenal',
            favoriteNation: cleanShortText(favoriteNation, 80) || 'England',
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
          return NextResponse.json({ error: 'Username or email is already taken.' }, { status: 409 });
        }
        throw error;
      }

      const response = NextResponse.json({
        success: true,
        message: 'Account created successfully!',
        profile: {
          id: profile.id,
          username: profile.username,
          email: profile.email,
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
      const identifier = String(username).trim();
      const isEmail = identifier.includes('@');
      let profile = null;

      if (isEmail) {
        profile = await prisma.footballIQProfile.findFirst({
          where: { email: { equals: identifier, mode: 'insensitive' } }
        });
      } else {
        const normalizedUsername = cleanUsername(identifier);
        profile = await prisma.footballIQProfile.findFirst({
          where: {
            OR: [
              { username: { equals: normalizedUsername, mode: 'insensitive' } },
              { username: { equals: identifier, mode: 'insensitive' } }
            ]
          }
        });
      }

      if (!profile) {
        return NextResponse.json({ error: 'Invalid username/email or password.' }, { status: 401 });
      }

      // Validate password hash
      if (!profile.passwordHash) {
        return NextResponse.json({ error: 'This account does not have password sign-in enabled. Use the original sign-in provider.' }, { status: 401 });
      }

      const verification = verifyPasswordHash(normalizedPassword, profile.username, profile.passwordHash);
      if (!verification.matches) {
        return NextResponse.json({ error: 'Invalid username/email or password.' }, { status: 401 });
      }

      // Automatically upgrade legacy salt hashes to current primary salt
      if (!verification.isPrimary) {
        const newPrimaryHash = hashPassword(normalizedPassword, profile.username);
        try {
          await prisma.footballIQProfile.update({
            where: { id: profile.id },
            data: { passwordHash: newPrimaryHash }
          });
        } catch (e) {
          console.warn('[Auth API] Failed to auto-upgrade password hash:', e);
        }
      }

      const response = NextResponse.json({
        success: true,
        message: 'Access granted. Welcome back, Manager!',
        profile: {
          id: profile.id,
          username: profile.username,
          email: profile.email,
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

export async function GET(request: Request) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(anonymousAuthBody());
    }

    const profile = await prisma.footballIQProfile.findUnique({
      where: { id: session.profileId },
      include: {
        matchCards: true,
        predictions: {
          include: {
            hotTakes: true
          }
        }
      }
    });

    if (!profile) {
      return NextResponse.json(anonymousAuthBody());
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
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
        season: profile.season,
        email: profile.email,
        name: profile.name,
        inputImage: profile.inputImage,
        collectedCards: profile.matchCards.map(c => c.id)
      },
      predictions: profile.predictions
    });
  } catch (error) {
    console.error('Error in GET /api/auth:', error);
    return NextResponse.json(anonymousAuthBody(true));
  }
}
