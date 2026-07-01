import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'bk_session';

// Block common security scanners, bots, and brute-force directory traversal attempts
const DANGEROUS_EXTENSIONS = [
  'env', 'bak', 'backup', 'old', 'save', 'sql', 'key', 'credentials', 'secret',
  'git', 'yml', 'yaml', 'properties', 'conf', 'ini', 'cf', 'db', 'rc',
  'php', 'inc', 'asp', 'aspx', 'jsp', 'py', 'sh', 'cgi', 'pl', 'log'
];

const DANGEROUS_DIRECTORIES = [
  'wp-admin', 'wp-content', 'wp-includes', 'wp-json', 'roundcube', 'cpanel',
  'postfix', 'etc', 'actuator', 'cgi-bin', '.git', '.aws', '.metadata',
  'webmail', 'ssmtp', 'msmtp', 'services', 'include', 'inc'
];

const SENSITIVE_KEYWORDS = [
  'env', 'smtp', 'credentials', 'password', 'config', 'secret', 'database',
  'db', 'mysql', 'postgres', 'auth', 'pass', 'sasl'
];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname.toLowerCase();

  // 1. Block dangerous directory access
  const isDangerousDir = DANGEROUS_DIRECTORIES.some(dir => 
    pathname.includes(`/${dir}/`) || 
    pathname.startsWith(`/${dir}`)
  );

  // 2. Block dangerous file extensions
  const isDangerousExt = DANGEROUS_EXTENSIONS.some(ext => 
    pathname.endsWith(`.${ext}`) || 
    pathname.includes(`.${ext}.`)
  );

  // 3. Block sensitive keywords combined with data extensions (e.g. config.json, smtp.txt)
  const isSensitiveConfig = SENSITIVE_KEYWORDS.some(kw => pathname.includes(kw)) && (
    pathname.endsWith('.txt') ||
    pathname.endsWith('.json') ||
    pathname.endsWith('.xml')
  );

  // 4. Block explicit common recon files or cpanel paths
  const isReconPattern = pathname.includes('cpanel') || 
                         pathname.endsWith('msmtprc') || 
                         pathname.endsWith('.msmtprc');

  if (isDangerousDir || isDangerousExt || isSensitiveConfig || isReconPattern) {
    return new NextResponse('Blocked', { status: 400 });
  }

  // Session check for /football-iq
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE);
  if (!hasSessionCookie && request.nextUrl.pathname.startsWith('/football-iq')) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/profile';
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - images (public images)
     * - favicon.ico, apple-icon.png, icon.png
     * - robots.txt
     * - sitemap.xml
     */
    '/((?!_next/static|_next/image|images|favicon.ico|apple-icon.png|icon.png|robots.txt|sitemap.xml).*)',
  ],
};
