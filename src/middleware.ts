import { auth } from '@/lib/auth';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow public access to auth routes
  if (pathname.startsWith('/api/auth')) {
    return;
  }

  // Allow public access to main pages
  if (pathname === '/' || pathname.match(/^\/(zh|en)$/) || pathname.match(/^\/(zh|en)\/?$/)) {
    return intlMiddleware(req);
  }

  // Protect order history route - require authentication
  if (pathname.match(/^\/(zh|en)\/orders/)) {
    if (!req.auth) {
      const signInUrl = new URL('/api/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return Response.redirect(signInUrl);
    }
  }

  // Protect admin routes - require authentication and admin role
  if (pathname.match(/^\/(zh|en)\/admin/)) {
    if (!req.auth) {
      const signInUrl = new URL('/api/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return Response.redirect(signInUrl);
    }

    if (req.auth.user?.role !== 'admin') {
      // Redirect to home if not an admin
      const locale = pathname.split('/')[1];
      return Response.redirect(new URL(`/${locale}`, req.url));
    }
  }

  // Apply intl middleware to all other routes
  return intlMiddleware(req);
});

export const config = {
  // Match only internationalized pathnames and auth routes
  matcher: ['/', '/(zh|en)/:path*', '/api/auth/:path*']
};
