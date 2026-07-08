import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Rigid Content Security Policy
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: blob: https://cdn.shopify.com https://*.myshopify.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' ws://localhost:* wss://localhost:* https://*.myshopify.com https://pomalifestyle.myshopify.com;
    frame-src 'none';
    object-src 'none';
    base-uri 'self';
    form-action 'self' https://*.myshopify.com;
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  // Inject Advanced Security Headers
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');

  return response;
}

export const config = {
  matcher: [
    /*
     * Apply security headers globally to all routes except for static assets,
     * next framework internals, and static icons.
     */
    '/((?!_next/static|_next/image|assets|favicon.ico).*)',
  ],
};
