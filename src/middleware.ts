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

  // Apply intl middleware to all other routes
  return intlMiddleware(req);
});

export const config = {
  // Match only internationalized pathnames and auth routes
  matcher: ['/', '/(zh|en)/:path*', '/api/auth/:path*']
};
