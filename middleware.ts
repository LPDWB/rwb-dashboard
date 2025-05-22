import { withAuth } from "next-auth/middleware"
import { NextRequestWithAuth } from "next-auth/middleware"
import { JWT } from "next-auth/jwt"

export default withAuth({
  callbacks: {
    authorized: ({ req, token }: { req: NextRequestWithAuth, token: JWT | null }) => {
      // Only allow authenticated users
      return !!token
    },
  },
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/api/protected/:path*'
  ]
} 