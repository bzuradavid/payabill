import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import type { Mock } from "vitest";
import { StaffService } from "../StaffService";
import { makeMockDb, managerCtx, staffCtx } from "~/test/helpers";

describe("StaffService", () => {
  let db: ReturnType<typeof makeMockDb>;
  let manager: StaffService;
  let staff: StaffService;

  beforeEach(() => {
    db = makeMockDb();
    manager = new StaffService(db, managerCtx);
    staff = new StaffService(db, staffCtx);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ── listMembers ────────────────────────────────────────────────────────────

  describe("listMembers", () => {
    it("throws Forbidden for staff", () => {
      // listMembers is not async — requireManager() throws synchronously
      expect(() => staff.listMembers()).toThrow("Forbidden: manager role required");
    });

    it("returns users scoped to the org", async () => {
      (db.user.findMany as Mock).mockResolvedValue([]);

      await manager.listMembers();

      expect(db.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ organizationId: "org-1" }) }),
      );
    });
  });

  // ── listInvitations ────────────────────────────────────────────────────────

  describe("listInvitations", () => {
    it("throws Forbidden for staff", () => {
      // listInvitations is not async — requireManager() throws synchronously
      expect(() => staff.listInvitations()).toThrow("Forbidden: manager role required");
    });

    it("returns invitations scoped to the org", async () => {
      (db.invitation.findMany as Mock).mockResolvedValue([]);

      await manager.listInvitations();

      expect(db.invitation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ organizationId: "org-1" }) }),
      );
    });
  });

  // ── inviteStaff ────────────────────────────────────────────────────────────

  describe("inviteStaff", () => {
    it("throws Forbidden for staff", async () => {
      await expect(staff.inviteStaff("new@example.com")).rejects.toThrow(
        "Forbidden: manager role required",
      );
    });

    it("throws for an invalid email (no @)", async () => {
      await expect(manager.inviteStaff("notanemail")).rejects.toThrow(
        "Enter a valid email",
      );
    });

    it("throws for a blank email", async () => {
      await expect(manager.inviteStaff("  ")).rejects.toThrow("Enter a valid email");
    });

    it("throws when user already belongs to this org", async () => {
      (db.user.findUnique as Mock).mockResolvedValue({ organizationId: "org-1" });
      await expect(manager.inviteStaff("existing@example.com")).rejects.toThrow(
        "That person already belongs to your workspace",
      );
    });

    it("throws when email belongs to a different org", async () => {
      (db.user.findUnique as Mock).mockResolvedValue({ organizationId: "org-other" });
      await expect(manager.inviteStaff("other@example.com")).rejects.toThrow(
        "That email is already used by another workspace",
      );
    });

    it("creates an invitation for a new email", async () => {
      (db.user.findUnique as Mock).mockResolvedValue(null);
      (db.invitation.upsert as Mock).mockResolvedValue({ id: "inv-1", email: "new@example.com" });

      await manager.inviteStaff("new@example.com");

      expect(db.invitation.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ email: "new@example.com", organizationId: "org-1" }),
        }),
      );
    });

    it("normalises email to lowercase before creating invitation", async () => {
      (db.user.findUnique as Mock).mockResolvedValue(null);
      (db.invitation.upsert as Mock).mockResolvedValue({});

      await manager.inviteStaff("  UPPER@Example.COM  ");

      expect(db.invitation.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ email: "upper@example.com" }),
        }),
      );
    });
  });

  // ── revokeInvitation ───────────────────────────────────────────────────────

  describe("revokeInvitation", () => {
    it("throws Forbidden for staff", async () => {
      await expect(staff.revokeInvitation("inv-1")).rejects.toThrow(
        "Forbidden: manager role required",
      );
    });

    it("throws when invitation does not belong to the org", async () => {
      (db.invitation.findFirst as Mock).mockResolvedValue(null);
      await expect(manager.revokeInvitation("inv-999")).rejects.toThrow(
        "Invitation not found",
      );
    });

    it("deletes the invitation", async () => {
      (db.invitation.findFirst as Mock).mockResolvedValue({ id: "inv-1" });
      (db.invitation.delete as Mock).mockResolvedValue({});

      await manager.revokeInvitation("inv-1");

      expect(db.invitation.delete).toHaveBeenCalledWith({ where: { id: "inv-1" } });
    });

    it("scopes the lookup to the org to prevent cross-org revocation", async () => {
      (db.invitation.findFirst as Mock).mockResolvedValue({ id: "inv-1" });
      (db.invitation.delete as Mock).mockResolvedValue({});

      await manager.revokeInvitation("inv-1");

      expect(db.invitation.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ organizationId: "org-1" }) }),
      );
    });
  });

  // ── removeStaff ────────────────────────────────────────────────────────────

  describe("removeStaff", () => {
    it("throws Forbidden for staff", async () => {
      await expect(staff.removeStaff("user-other")).rejects.toThrow(
        "Forbidden: manager role required",
      );
    });

    it("throws when attempting to remove yourself", async () => {
      await expect(manager.removeStaff(managerCtx.userId)).rejects.toThrow(
        "You cannot remove yourself",
      );
    });

    it("throws when target user is not found in the org", async () => {
      (db.user.findFirst as Mock).mockResolvedValue(null);
      await expect(manager.removeStaff("user-other")).rejects.toThrow("User not found");
    });

    it("throws when target user is a manager", async () => {
      (db.user.findFirst as Mock).mockResolvedValue({ id: "user-other", role: "MANAGER" });
      await expect(manager.removeStaff("user-other")).rejects.toThrow(
        "Managers cannot be removed from this UI",
      );
    });

    it("detaches staff user from the org", async () => {
      (db.user.findFirst as Mock).mockResolvedValue({ id: "user-staff-2", role: "STAFF" });
      (db.user.update as Mock).mockResolvedValue({});

      await manager.removeStaff("user-staff-2");

      expect(db.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "user-staff-2" },
          data: expect.objectContaining({ organizationId: null }),
        }),
      );
    });

    it("scopes the target user lookup to the org", async () => {
      (db.user.findFirst as Mock).mockResolvedValue({ id: "user-staff-2", role: "STAFF" });
      (db.user.update as Mock).mockResolvedValue({});

      await manager.removeStaff("user-staff-2");

      expect(db.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ organizationId: "org-1" }) }),
      );
    });
  });
});
