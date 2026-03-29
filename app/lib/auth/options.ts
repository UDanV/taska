import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import MailRuProvider from "next-auth/providers/mailru";
import VkProvider from "next-auth/providers/vk";
import YandexProvider from "next-auth/providers/yandex";
import bcrypt from "bcrypt";
import { prisma } from "@/app/lib/prisma";

const oauthProviders = [
  process.env.VK_CLIENT_ID && process.env.VK_CLIENT_SECRET
    ? VkProvider({
        clientId: process.env.VK_CLIENT_ID,
        clientSecret: process.env.VK_CLIENT_SECRET,
        checks: ["state"],
      })
    : null,
  process.env.YANDEX_CLIENT_ID && process.env.YANDEX_CLIENT_SECRET
    ? YandexProvider({
        clientId: process.env.YANDEX_CLIENT_ID,
        clientSecret: process.env.YANDEX_CLIENT_SECRET,
      })
    : null,
  process.env.MAILRU_CLIENT_ID && process.env.MAILRU_CLIENT_SECRET
    ? MailRuProvider({
        clientId: process.env.MAILRU_CLIENT_ID,
        clientSecret: process.env.MAILRU_CLIENT_SECRET,
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
        };
      },
    }),
    ...oauthProviders,
  ],

  callbacks: {
    async jwt({ token, user }) {
      token.id = user?.id ?? token.id ?? token.sub ?? "";
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id || token.sub) as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
