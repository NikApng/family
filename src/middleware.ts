import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const SIGN_IN_PATH = '/admin/login'

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  if (!pathname.startsWith('/admin')) return NextResponse.next()
  if (pathname === SIGN_IN_PATH) return NextResponse.next()

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (token) return NextResponse.next()

  const url = req.nextUrl.clone()
  url.pathname = SIGN_IN_PATH
  url.searchParams.set('callbackUrl', pathname + search)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/admin/:path*'],
}
