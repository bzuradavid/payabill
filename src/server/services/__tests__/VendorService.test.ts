import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import type { Mock } from "vitest";
import { VendorService } from "../VendorService";
import { makeMockDb, managerCtx, staffCtx, makeVendor } from "~/test/helpers";

describe("VendorService", () => {
  let db: ReturnType<typeof makeMockDb>;
  let manager: VendorService;
  let staff: VendorService;

  beforeEach(() => {
    db = makeMockDb();
    manager = new VendorService(db, managerCtx);
    staff = new VendorService(db, staffCtx);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ── create ─────────────────────────────────────────────────────────────────

  describe("create", () => {
    it("throws Forbidden for staff", () => {
      // create is not async — requireManager() throws synchronously
      expect(() => staff.create({ name: "ACME" })).toThrow("Forbidden: manager role required");
    });

    it("creates vendor scoped to the org", async () => {
      (db.vendor.create as Mock).mockResolvedValue(makeVendor());

      await manager.create({ name: "ACME", email: "billing@acme.com" });

      const [call] = (db.vendor.create as Mock).mock.calls;
      expect(call[0].data.organizationId).toBe("org-1");
      expect(call[0].data.name).toBe("ACME");
    });
  });

  // ── createInline ───────────────────────────────────────────────────────────

  describe("createInline", () => {
    it("staff can create a vendor inline (no role check)", async () => {
      (db.vendor.create as Mock).mockResolvedValue(makeVendor({ name: "Quick Vendor" }));

      await expect(
        staff.createInline({ name: "Quick Vendor" }),
      ).resolves.toBeDefined();
    });

    it("scopes the inline vendor to the org", async () => {
      (db.vendor.create as Mock).mockResolvedValue(makeVendor());

      await staff.createInline({ name: "Quick Vendor", email: "qv@example.com" });

      const [call] = (db.vendor.create as Mock).mock.calls;
      expect(call[0].data.organizationId).toBe("org-1");
    });
  });

  // ── update ─────────────────────────────────────────────────────────────────

  describe("update", () => {
    it("throws Forbidden for staff", async () => {
      await expect(staff.update("vendor-1", { name: "New Name" })).rejects.toThrow(
        "Forbidden: manager role required",
      );
    });

    it("throws when vendor is not found in the org", async () => {
      (db.vendor.findFirst as Mock).mockResolvedValue(null);
      await expect(manager.update("vendor-1", { name: "x" })).rejects.toThrow(
        "Vendor not found",
      );
    });

    it("updates the vendor", async () => {
      (db.vendor.findFirst as Mock).mockResolvedValue({ id: "vendor-1" });
      (db.vendor.update as Mock).mockResolvedValue(makeVendor({ name: "Updated" }));

      await manager.update("vendor-1", { name: "Updated" });

      const [call] = (db.vendor.update as Mock).mock.calls;
      expect(call[0].where).toEqual({ id: "vendor-1" });
      expect(call[0].data.name).toBe("Updated");
    });

    it("queries with correct org scope when looking up vendor", async () => {
      (db.vendor.findFirst as Mock).mockResolvedValue({ id: "vendor-1" });
      (db.vendor.update as Mock).mockResolvedValue(makeVendor());

      await manager.update("vendor-1", { phone: "555-1234" });

      const [lookupCall] = (db.vendor.findFirst as Mock).mock.calls;
      expect(lookupCall[0].where).toEqual({ id: "vendor-1", organizationId: "org-1" });
    });
  });

  // ── deactivate ─────────────────────────────────────────────────────────────

  describe("deactivate", () => {
    it("throws Forbidden for staff", async () => {
      await expect(staff.deactivate("vendor-1")).rejects.toThrow(
        "Forbidden: manager role required",
      );
    });

    it("throws when vendor is not found in the org", async () => {
      (db.vendor.findFirst as Mock).mockResolvedValue(null);
      await expect(manager.deactivate("vendor-1")).rejects.toThrow("Vendor not found");
    });

    it("sets vendor status to INACTIVE", async () => {
      (db.vendor.findFirst as Mock).mockResolvedValue({ id: "vendor-1" });
      (db.vendor.update as Mock).mockResolvedValue(makeVendor({ status: "INACTIVE" }));

      await manager.deactivate("vendor-1");

      const [call] = (db.vendor.update as Mock).mock.calls;
      expect(call[0].data.status).toBe("INACTIVE");
    });
  });

  // ── list ───────────────────────────────────────────────────────────────────

  describe("list", () => {
    it("scopes query to the org", async () => {
      (db.vendor.findMany as Mock).mockResolvedValue([]);

      await manager.list();

      const [call] = (db.vendor.findMany as Mock).mock.calls;
      expect(call[0].where.organizationId).toBe("org-1");
    });

    it("computes totalPaid from paid bills' line items", async () => {
      const vendorWithBills = {
        ...makeVendor(),
        _count: { bills: 2 },
        bills: [
          {
            id: "b1",
            lineItems: [
              { amount: 300 },
              { amount: 200 },
            ],
          },
        ],
      };
      (db.vendor.findMany as Mock).mockResolvedValue([vendorWithBills]);

      const result = await manager.list();
      expect(result[0]!.totalPaid).toBe(500);
    });

    it("applies search filter to name and email", async () => {
      (db.vendor.findMany as Mock).mockResolvedValue([]);

      await manager.list({ search: "acme" });

      const [call] = (db.vendor.findMany as Mock).mock.calls;
      expect(call[0].where.OR).toBeDefined();
    });
  });

  // ── getById ────────────────────────────────────────────────────────────────

  describe("getById", () => {
    it("returns null when vendor not in org", async () => {
      (db.vendor.findFirst as Mock).mockResolvedValue(null);
      const result = await manager.getById("vendor-other");
      expect(result).toBeNull();
    });

    it("queries with correct org scope", async () => {
      (db.vendor.findFirst as Mock).mockResolvedValue(makeVendor());

      await manager.getById("vendor-1");

      const [call] = (db.vendor.findFirst as Mock).mock.calls;
      expect(call[0].where).toMatchObject({ id: "vendor-1", organizationId: "org-1" });
    });
  });
});
