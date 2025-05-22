import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
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
      // Handle relative URLs
      if (url.startsWith("/")) {
        // If it's the sign-in page and user is authenticated, redirect to dashboard
        if (url === "/auth/signin") {
          return `${baseUrl}/dashboard`;
        }
        return `${baseUrl}${url}`;
      }
      // Handle absolute URLs from the same origin
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Default redirect to dashboard
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