import { prisma } from '@/lib/db';
import { cleanUsername, createSessionToken, sessionCookieHeader } from '@/lib/authSession';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); 
    const provider = searchParams.get('provider') || state; 

    if (!code || !provider) {
      return htmlErrorResponse('Code and provider parameters are required for authentication.');
    }

    const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
    const appOrigin = configuredOrigin || `${protocol}://${host}`;
    const redirectUri = `${appOrigin}/api/auth/callback?provider=${provider}`;

    let email = '';
    let name = '';
    let avatarUrl = '';

    if (provider === 'discord') {
      const clientId = process.env.DISCORD_CLIENT_ID || '';
      const clientSecret = process.env.DISCORD_CLIENT_SECRET || '';

      if (!clientId || !clientSecret) {
        return htmlErrorResponse('Discord OAuth credentials are not configured on the server.');
      }

      // Exchange code for token
      const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) {
        return htmlErrorResponse(`Discord token exchange failed: ${tokenData.error_description || tokenData.error}`);
      }

      // Fetch user profile
      const userRes = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      const userData = await userRes.json();
      if (!userRes.ok) {
        return htmlErrorResponse('Failed to retrieve Discord user profile.');
      }

      email = userData.email || '';
      name = userData.global_name || userData.username;
      avatarUrl = userData.avatar
        ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
        : `https://cdn.discordapp.com/embed/avatars/${parseInt(userData.discriminator || '0') % 5}.png`;

    } else if (provider === 'facebook') {
      const clientId = process.env.FACEBOOK_CLIENT_ID || '';
      const clientSecret = process.env.FACEBOOK_CLIENT_SECRET || '';

      if (!clientId || !clientSecret) {
        return htmlErrorResponse('Facebook OAuth credentials are not configured on the server.');
      }

      // Exchange code for token
      const tokenRes = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&client_secret=${clientSecret}&code=${code}`
      );

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) {
        return htmlErrorResponse(`Facebook token exchange failed: ${tokenData.error?.message}`);
      }

      // Fetch user profile
      const profileRes = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture.width(250).height(250)&access_token=${tokenData.access_token}`
      );

      const profileData = await profileRes.json();
      if (!profileRes.ok) {
        return htmlErrorResponse('Failed to retrieve Facebook user profile.');
      }

      email = profileData.email || '';
      name = profileData.name || '';
      avatarUrl = profileData.picture?.data?.url || '';
    } else {
      return htmlErrorResponse('Unknown OAuth provider requested.');
    }

    if (!email) {
      return htmlErrorResponse('OAuth provider did not return an email address. Make sure email permission is granted in the app.');
    }

    // Find or create profile
    let profile = await prisma.footballIQProfile.findUnique({
      where: { email }
    });

    if (!profile) {
      const baseAlias = cleanUsername(name || email.split('@')[0]) || 'Manager';
      let uniqueAlias = baseAlias;

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

      profile = await prisma.footballIQProfile.create({
        data: {
          username: uniqueAlias,
          email,
          name,
          avatarStyle: 'fun-emoji',
          avatarSeed: avatarUrl || 'Reputation',
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
      // Update details if they were missing or generic
      if (avatarUrl && (profile.avatarSeed === 'Reputation' || !profile.avatarSeed.startsWith('http'))) {
        profile = await prisma.footballIQProfile.update({
          where: { id: profile.id },
          data: {
            avatarSeed: avatarUrl,
            name: name || profile.name
          }
        });
      }
    }

    // Success response - render a tiny script that posts message to opener and closes
    const successHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Success</title>
          <style>
            body {
              background-color: #07090E;
              color: white;
              font-family: system-ui, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .spinner {
              border: 3px solid rgba(255,255,255,0.1);
              border-radius: 50%;
              border-top: 3px solid #E11D48;
              width: 30px;
              height: 30px;
              animation: spin 1s linear infinite;
              margin-bottom: 20px;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="spinner"></div>
          <p>Connecting your profile...</p>
          <script>
            try {
              if (window.opener) {
                window.opener.postMessage({
                  type: 'oauth-success',
                  profile: ${JSON.stringify({
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
                  })}
                }, ${JSON.stringify(appOrigin)});
              }
            } catch (e) {
              console.error("Failed to postMessage back to parent window:", e);
            }
            setTimeout(() => {
              window.close();
            }, 300);
          </script>
        </body>
      </html>
    `;

    const sessionToken = createSessionToken({ profileId: profile.id, username: profile.username, role: profile.role });
    return new Response(successHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Set-Cookie': sessionCookieHeader(sessionToken),
      }
    });

  } catch (error: any) {
    console.error('[OAuth Callback API] Error:', error);
    return htmlErrorResponse(error.message || 'Internal Server Error');
  }
}

function htmlErrorResponse(msg: string) {
  const safeMsg = msg.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[char] || char;
  });
  const errorHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Authentication Error</title>
        <style>
          body {
            background-color: #07090E;
            color: #EF4444;
            font-family: system-ui, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 20px;
            text-align: center;
          }
          .icon {
            font-size: 40px;
            margin-bottom: 10px;
          }
          button {
            margin-top: 20px;
            background-color: #E11D48;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="icon">⚠️</div>
        <h3>Authentication Failed</h3>
        <p>${safeMsg}</p>
        <button onclick="window.close()">Close Window</button>
      </body>
    </html>
  `;
  return new Response(errorHtml, {
    headers: { 'Content-Type': 'text/html' }
  });
}
