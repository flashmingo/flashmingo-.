import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function middleware(request: NextRequest) {
  // List of public routes
  const publicRoutes = ['/auth/login', '/auth/signup', '/auth/logout', '/', '/auth'];

  const pathname = request.nextUrl.pathname;

  // Allow public routes
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // Check if route requires authentication
  const isProtectedRoute = pathname.startsWith('/(authenticated)') || pathname.startsWith('/dashboard') || pathname.startsWith('/decks') || pathname.startsWith('/study');

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Get session from cookies
  const accessToken = request.cookies.get('sb-access-token')?.value;
  const refreshToken = request.cookies.get('sb-refresh-token')?.value;

  // If no tokens, redirect to login
  if (!accessToken) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Verify token (basic check - in production use proper JWT verification)
  try {
    const { data, error } = await supabaseServer.auth.getUser(accessToken);

    if (error || !data.user) {
      // Token is invalid, try to refresh if refresh token exists
      if (refreshToken) {
        const { data: refreshData, error: refreshError } = await supabaseServer.auth.refreshSession({
          refresh_token: refreshToken,
          access_token: accessToken,
        });

        if (refreshError || !refreshData.session) {
          return NextResponse.redirect(new URL('/auth/login', request.url));
        }

        // Create response with refreshed tokens
        const response = NextResponse.next();
        response.cookies.set('sb-access-token', refreshData.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
        response.cookies.set('sb-refresh-token', refreshData.session.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });

        return response;
      }

      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
