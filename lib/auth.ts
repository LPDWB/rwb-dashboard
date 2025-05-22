import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error("GOOGLE_CLIENT_ID is not defined");
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("GOOGLE_CLIENT_SECRET is not defined");
}
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is not defined");
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.name) {
          throw new Error("Email and name are required");
        }

        // Check if user exists
        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // If user doesn't exist, create one
        if (!user) {
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.name,
            },
          });
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        // Проверяем, существует ли пользователь
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (!existingUser) {
          // Создаем нового пользователя
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              image: user.image,
            },
          });
        }
        return true;
      }
      return true;
    },
    async session({ session, user }) {
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
      // Всегда редиректим на dashboard после успешной авторизации
      if (url.startsWith("/auth/")) {
        return `${baseUrl}/dashboard`;
      }
      // Для других относительных URL
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Для абсолютных URL с того же домена
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      // По умолчанию на dashboard
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
}; 