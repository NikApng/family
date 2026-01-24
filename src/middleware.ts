import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    authorized: ({ token, req }) => {
      const pathname = req.nextUrl.pathname
      if (pathname === '/admin/login') return true
      return Boolean(token)
    },
  },
})

export const config = {
  matcher: ['/admin/:path*'],
}
