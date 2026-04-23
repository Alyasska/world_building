import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';

function isProtectedPage(pathname: string) {
  return /\/new\/?$/.test(pathname) || /\/[^/]+\/edit\/?$/.test(pathname);
}

function isProtectedApi(pathname: string, method: string) {
  if (!pathname.startsWith('/api/') || pathname.startsWith('/api/auth/')) {
    return false;
  }

  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
}

function buildLoginUrl(request: NextRequest) {
  const loginUrl = new URL('/login', request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  loginUrl.searchParams.set('next', nextPath);
  return loginUrl;
}

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const isAuthenticated = Boolean(request.auth?.user);
  const needsAuth = isProtectedPage(pathname) || isProtectedApi(pathname, request.method);

  if (pathname === '/login' && isAuthenticated) {
    const nextPath = request.nextUrl.searchParams.get('next') || '/';
    return NextResponse.redirect(new URL(nextPath, request.url));
  }

  if (!needsAuth || isAuthenticated) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      {
        success: false,
        error: 'Authentication required',
      },
      { status: 401 },
    );
  }

  return NextResponse.redirect(buildLoginUrl(request));
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
