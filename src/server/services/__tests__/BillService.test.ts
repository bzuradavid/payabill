import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import type { Mock } from "vitest";
import { BillService } from "../BillService";
import { BillStatus, PaymentStatus } from "../../../../generated/prisma";
import {
  makeMockDb,
  managerCtx,
  staffCtx,
  makeBill,
  makeLineItem,
  makePayment,
} from "~/test/helpers";

describe("BillService", () => {
  let db: ReturnType<typeof makeMockDb>;
  let manager: BillService;
  let staff: BillService;

  beforeEach(() => {
    db = makeMockDb();
    manager = new BillService(db, managerCtx);
    staff = new BillService(db, staffCtx);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ── scope ──────────────────────────────────────────────────────────────────

  describe("scope (role-based filtering)", () => {
    it("manager list includes all org bills without createdById filter", async () => {
      (db.bill.findMany as Mock).mockResolvedValue([]);
      await manager.list();
      expect(db.bill.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ organizationId: "org-1" }) }),
      );
      expect(db.bill.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({ createdById: expect.anything() }),
        }),
      );
    });

    it("staff list filters to their own bills via createdById", async () => {
      (db.bill.findMany as Mock).mockResolvedValue([]);
      await staff.list();
      expect(db.bill.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: "org-1",
            createdById: staffCtx.userId,
          }),
        }),
      );
    });
  });

  // ── list ───────────────────────────────────────────────────────────────────

  describe("list", () => {
    it("returns bills with computed totalAmount", async () => {
      const bill = makeBill({
        lineItems: [
          makeLineItem({ amount: 100 }),
          makeLineItem({ id: "li-2", amount: 250 }),
        ],
      });
      (db.bill.findMany as Mock).mockResolvedValue([bill]);
      (db.bill.count as Mock).mockResolvedValue(1);

      const result = await manager.list();
      expect(result.data[0]!.totalAmount).toBe(350);
    });

    it("applies status filter", async () => {
      (db.bill.findMany as Mock).mockResolvedValue([]);
      await manager.list({ statuses: [BillStatus.DRAFT] });
      expect(db.bill.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: { in: [BillStatus.DRAFT] } }),
        }),
      );
    });

    it("applies search filter", async () => {
      (db.bill.findMany as Mock).mockResolvedValue([]);
      await manager.list({ search: "ACME" });
      expect(db.bill.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ OR: expect.anything() }),
        }),
      );
    });
  });

  // ── create ─────────────────────────────────────────────────────────────────

  describe("create", () => {
    it("throws when vendor does not belong to the org", async () => {
      (db.vendor.findFirst as Mock).mockResolvedValue(null);
      await expect(
        manager.create({
          vendorId: "other-vendor",
          invoiceDate: new Date(),
          dueDate: new Date(),
          lineItems: [],
        }),
      ).rejects.toThrow("Vendor not found");
    });

    it("creates bill in DRAFT status with correct org and createdBy", async () => {
      (db.vendor.findFirst as Mock).mockResolvedValue({ id: "vendor-1" });
      const created = makeBill({ status: BillStatus.DRAFT });
      (db.bill.create as Mock).mockResolvedValue(created);

      await manager.create({
        vendorId: "vendor-1",
        invoiceDate: new Date(),
        dueDate: new Date(),
        lineItems: [{ description: "Widget", quantity: 1, unitPrice: 100, amount: 100 }],
      });

      expect(db.bill.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: BillStatus.DRAFT,
            organizationId: "org-1",
            createdById: managerCtx.userId,
          }),
        }),
      );
    });
  });

  // ── update ─────────────────────────────────────────────────────────────────

  describe("update", () => {
    it("throws when bill is not found", async () => {
      (db.bill.findFirst as Mock).mockResolvedValue(null);
      await expect(manager.update("bill-1", { memo: "x" })).rejects.toThrow("Bill not found");
    });

    it("throws when bill is not in DRAFT status", async () => {
      (db.bill.findFirst as Mock).mockResolvedValue(
        makeBill({ status: BillStatus.PENDING_APPROVAL }),
      );
      await expect(manager.update("bill-1", { memo: "x" })).rejects.toThrow(
        "Only draft bills can be edited",
      );
    });

    it("replaces line items when provided", async () => {
      (db.bill.findFirst as Mock).mockResolvedValue(makeBill({ status: BillStatus.DRAFT }));
      (db.billLineItem.deleteMany as Mock).mockResolvedValue({});
      (db.bill.update as Mock).mockResolvedValue(makeBill());

      await manager.update("bill-1", {
        lineItems: [{ description: "New", quantity: 2, unitPrice: 50, amount: 100 }],
      });

      expect(db.billLineItem.deleteMany).toHaveBeenCalledWith({ where: { billId: "bill-1" } });
    });
  });

  // ── submit ─────────────────────────────────────────────────────────────────

  describe("submit", () => {
    it("throws when bill is not found", async () => {
      (db.bill.findFirst as Mock).mockResolvedValue(null);
      await expect(manager.submit("bill-1")).rejects.toThrow("Bill not found");
    });

    it("throws when bill is not DRAFT", async () => {
      (db.bill.findFirst as Mock).mockResolvedValue(
        makeBill({ status: BillStatus.PENDING_APPROVAL }),
      );
      await expect(manager.submit("bill-1")).rejects.toThrow(
        "Only draft bills can be submitted",
      );
    });

    it("throws when bill has no line items", async () => {
      (db.bill.findFirst as Mock).mockResolvedValue(
        makeBill({ status: BillStatus.DRAFT, lineItems: [] }),
      );
      await expect(manager.submit("bill-1")).rejects.toThrow(
        "Bill must have at least one line item",
      );
    });

    it("transitions DRAFT → PENDING_APPROVAL", async () => {
      (db.bill.findFirst as Mock).mockResolvedValue(
        makeBill({ status: BillStatus.DRAFT, lineItems: [makeLineItem()] }),
      );
      (db.bill.update as Mock).mockResolvedValue(makeBill({ status: BillStatus.PENDING_APPROVAL }));

      await manager.submit("bill-1");

      expect(db.bill.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: BillStatus.PENDING_APPROVAL,
            submittedAt: expect.any(Date),
          }),
        }),
      );
    });

    it("staff can submit their own bills", async () => {
      (db.bill.findFirst as Mock).mockResolvedValue(
        makeBill({ status: BillStatus.DRAFT, lineItems: [makeLineItem()] }),
      );
      (db.bill.update as Mock).mockResolvedValue(makeBill({ status: BillStatus.PENDING_APPROVAL }));

      await expect(staff.submit("bill-1")).resolves.toBeDefined();
    });
  });

  // ── approve ────────────────────────────────────────────────────────────────

  describe("approve", () => {
    it("throws Forbidden for staff", async () => {
      await expect(staff.approve("bill-1")).rejects.toThrow(
        "Forbidden: manager role required",
      );
    });

    it("throws when bill is not found", async () => {
      (db.bill.findFirst as Mock).mockResolvedValue(null);
      await expect(manager.approve("bill-1")).rejects.toThrow("Bill not found");
    });

    it("throws when bill is not PENDING_APPROVAL", async () => {
      (db.bill.findFirst as Mock).mockResolvedValue(makeBill({ status: BillStatus.DRAFT }));
      await expect(manager.approve("bill-1")).rejects.toThrow(
        "Only pending bills can be approved",
      );
    });

    it("transitions PENDING_APPROVAL → APPROVED", async () => {
      (db.bill.findFirst as Mock).mockResolvedValue(
        makeBill({ status: BillStatus.PENDING_APPROVAL }),
      );
      (db.bill.update as Mock).mockResolvedValue(makeBill({ status: BillStatus.APPROVED }));

      await manager.approve("bill-1");

      expect(db.bill.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: BillStatus.APPROVED,
            approvedAt: expect.any(Date),
          }),
        }),
      );
    });
  });

  // ── reject ─────────────────────────────────────────────────────────────────

  describe("reject", () => {
    it("throws Forbidden for staff", async () => {
      await expect(staff.reject("bill-1", "reason")).rejects.toThrow(
        "Forbidden: manager role required",
      );
    });

    it("throws when bill is not PENDING_APPROVAL", async () => {
      (db.bill.findFirst as Mock).mockResolvedValue(makeBill({ status: BillStatus.APPROVED }));
      await expect(manager.reject("bill-1", "reason")).rejects.toThrow(
        "Only pending bills can be rejected",
      );
    });

    it("transitions PENDING_APPROVAL → REJECTED with reason", async () => {
      (db.bill.findFirst as Mock).mockResolvedValue(
        makeBill({ status: BillStatus.PENDING_APPROVAL }),
      );
      (db.bill.update as Mock).mockResolvedValue(
        makeBill({ status: BillStatus.REJECTED, rejectionReason: "Missing PO" }),
      );

      await manager.reject("bill-1", "Missing PO");

      expect(db.bill.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: BillStatus.REJECTED,
            rejectionReason: "Missing PO",
          }),
        }),
      );
    });
  });

  // ── schedulePayment ────────────────────────────────────────────────────────

  describe("schedulePayment", () => {
    it("throws Forbidden for staff", async () => {
      await expect(staff.schedulePayment("bill-1", new Date())).rejects.toThrow(
        "Forbidden: manager role required",
      );
    });

    it("throws when bill is not found", async () => {
      (db.bill.findFirst as Mock).mockResolvedValue(null);
      await expect(manager.schedulePayment("bill-1", new Date())).rejects.toThrow("Bill not found");
    });

    it("throws when bill is not APPROVED", async () => {
      (db.bill.findFirst as Mock).mockResolvedValue(
        makeBill({ status: BillStatus.PENDING_APPROVAL }),
      );
      await expect(manager.schedulePayment("bill-1", new Date())).rejects.toThrow(
        "Only approved bills can be scheduled",
      );
    });

    it("transitions APPROVED → SCHEDULED and creates Payment", async () => {
      const bill = makeBill({
        status: BillStatus.APPROVED,
        paymentMethod: "ACH",
        lineItems: [makeLineItem({ amount: 500 })],
      });
      (db.bill.findFirst as Mock).mockResolvedValue(bill);
      (db.bill.update as Mock).mockResolvedValue(makeBill({ status: BillStatus.SCHEDULED }));
      (db.payment.create as Mock).mockResolvedValue({});

      const scheduledDate = new Date("2025-03-01");
      await manager.schedulePayment("bill-1", scheduledDate);

      expect(db.bill.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: BillStatus.SCHEDULED }),
        }),
      );
      expect(db.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amount: 500,
            status: PaymentStatus.PENDING,
            scheduledDate,
          }),
        }),
      );
    });
  });

  // ── markPaid ───────────────────────────────────────────────────────────────

  describe("markPaid", () => {
    it("throws Forbidden for staff", async () => {
      await expect(staff.markPaid("bill-1")).rejects.toThrow(
        "Forbidden: manager role required",
      );
    });

    it("throws when bill is not SCHEDULED", async () => {
      (db.bill.findFirst as Mock).mockResolvedValue(makeBill({ status: BillStatus.APPROVED }));
      await expect(manager.markPaid("bill-1")).rejects.toThrow(
        "Only scheduled bills can be marked as paid",
      );
    });

    it("transitions SCHEDULED → PAID and completes the pending payment", async () => {
      const pendingPayment = makePayment({ status: PaymentStatus.PENDING });
      (db.bill.findFirst as Mock).mockResolvedValue(
        makeBill({ status: BillStatus.SCHEDULED, payments: [pendingPayment] }),
      );
      (db.payment.update as Mock).mockResolvedValue({});
      (db.bill.update as Mock).mockResolvedValue(makeBill({ status: BillStatus.PAID }));

      await manager.markPaid("bill-1");

      expect(db.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: PaymentStatus.COMPLETED,
            processedDate: expect.any(Date),
          }),
        }),
      );
      expect(db.bill.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: BillStatus.PAID,
            paidAt: expect.any(Date),
          }),
        }),
      );
    });

    it("marks bill as paid even when no payment record exists", async () => {
      (db.bill.findFirst as Mock).mockResolvedValue(
        makeBill({ status: BillStatus.SCHEDULED, payments: [] }),
      );
      (db.bill.update as Mock).mockResolvedValue(makeBill({ status: BillStatus.PAID }));

      await manager.markPaid("bill-1");

      expect(db.payment.update).not.toHaveBeenCalled();
      expect(db.bill.update).toHaveBeenCalled();
    });
  });

  // ── void ───────────────────────────────────────────────────────────────────

  describe("void", () => {
    it("throws Forbidden for staff", async () => {
      await expect(staff.void("bill-1")).rejects.toThrow(
        "Forbidden: manager role required",
      );
    });

    it("throws when bill is not found", async () => {
      (db.bill.findFirst as Mock).mockResolvedValue(null);
      await expect(manager.void("bill-1")).rejects.toThrow("Bill not found");
    });

    it("throws when bill is already PAID", async () => {
      (db.bill.findFirst as Mock).mockResolvedValue(makeBill({ status: BillStatus.PAID }));
      await expect(manager.void("bill-1")).rejects.toThrow("Paid bills cannot be voided");
    });

    it.each([
      BillStatus.DRAFT,
      BillStatus.PENDING_APPROVAL,
      BillStatus.APPROVED,
      BillStatus.SCHEDULED,
      BillStatus.REJECTED,
    ])("voids bill in %s status", async (status) => {
      (db.bill.findFirst as Mock).mockResolvedValue(makeBill({ status }));
      (db.bill.update as Mock).mockResolvedValue(makeBill({ status: BillStatus.VOID }));

      await manager.void("bill-1");

      expect(db.bill.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: BillStatus.VOID }),
        }),
      );
    });
  });

  // ── getDashboardStats ──────────────────────────────────────────────────────

  describe("getDashboardStats", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-01T12:00:00Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    function makeActiveBill(opts: { dueDate: Date; status: BillStatus; amount: number }) {
      return makeBill({
        status: opts.status,
        dueDate: opts.dueDate,
        lineItems: [makeLineItem({ amount: opts.amount })],
      });
    }

    it("sums totalPayable from all active bills", async () => {
      const activeBills = [
        makeActiveBill({ dueDate: new Date("2025-06-15"), status: BillStatus.DRAFT, amount: 200 }),
        makeActiveBill({ dueDate: new Date("2025-06-20"), status: BillStatus.APPROVED, amount: 300 }),
      ];
      (db.bill.findMany as Mock)
        .mockResolvedValueOnce(activeBills)
        .mockResolvedValueOnce([]);

      const stats = await manager.getDashboardStats();
      expect(stats.totalPayable).toBe(500);
    });

    it("counts overdue bills (past due, non-DRAFT)", async () => {
      const activeBills = [
        // overdue — PENDING_APPROVAL, due yesterday
        makeActiveBill({ dueDate: new Date("2025-05-31"), status: BillStatus.PENDING_APPROVAL, amount: 100 }),
        // NOT overdue — DRAFT even though past due
        makeActiveBill({ dueDate: new Date("2025-05-31"), status: BillStatus.DRAFT, amount: 50 }),
        // NOT overdue — due in the future
        makeActiveBill({ dueDate: new Date("2025-06-10"), status: BillStatus.APPROVED, amount: 200 }),
      ];
      (db.bill.findMany as Mock)
        .mockResolvedValueOnce(activeBills)
        .mockResolvedValueOnce([]);

      const stats = await manager.getDashboardStats();
      expect(stats.overdueCount).toBe(1);
      expect(stats.overdueAmount).toBe(100);
    });

    it("DRAFT bills are not counted as overdue even if past due date", async () => {
      const activeBills = [
        makeActiveBill({ dueDate: new Date("2025-01-01"), status: BillStatus.DRAFT, amount: 999 }),
      ];
      (db.bill.findMany as Mock)
        .mockResolvedValueOnce(activeBills)
        .mockResolvedValueOnce([]);

      const stats = await manager.getDashboardStats();
      expect(stats.overdueCount).toBe(0);
    });

    it("counts bills due within 7 days as dueSoon", async () => {
      const activeBills = [
        // due in 3 days — within window
        makeActiveBill({ dueDate: new Date("2025-06-04"), status: BillStatus.APPROVED, amount: 150 }),
        // due in 8 days — outside window
        makeActiveBill({ dueDate: new Date("2025-06-09"), status: BillStatus.APPROVED, amount: 200 }),
      ];
      (db.bill.findMany as Mock)
        .mockResolvedValueOnce(activeBills)
        .mockResolvedValueOnce([]);

      const stats = await manager.getDashboardStats();
      expect(stats.dueSoonCount).toBe(1);
      expect(stats.dueSoonAmount).toBe(150);
    });

    it("sums paidThisMonthAmount from second query results", async () => {
      const paidBills = [
        makeBill({ status: BillStatus.PAID, lineItems: [makeLineItem({ amount: 400 })] }),
        makeBill({ id: "bill-2", status: BillStatus.PAID, lineItems: [makeLineItem({ id: "li-2", amount: 600 })] }),
      ];
      (db.bill.findMany as Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(paidBills);

      const stats = await manager.getDashboardStats();
      expect(stats.paidThisMonthAmount).toBe(1000);
      expect(stats.paidThisMonthCount).toBe(2);
    });
  });
});
