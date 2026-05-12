import "server-only";

import { db } from "~/server/db";

/**
 * Attach a freshly-created User to an Organization.
 *
 * - If a pending Invitation matches the email, the user joins that org as STAFF
 *   and the invitation is consumed.
 * - Otherwise, a brand new Organization is created and the user becomes its MANAGER.
 *
 * Safe to call more than once for the same user — bails out if the user already
 * has an organizationId.
 */
export async function assignUserToOrganization(
  userId: string,
  email?: string | null,
  name?: string | null,
) {
  const current = await db.user.findUnique({
    where: { id: userId },
    select: { organizationId: true },
  });
  if (!current || current.organizationId) return;

  const normalizedEmail = email?.toLowerCase().trim() ?? null;

  const invitation = normalizedEmail
    ? await db.invitation.findFirst({ where: { email: normalizedEmail } })
    : null;

  if (invitation) {
    await db.$transaction([
      db.user.update({
        where: { id: userId },
        data: { organizationId: invitation.organizationId, role: "STAFF" },
      }),
      db.invitation.delete({ where: { id: invitation.id } }),
    ]);
    return;
  }

  const orgName = name?.trim()
    ? `${name.trim()}'s Workspace`
    : normalizedEmail
      ? `${normalizedEmail.split("@")[0]}'s Workspace`
      : "My Workspace";

  const org = await db.organization.create({ data: { name: orgName } });
  await db.user.update({
    where: { id: userId },
    data: { organizationId: org.id, role: "MANAGER" },
  });
}
