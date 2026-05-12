import { redirect } from "next/navigation";

import { AppShell } from "~/components/layout/AppShell";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userRecord = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, organizationId: true },
  });
  if (!userRecord?.organizationId) redirect("/login");

  const user = {
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    image: session.user.image ?? null,
  };

  return (
    <AppShell user={user} role={userRecord.role}>
      {children}
    </AppShell>
  );
}
