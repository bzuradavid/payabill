import { type PrismaClient } from "../../../generated/prisma";
import { type UserContext } from "~/server/get-user";

export class StaffService {
  constructor(
    private db: PrismaClient,
    private ctx: UserContext,
  ) {}

  private requireManager() {
    if (this.ctx.role !== "MANAGER") {
      throw new Error("Forbidden: manager role required");
    }
  }

  listMembers() {
    this.requireManager();
    return this.db.user.findMany({
      where: { organizationId: this.ctx.organizationId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    });
  }

  listInvitations() {
    this.requireManager();
    return this.db.invitation.findMany({
      where: { organizationId: this.ctx.organizationId },
      orderBy: { createdAt: "desc" },
    });
  }

  async inviteStaff(rawEmail: string) {
    this.requireManager();
    const email = rawEmail.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Enter a valid email address");
    }

    const existingUser = await this.db.user.findUnique({
      where: { email },
      select: { organizationId: true },
    });
    if (existingUser?.organizationId === this.ctx.organizationId) {
      throw new Error("That person already belongs to your workspace");
    }
    if (existingUser?.organizationId && existingUser.organizationId !== this.ctx.organizationId) {
      throw new Error("That email is already used by another workspace");
    }

    return this.db.invitation.upsert({
      where: {
        organizationId_email: {
          organizationId: this.ctx.organizationId,
          email,
        },
      },
      update: {},
      create: { organizationId: this.ctx.organizationId, email },
    });
  }

  async revokeInvitation(id: string) {
    this.requireManager();
    const invitation = await this.db.invitation.findFirst({
      where: { id, organizationId: this.ctx.organizationId },
      select: { id: true },
    });
    if (!invitation) throw new Error("Invitation not found");
    await this.db.invitation.delete({ where: { id } });
  }

  async removeStaff(userId: string) {
    this.requireManager();
    if (userId === this.ctx.userId) {
      throw new Error("You cannot remove yourself");
    }
    const target = await this.db.user.findFirst({
      where: { id: userId, organizationId: this.ctx.organizationId },
      select: { id: true, role: true },
    });
    if (!target) throw new Error("User not found");
    if (target.role === "MANAGER") {
      throw new Error("Managers cannot be removed from this UI");
    }
    await this.db.user.update({
      where: { id: userId },
      data: { organizationId: null, role: "STAFF" },
    });
  }
}
