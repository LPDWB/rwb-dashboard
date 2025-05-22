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

    // Если не авторизован и пытается получить доступ к защищенным страницам
    if (!isAuthed && !isAuthPage) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Защищаем только приватные маршруты!
export const config = {
  matcher: [
    "/dashboard/:path*",
    // Добавь другие приватные маршруты, если нужно
  ],
};
