import NextAuth from 'next-auth';
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
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
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "database",
  },
};

export default NextAuth(authOptions); 