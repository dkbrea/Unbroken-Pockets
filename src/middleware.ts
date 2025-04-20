import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes that require authentication
const protectedRoutes = [
  '/',
  '/dashboard',
  '/accounts',
  '/transactions',
  '/cash-flow',
  '/reports',
  '/budget',
  '/recurring',
  '/goals',
  '/investments',
  '/profile',
  '/settings'
]

// Auth callback routes that should be excluded from redirect logic
const authCallbackRoutes = [
  '/auth/callback',
  '/api/auth'
]

export async function middleware(req: NextRequest) {
  try {
    // Don't run middleware for static assets
    if (req.nextUrl.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico)$/)) {
      return NextResponse.next()
    }
    
    console.log(`URL requested: ${req.nextUrl.pathname}`);
    
    // Check if accessing an auth page and there's a query to bypass auth
    if (req.nextUrl.pathname === '/dashboard' && req.nextUrl.searchParams.get('bypassAuth') === 'true') {
      console.log('Bypassing authentication for debugging');
      return NextResponse.next();
    }
    
    // Allow access to all protected routes for debugging
    if (protectedRoutes.some(route => 
      req.nextUrl.pathname === route || 
      req.nextUrl.pathname.startsWith(`${route}/`)
    )) {
      console.log('Allowing access to protected route for debugging:', req.nextUrl.pathname);
      return NextResponse.next();
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error)
    // In case of an error, continue to the page rather than blocking
    return NextResponse.next()
  }
}

// Only run middleware on specific routes
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 