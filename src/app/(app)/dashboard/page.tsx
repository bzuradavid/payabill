export const dynamic = "force-dynamic";

import { auth } from "~/server/auth";
import { getServices } from "~/server/container";
import { ManagerDashboard } from "./ManagerDashboard";
import { StaffDashboard } from "./StaffDashboard";

export default async function DashboardPage() {
  const { billService, ctx } = await getServices();

  if (ctx.role === "MANAGER") {
    return <ManagerDashboard billService={billService} />;
  }

  const session = await auth();
  return (
    <StaffDashboard
      billService={billService}
      userName={session?.user?.name ?? null}
    />
  );
}
