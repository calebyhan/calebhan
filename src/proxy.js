import { NextResponse } from 'next/server';

export function proxy(request) {
  const { pathname, searchParams } = request.nextUrl;
  const isProduction = process.env.NODE_ENV === 'production';
  const adminToken = process.env.ADMIN_TOKEN;

  const isAdminPageRoute = pathname.startsWith('/admin');
  const isAdminApiRoute = pathname.startsWith('/api/admin');

  // Keep production hardened by default. Admin routes can only be opened in
  // production when both toggles are set and a valid token is presented.
  if ((isAdminPageRoute || isAdminApiRoute) && isProduction) {
    const allowProdAdmin = process.env.ADMIN_ALLOW_PROD === 'true';

    if (!allowProdAdmin || !adminToken) {
      if (isAdminApiRoute) {
        return NextResponse.json(
          { error: 'Admin endpoints are disabled in production' },
          { status: 403 }
        );
      }

      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Optional shared-secret protection for all admin routes.
  // When ADMIN_TOKEN is present, access requires either a secure cookie or
  // x-admin-token header. A token query param can bootstrap the cookie.
  if ((isAdminPageRoute || isAdminApiRoute) && adminToken) {
    const cookieToken = request.cookies.get('admin_token')?.value;
    const headerToken = request.headers.get('x-admin-token');
    const queryToken = searchParams.get('token');

    if (queryToken && queryToken === adminToken && isAdminPageRoute) {
      const cleanUrl = new URL(request.url);
      cleanUrl.searchParams.delete('token');

      const response = NextResponse.redirect(cleanUrl);
      response.cookies.set('admin_token', adminToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60,
      });
      return response;
    }

    const providedToken = cookieToken || headerToken;
    if (providedToken !== adminToken) {
      if (isAdminApiRoute) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
