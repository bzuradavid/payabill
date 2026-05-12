import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { env } from "~/env.js";
import { assignUserToOrganization } from "~/server/assign-org";
import { db } from "~/server/db";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.toLowerCase().trim()
            : null;
        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : null;
        if (!email || !password) return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      await assignUserToOrganization(user.id, user.email, user.name);
    },
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        return token;
      }
      // Validate the token on every request: if the referenced user no longer
      // exists (e.g. wiped by a migration), return null so the JWT cookie is
      // invalidated and the visitor sees the login page fresh.
      if (token.id) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { id: true },
        });
        if (!dbUser) return null;
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id as string,
      },
    }),
  },
});
