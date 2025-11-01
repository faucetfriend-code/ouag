import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = await auth();

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/api/auth'];
  const isPublicRoute = publicRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  // If not authenticated and trying to access protected route, redirect to login
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If authenticated but no active subscription, restrict access to certain routes
  if (session?.user && !session.user.subscription?.active) {
    const restrictedRoutes = ['/analysts', '/tools'];
    const isRestrictedRoute = restrictedRoutes.some(route =>
      request.nextUrl.pathname.startsWith(route)
    );

    if (isRestrictedRoute) {
      return NextResponse.redirect(new URL('/profile', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};