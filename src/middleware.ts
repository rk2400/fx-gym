import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Skip auth routes
    if (path.startsWith('/api/auth')) {
      return NextResponse.next()
    }

    // Alias: the trainer's home is the clients list (/trainer has no page of its own)
    if (path === '/trainer') {
      return NextResponse.redirect(new URL('/trainer/clients', req.url))
    }

    // Admin routes
    if (path.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Trainer routes
    if (path.startsWith('/trainer') && token?.role !== 'TRAINER' && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Member routes
    if (path.startsWith('/dashboard') && !['ADMIN', 'TRAINER', 'MEMBER'].includes(token?.role || '')) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        // Skip auth routes
        if (path.startsWith('/api/auth')) {
          return true
        }
        if (path.startsWith('/admin') || path.startsWith('/trainer') || path.startsWith('/dashboard')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/trainer/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/api/auth/:path*',
  ],
}