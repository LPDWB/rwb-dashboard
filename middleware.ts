// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const isAuthPage = req.nextUrl.pathname === "/auth/signin" || req.nextUrl.pathname === "/auth/register";
    const isAuthed = !!req.nextauth.token;

    // Если пользователь авторизован и на странице входа/регистрации — на dashboard
    if (isAuthed && isAuthPage) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    // В остальных случаях — пропускаем
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/auth/:path*",
  ],
};
