import NextAuth, { NextAuthOptions, DefaultSession, Session, User } from 'next-auth';
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from '@/lib/prisma';

// Проверяем наличие необходимых переменных окружения
if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error('GOOGLE_CLIENT_ID is not defined');
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('GOOGLE_CLIENT_SECRET is not defined');
}
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is not defined');
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    user?: {
      id?: string;
    } & DefaultSession["user"]
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, user }: { session: Session, user: User }) {
      if (session?.user) {
        session.user.id = user.id;
        
        // Create user profile if it doesn't exist
        const profile = await prisma.userProfile.findUnique({
          where: { userId: user.id },
        });
        
        if (!profile) {
          await prisma.userProfile.create({
            data: {
              userId: user.id,
            },
          });
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Если URL начинается с /, это относительный URL
      if (url.startsWith("/")) {
        // Если это страница входа и пользователь уже авторизован, перенаправляем на dashboard
        if (url === "/auth/signin") {
          return `${baseUrl}/dashboard`;
        }
        return `${baseUrl}${url}`;
      }
      // Если URL с того же домена, разрешаем
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      // По умолчанию возвращаем на dashboard
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions); 