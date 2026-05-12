"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { z } from "zod";

import { assignUserToOrganization } from "~/server/assign-org";
import { db } from "~/server/db";
import { signIn, signOut } from "~/server/auth";

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

const credentialsSchema = z.object({
  email: z.string().email("Enter a valid email").transform((e) => e.toLowerCase().trim()),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const signUpSchema = credentialsSchema.extend({
  name: z.string().trim().min(1, "Enter your name").max(80),
});

export type AuthActionResult = { ok: true } | { ok: false; error: string };

export async function signInWithCredentials(
  email: string,
  password: string,
): Promise<AuthActionResult> {
  const parsed = credentialsSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { ok: true };
  } catch (e) {
    if (e instanceof AuthError) {
      return { ok: false, error: "Invalid email or password" };
    }
    throw e;
  }
}

export async function signUpWithCredentials(
  name: string,
  email: string,
  password: string,
): Promise<AuthActionResult> {
  const parsed = signUpSchema.safeParse({ name, email, password });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { ok: false, error: "An account with that email already exists" };
  }

  const newUser = await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
    },
  });
  await assignUserToOrganization(newUser.id, newUser.email, newUser.name);

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { ok: true };
  } catch (e) {
    if (e instanceof AuthError) {
      return { ok: false, error: "Account created, but sign-in failed. Try signing in." };
    }
    throw e;
  }
}
