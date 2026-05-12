import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { AppShell } from "~/components/layout/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = {
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    image: session.user.image ?? null,
  };

  return <AppShell user={user}>{children}</AppShell>;
}
