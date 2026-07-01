import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'bk_session';

export function middleware(request: NextRequest) {
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
  matcher: ['/football-iq/:path*'],
};
