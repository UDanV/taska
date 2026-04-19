import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import YandexProvider from "next-auth/providers/yandex";
import bcrypt from "bcrypt";
import { DEFAULT_ROLE } from "@/app/lib/auth/roles";
import { prisma } from "@/app/lib/prisma";

const oauthProviders = [
  process.env.YANDEX_CLIENT_ID && process.env.YANDEX_CLIENT_SECRET
    ? YandexProvider({
        clientId: process.env.YANDEX_CLIENT_ID,
        clientSecret: process.env.YANDEX_CLIENT_SECRET,
      })
    : null,
].filter((provider) => provider !== null);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;
        if (!user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          specialization: user.specialization,
        };
      },
    }),
    ...oauthProviders,
  ],

  callbacks: {
    async jwt({ token, user }) {
      const userId = user?.id ?? token.id ?? token.sub ?? "";

      token.id = userId;

      if (!userId) {
        token.role = user?.role ?? token.role ?? DEFAULT_ROLE;
        token.specialization =
          user?.specialization ?? token.specialization ?? null;
        return token;
      }

      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, specialization: true },
      });

      token.role = currentUser?.role ?? user?.role ?? token.role ?? DEFAULT_ROLE;
      token.specialization =
        currentUser?.specialization ?? user?.specialization ?? token.specialization ?? null;

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id || token.sub) as string;
        session.user.role = token.role ?? DEFAULT_ROLE;
        session.user.specialization = token.specialization ?? null;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
