import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import type { Mock } from "vitest";

// These modules must be mocked before the module under test is loaded.
vi.mock("server-only", () => ({}));

const mockDb = {
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
  invitation: {
    findFirst: vi.fn(),
    delete: vi.fn(),
  },
  organization: {
    create: vi.fn(),
  },
  $transaction: vi.fn().mockImplementation(
    (ops: Promise<unknown>[]) => Promise.all(ops),
  ),
};

vi.mock("~/server/db", () => ({ db: mockDb }));

// Import after mocks are registered (vi.mock calls are hoisted, so order is safe)
const { assignUserToOrganization } = await import("~/server/assign-org");

describe("assignUserToOrganization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Restore the $transaction mock after clearAllMocks resets it
    (mockDb.$transaction as Mock).mockImplementation(
      (ops: Promise<unknown>[]) => Promise.all(ops),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("does nothing when the user already has an org", async () => {
    (mockDb.user.findUnique as Mock).mockResolvedValue({ organizationId: "existing-org" });

    await assignUserToOrganization("user-1", "user@example.com", "Alice");

    expect(mockDb.invitation.findFirst).not.toHaveBeenCalled();
    expect(mockDb.organization.create).not.toHaveBeenCalled();
    expect(mockDb.user.update).not.toHaveBeenCalled();
  });

  it("does nothing when the user row does not exist", async () => {
    (mockDb.user.findUnique as Mock).mockResolvedValue(null);

    await assignUserToOrganization("user-ghost", "ghost@example.com");

    expect(mockDb.organization.create).not.toHaveBeenCalled();
    expect(mockDb.user.update).not.toHaveBeenCalled();
  });

  it("creates a new org and makes the user MANAGER when no invitation matches", async () => {
    (mockDb.user.findUnique as Mock).mockResolvedValue({ organizationId: null });
    (mockDb.invitation.findFirst as Mock).mockResolvedValue(null);
    (mockDb.organization.create as Mock).mockResolvedValue({ id: "new-org" });
    (mockDb.user.update as Mock).mockResolvedValue({});

    await assignUserToOrganization("user-1", "user@example.com", "Alice");

    expect(mockDb.organization.create).toHaveBeenCalledWith({
      data: { name: "Alice's Workspace" },
    });

    const [call] = (mockDb.user.update as Mock).mock.calls;
    expect(call[0].data.organizationId).toBe("new-org");
    expect(call[0].data.role).toBe("MANAGER");
  });

  it("joins an existing org as STAFF when a pending invitation matches the email", async () => {
    (mockDb.user.findUnique as Mock).mockResolvedValue({ organizationId: null });
    (mockDb.invitation.findFirst as Mock).mockResolvedValue({
      id: "inv-1",
      organizationId: "invited-org",
      email: "invited@example.com",
    });
    (mockDb.user.update as Mock).mockResolvedValue({});
    (mockDb.invitation.delete as Mock).mockResolvedValue({});

    await assignUserToOrganization("user-1", "invited@example.com");

    expect(mockDb.organization.create).not.toHaveBeenCalled();

    expect(mockDb.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user-1" },
        data: { organizationId: "invited-org", role: "STAFF" },
      }),
    );
    expect(mockDb.invitation.delete).toHaveBeenCalledWith({ where: { id: "inv-1" } });
  });

  it("normalises the email to lowercase when looking up invitations", async () => {
    (mockDb.user.findUnique as Mock).mockResolvedValue({ organizationId: null });
    (mockDb.invitation.findFirst as Mock).mockResolvedValue(null);
    (mockDb.organization.create as Mock).mockResolvedValue({ id: "new-org" });
    (mockDb.user.update as Mock).mockResolvedValue({});

    await assignUserToOrganization("user-1", "CAPS@Example.COM", "Bob");

    const [invCall] = (mockDb.invitation.findFirst as Mock).mock.calls;
    expect(invCall[0].where.email).toBe("caps@example.com");
  });

  it("uses email prefix as workspace name when no display name is provided", async () => {
    (mockDb.user.findUnique as Mock).mockResolvedValue({ organizationId: null });
    (mockDb.invitation.findFirst as Mock).mockResolvedValue(null);
    (mockDb.organization.create as Mock).mockResolvedValue({ id: "new-org" });
    (mockDb.user.update as Mock).mockResolvedValue({});

    await assignUserToOrganization("user-1", "someone@company.com", undefined);

    const [call] = (mockDb.organization.create as Mock).mock.calls;
    expect(call[0].data.name).toBe("someone's Workspace");
  });

  it("falls back to 'My Workspace' when email and name are both absent", async () => {
    (mockDb.user.findUnique as Mock).mockResolvedValue({ organizationId: null });
    (mockDb.invitation.findFirst as Mock).mockResolvedValue(null);
    (mockDb.organization.create as Mock).mockResolvedValue({ id: "new-org" });
    (mockDb.user.update as Mock).mockResolvedValue({});

    await assignUserToOrganization("user-1", null, null);

    const [call] = (mockDb.organization.create as Mock).mock.calls;
    expect(call[0].data.name).toBe("My Workspace");
  });
});
