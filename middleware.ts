// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const isAuthPage = req.nextUrl.pathname === "/auth/signin" || req.nextUrl.pathname === "/auth/register";
    const isProtected = req.nextUrl.pathname.startsWith("/dashboard") || req.nextUrl.pathname.startsWith("/profile") || req.nextUrl.pathname.startsWith("/upload");
    const isAuthed = !!req.nextauth.token;

    // Если пользователь авторизован и на странице входа/регистрации — на dashboard
    if (isAuthed && isAuthPage) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    // Если не авторизован и на защищённой странице — на signin
    if (!isAuthed && isProtected) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
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
    "/dashboard/:path*",
    "/profile/:path*",
    "/upload/:path*",
    "/auth/:path*",
  ],
};
