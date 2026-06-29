import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const ref = request.nextUrl.searchParams.get('ref')
  if (ref && /^[A-Z0-9]{6,12}$/.test(ref)) {
    // Only set if not already set — first referrer wins
    if (!request.cookies.get('fg_ref')) {
      response.cookies.set('fg_ref', ref, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      })
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
