import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

function isAuthorized(request: NextRequest): boolean {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return verifySessionToken(token) !== null;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authorized = isAuthorized(request);

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!authorized) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname === '/api/upload' || pathname === '/api/delete') {
    if (!authorized) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }
  }

  if (pathname === '/api/config' && request.method !== 'GET') {
    if (!authorized) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/upload', '/api/delete', '/api/config'],
};
