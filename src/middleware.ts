import { defineMiddleware } from 'astro:middleware';
import { readSession } from './lib/auth';

export const onRequest = defineMiddleware(async (ctx, next) => {
  const { pathname } = ctx.url;
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');

  if (isAdmin) {
    const session = await readSession(ctx.cookies);
    ctx.locals.admin = session;
    if (!session && pathname !== '/admin/login') {
      return ctx.redirect(`/admin/login?next=${encodeURIComponent(pathname)}`);
    }
    const res = await next();
    res.headers.set('Cache-Control', 'no-store');
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    res.headers.set('X-Frame-Options', 'DENY');
    return res;
  }
  return next();
});
