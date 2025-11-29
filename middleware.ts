import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function middleware(request: NextRequest) {
  // Only run on /admin routes
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Exclude login and signup
  if (
    request.nextUrl.pathname === '/admin/login' || 
    request.nextUrl.pathname === '/admin/signup'
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get('admin_token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  try {
    await jwtVerify(token, JWT_SECRET)
    return NextResponse.next()
  } catch (error) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
}

export const config = {
  matcher: '/admin/:path*',
}
