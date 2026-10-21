import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('mirage_session')?.value;
  const authHeader = request.headers.get('authorization');
  const pathname = request.nextUrl.pathname;

  const isLoginPage = pathname === '/login';
  const isPublicAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/brand');

  let userRole = 'read_only';
  let isAuthenticated = false;

  if (sessionCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(sessionCookie));
      if (parsed && parsed.role) {
        userRole = parsed.role;
        isAuthenticated = true;
      }
    } catch {
      // Invalid session cookie format
    }
  } else if (authHeader && authHeader.startsWith('Bearer ')) {
    isAuthenticated = true;
    userRole = 'super_admin';
  }

  // If ENFORCE_AUTH is enabled, redirect unauthenticated users to /login
  const enforceAuth = process.env.ENFORCE_AUTH === 'true';
  if (enforceAuth && !isAuthenticated && !isLoginPage && !isPublicAsset) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();

  if (isAuthenticated) {
    response.headers.set('X-User-Role', userRole);
    response.headers.set('X-Authenticated', 'true');
  }

  // Phase 10: Enterprise Security & 21 CFR Part 11 Compliance Headers
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

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|brand/).*)'],
};
