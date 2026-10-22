import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  ADMIN_SESSION_COOKIE_NAME,
  verifySessionToken,
} from '@mirage/db/auth-token';

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
  response.headers.set(
    'X-GxP-Compliance-Mode',
    'FDA-21-CFR-PART-11-EDA-VERIFIED'
  );
  return response;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isLoginPage = pathname === '/login';
  const isPublicAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/brand');

  const rawSessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const verification = verifySessionToken(rawSessionCookie);

  if (!verification.ok && !isLoginPage && !isPublicAsset) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    loginUrl.searchParams.set('reason', verification.code);
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  // Strip any client-supplied role or auth spoofing headers before forwarding
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete('x-user-role');
  requestHeaders.delete('x-authenticated');
  requestHeaders.delete('x-operator-email');

  if (verification.ok) {
    requestHeaders.set('x-authenticated-role', verification.session.role);
    requestHeaders.set('x-operator-email', verification.session.email);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (verification.ok) {
    response.headers.set('X-User-Role', verification.session.role);
    response.headers.set('X-Authenticated', 'true');
  } else {
    response.headers.set('X-Authenticated', 'false');
  }

  return applySecurityHeaders(response);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|brand/).*)'],
};
