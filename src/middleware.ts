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

  // Next.js navigation requests may include internal `_rsc` query param.
  // If we keep it in `callbackUrl`, post-login redirects can get stuck on stale RSC cache / 304.
  const callbackUrl = req.nextUrl.clone()
  callbackUrl.pathname = pathname
  callbackUrl.search = search
  callbackUrl.searchParams.delete("_rsc")

  const url = req.nextUrl.clone()
  url.pathname = SIGN_IN_PATH
  url.searchParams.set('callbackUrl', callbackUrl.pathname + callbackUrl.search)
  const res = NextResponse.redirect(url)
  res.headers.set("Cache-Control", "no-store")
  return res
}

export const config = {
  matcher: ['/admin/:path*'],
}
