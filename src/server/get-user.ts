import "server-only";

import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export interface UserContext {
  userId: string;
  showSeed: boolean;
}

export async function getUserContext(): Promise<UserContext | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, showSeed: true },
  });
  if (!user) return null;
  return { userId: user.id, showSeed: user.showSeed };
}

export async function requireUserContext(): Promise<UserContext> {
  const ctx = await getUserContext();
  if (!ctx) redirect("/login");
  return ctx;
}
