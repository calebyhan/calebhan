import { NextResponse } from 'next/server';

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Block /admin in production
  if (pathname.startsWith('/admin')) {
    // Only allow /admin in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
