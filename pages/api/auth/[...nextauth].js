import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// Check if Google auth is configured
const hasGoogleConfig = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

// Configure providers based on availability
const providers = [];
if (hasGoogleConfig) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions = {
  providers,
  callbacks: {
    async session({ session, token }) {
      return session;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          user,
        };
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  // Log warning if NEXTAUTH_SECRET is missing
  secret: process.env.NEXTAUTH_SECRET || (() => {
    console.warn('Warning: NEXTAUTH_SECRET is not set. Using a random string as fallback.');
    return Math.random().toString(36).slice(-32);
  })(),
};

export default NextAuth(authOptions); 