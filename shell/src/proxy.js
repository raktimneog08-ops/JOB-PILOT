import { NextResponse } from 'next/server';

export function proxy(request) {
  // Let the request proceed
  const response = NextResponse.next();
  const url = request.nextUrl.pathname;

  // If routing to proxied applications, strip restrictive headers to allow framing
  if (url.startsWith('/apps/')) {
    response.headers.delete('x-frame-options');
    response.headers.delete('content-security-policy');
    
    // Inject framing authorization
    response.headers.set(
      'Content-Security-Policy',
      "frame-ancestors 'self' http://localhost:3000 http://localhost:8080 https://unified-shell.com"
    );
  }

  return response;
}

// Only match app routes
export const config = {
  matcher: '/apps/:path*',
};
