export const dynamic = "force-dynamic";

import { Card, CardContent, CardHeader } from "~/components/ui/Card";
import { getServices } from "~/server/container";
import { requireManagerContext } from "~/server/get-user";
import { InviteStaffForm } from "./InviteStaffForm";
import { StaffMembersTable } from "./StaffMembersTable";
import { PendingInvitationsTable } from "./PendingInvitationsTable";

export default async function StaffPage() {
  await requireManagerContext();
  const { staffService, ctx } = await getServices();

  const [members, invitations] = await Promise.all([
    staffService.listMembers(),
    staffService.listInvitations(),
  ]);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-xl font-bold text-[#1a174f]">Staff</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Invite teammates and manage who can submit bills in this workspace.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-[#1a174f]">Invite staff</h2>
        </CardHeader>
        <CardContent>
          <InviteStaffForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-[#1a174f]">Team members</h2>
          <span className="text-xs text-slate-500">
            {members.length} {members.length === 1 ? "person" : "people"}
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <StaffMembersTable members={members} currentUserId={ctx.userId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-[#1a174f]">
            Pending invitations
          </h2>
          <span className="text-xs text-slate-500">
            {invitations.length} pending
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <PendingInvitationsTable invitations={invitations} />
        </CardContent>
      </Card>
    </div>
  );
}
