import "server-only";

import { redirect } from "next/navigation";
import { type UserRole } from "../../generated/prisma";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export interface UserContext {
  userId: string;
  organizationId: string;
  role: UserRole;
}

export async function getUserContext(): Promise<UserContext | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, organizationId: true, role: true },
  });
  if (!user?.organizationId) return null;
  return { userId: user.id, organizationId: user.organizationId, role: user.role };
}

export async function requireUserContext(): Promise<UserContext> {
  const ctx = await getUserContext();
  if (!ctx) redirect("/login");
  return ctx;
}

export async function requireManagerContext(): Promise<UserContext> {
  const ctx = await requireUserContext();
  if (ctx.role !== "MANAGER") redirect("/dashboard");
  return ctx;
}
