import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { env } from "~/env.js";
import { db } from "~/server/db";
import { seedUserData } from "~/server/seed-user";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  events: {
    // Fires once per user, the first time the PrismaAdapter creates their User row.
    // We use it to seed a personal copy of the demo dataset (all rows marked seed:true).
    createUser: async ({ user }) => {
      if (!user.id) return;
      try {
        await seedUserData(db, user.id);
      } catch (e) {
        console.error("[auth] Failed to seed demo data for new user", user.id, e);
      }
    },
  },
});
