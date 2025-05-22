import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        login: { label: "Логин", type: "text" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) {
          throw new Error("Логин и пароль обязательны");
        }
        const user = await prisma.user.findUnique({
          where: { login: credentials.login },
        });
        if (!user || !user.password) {
          throw new Error("Неверный логин или пароль");
        }
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Неверный логин или пароль");
        }
        return {
          id: user.id,
          login: user.login,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }: { token: any, user?: any }) {
      if (user) {
        token.id = user.id;
        token.login = user.login;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }: { session: any, token: any }) {
      if (token) {
        session.user = {
          id: token.id as string,
          login: token.login as string,
          name: token.name as string,
        };
      }
      return session;
    },  
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: true,
};
