import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAppType, rewritePath, isFestivalRequest, getFestivalSlug } from './src/lib/subdomain'

export async function middleware(req: NextRequest) {
  const { type, identifier } = getAppType(req)
  const pathname = req.nextUrl.pathname

  // Handle API routes - no rewriting needed
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Handle static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // For festival requests, validate that the festival exists
  if (isFestivalRequest(req)) {
    const festivalSlug = getFestivalSlug(req)
    
    if (festivalSlug) {
      try {
        // In production, you'd check the database here
        // For now, we'll assume all subdomains are valid festivals
        console.log(`Festival request for: ${festivalSlug}`)
      } catch (error) {
        // Festival not found, redirect to main site
        return NextResponse.redirect(new URL('/', req.url))
      }
    }
  }

  // Rewrite the URL based on the app type
  const rewrittenPath = rewritePath(req)
  
  if (rewrittenPath !== pathname) {
    console.log(`Rewriting ${pathname} -> ${rewrittenPath}`)
    return NextResponse.rewrite(new URL(rewrittenPath, req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}