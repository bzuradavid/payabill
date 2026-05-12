import {
  type PrismaClient,
  BillStatus,
  PaymentStatus,
  type PaymentMethod,
} from "../../../generated/prisma";
import { type UserContext } from "~/server/get-user";

export interface CreateLineItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  glAccountId?: string;
}

export interface CreateBillInput {
  vendorId: string;
  invoiceNumber?: string;
  invoiceDate: Date;
  dueDate: Date;
  paymentMethod?: PaymentMethod;
  memo?: string;
  lineItems: CreateLineItemInput[];
}

export interface UpdateBillInput extends Omit<Partial<CreateBillInput>, "lineItems"> {
  lineItems?: CreateLineItemInput[];
}

export interface BillListFilters {
  statuses?: BillStatus[];
  search?: string;
  sortBy?: "dueDate" | "amount" | "createdAt";
  sortDir?: "asc" | "desc";
}

const BILL_INCLUDE = {
  vendor: true,
  lineItems: {
    include: { glAccount: true },
    orderBy: { createdAt: "asc" as const },
  },
  payments: { orderBy: { createdAt: "desc" as const } },
} as const;

export class BillService {
  constructor(
    private db: PrismaClient,
    private ctx: UserContext,
  ) {}

  /** Base where-clause scoping every query to the current user and honoring showSeed. */
  private scope() {
    return {
      userId: this.ctx.userId,
      ...(this.ctx.showSeed ? {} : { seed: false }),
    };
  }

  async list(filters: BillListFilters = {}) {
    const bills = await this.db.bill.findMany({
      where: {
        ...this.scope(),
        ...(filters.statuses?.length ? { status: { in: filters.statuses } } : {}),
        ...(filters.search
          ? {
              OR: [
                {
                  vendor: {
                    name: { contains: filters.search, mode: "insensitive" },
                  },
                },
                {
                  invoiceNumber: {
                    contains: filters.search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        vendor: true,
        lineItems: true,
        payments: { orderBy: { createdAt: "desc" } },
      },
      orderBy:
        filters.sortBy === "dueDate"
          ? { dueDate: filters.sortDir ?? "asc" }
          : filters.sortBy === "createdAt"
            ? { createdAt: filters.sortDir ?? "desc" }
            : { dueDate: filters.sortDir ?? "asc" },
    });

    return bills.map((b) => ({
      ...b,
      totalAmount: b.lineItems.reduce((s, li) => s + li.amount, 0),
    }));
  }

  async getById(id: string) {
    const bill = await this.db.bill.findFirst({
      where: { id, ...this.scope() },
      include: BILL_INCLUDE,
    });
    if (!bill) return null;
    return {
      ...bill,
      totalAmount: bill.lineItems.reduce((s, li) => s + li.amount, 0),
    };
  }

  async create(data: CreateBillInput) {
    const vendor = await this.db.vendor.findFirst({
      where: { id: data.vendorId, userId: this.ctx.userId },
      select: { id: true },
    });
    if (!vendor) throw new Error("Vendor not found");

    const { lineItems, ...billData } = data;
    return this.db.bill.create({
      data: {
        ...billData,
        userId: this.ctx.userId,
        status: BillStatus.DRAFT,
        lineItems: { create: lineItems },
      },
      include: BILL_INCLUDE,
    });
  }

  async update(id: string, data: UpdateBillInput) {
    const bill = await this.db.bill.findFirst({
      where: { id, userId: this.ctx.userId },
    });
    if (!bill) throw new Error("Bill not found");
    if (bill.status !== BillStatus.DRAFT) {
      throw new Error("Only draft bills can be edited");
    }

    const { lineItems, ...billData } = data;
    if (lineItems) {
      await this.db.billLineItem.deleteMany({ where: { billId: id } });
    }

    return this.db.bill.update({
      where: { id },
      data: {
        ...billData,
        ...(lineItems ? { lineItems: { create: lineItems } } : {}),
      },
      include: BILL_INCLUDE,
    });
  }

  async submit(id: string) {
    const bill = await this.db.bill.findFirst({
      where: { id, userId: this.ctx.userId },
      include: { lineItems: true },
    });
    if (!bill) throw new Error("Bill not found");
    if (bill.status !== BillStatus.DRAFT) {
      throw new Error("Only draft bills can be submitted");
    }
    if (bill.lineItems.length === 0) {
      throw new Error("Bill must have at least one line item");
    }
    return this.db.bill.update({
      where: { id },
      data: { status: BillStatus.PENDING_APPROVAL, submittedAt: new Date() },
      include: BILL_INCLUDE,
    });
  }

  async approve(id: string) {
    const bill = await this.db.bill.findFirst({
      where: { id, userId: this.ctx.userId },
    });
    if (!bill) throw new Error("Bill not found");
    if (bill.status !== BillStatus.PENDING_APPROVAL) {
      throw new Error("Only pending bills can be approved");
    }
    return this.db.bill.update({
      where: { id },
      data: { status: BillStatus.APPROVED, approvedAt: new Date() },
      include: BILL_INCLUDE,
    });
  }

  async reject(id: string, reason: string) {
    const bill = await this.db.bill.findFirst({
      where: { id, userId: this.ctx.userId },
    });
    if (!bill) throw new Error("Bill not found");
    if (bill.status !== BillStatus.PENDING_APPROVAL) {
      throw new Error("Only pending bills can be rejected");
    }
    return this.db.bill.update({
      where: { id },
      data: {
        status: BillStatus.REJECTED,
        rejectionReason: reason,
      },
      include: BILL_INCLUDE,
    });
  }

  async schedulePayment(id: string, scheduledDate: Date) {
    const bill = await this.db.bill.findFirst({
      where: { id, userId: this.ctx.userId },
      include: { lineItems: true },
    });
    if (!bill) throw new Error("Bill not found");
    if (bill.status !== BillStatus.APPROVED) {
      throw new Error("Only approved bills can be scheduled");
    }

    const totalAmount = bill.lineItems.reduce((s, li) => s + li.amount, 0);

    return this.db.$transaction(async (tx) => {
      const updated = await tx.bill.update({
        where: { id },
        data: { status: BillStatus.SCHEDULED },
        include: BILL_INCLUDE,
      });
      await tx.payment.create({
        data: {
          billId: id,
          amount: totalAmount,
          method: bill.paymentMethod ?? "ACH",
          status: PaymentStatus.PENDING,
          scheduledDate,
        },
      });
      return updated;
    });
  }

  async markPaid(id: string) {
    const bill = await this.db.bill.findFirst({
      where: { id, userId: this.ctx.userId },
      include: { payments: true },
    });
    if (!bill) throw new Error("Bill not found");
    if (bill.status !== BillStatus.SCHEDULED) {
      throw new Error("Only scheduled bills can be marked as paid");
    }

    return this.db.$transaction(async (tx) => {
      const pendingPayment = bill.payments.find(
        (p) => p.status === PaymentStatus.PENDING,
      );
      if (pendingPayment) {
        await tx.payment.update({
          where: { id: pendingPayment.id },
          data: {
            status: PaymentStatus.COMPLETED,
            processedDate: new Date(),
          },
        });
      }
      return tx.bill.update({
        where: { id },
        data: { status: BillStatus.PAID, paidAt: new Date() },
        include: BILL_INCLUDE,
      });
    });
  }

  async void(id: string) {
    const bill = await this.db.bill.findFirst({
      where: { id, userId: this.ctx.userId },
    });
    if (!bill) throw new Error("Bill not found");
    if (bill.status === BillStatus.PAID) {
      throw new Error("Paid bills cannot be voided");
    }
    return this.db.bill.update({
      where: { id },
      data: { status: BillStatus.VOID },
      include: BILL_INCLUDE,
    });
  }

  async getDashboardStats() {
    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [allActiveBills, paidThisMonth] = await Promise.all([
      this.db.bill.findMany({
        where: {
          ...this.scope(),
          status: {
            in: [
              BillStatus.DRAFT,
              BillStatus.PENDING_APPROVAL,
              BillStatus.APPROVED,
              BillStatus.SCHEDULED,
            ],
          },
        },
        include: { lineItems: true },
      }),
      this.db.bill.findMany({
        where: {
          ...this.scope(),
          status: BillStatus.PAID,
          paidAt: { gte: startOfMonth },
        },
        include: { lineItems: true },
      }),
    ]);

    const totalPayable = allActiveBills.reduce(
      (sum, b) => sum + b.lineItems.reduce((s, li) => s + li.amount, 0),
      0,
    );

    const overdueBills = allActiveBills.filter(
      (b) => b.dueDate < now && b.status !== BillStatus.DRAFT,
    );
    const overdueAmount = overdueBills.reduce(
      (sum, b) => sum + b.lineItems.reduce((s, li) => s + li.amount, 0),
      0,
    );

    const dueSoonBills = allActiveBills.filter(
      (b) => b.dueDate >= now && b.dueDate <= sevenDaysFromNow,
    );
    const dueSoonAmount = dueSoonBills.reduce(
      (sum, b) => sum + b.lineItems.reduce((s, li) => s + li.amount, 0),
      0,
    );

    const paidThisMonthAmount = paidThisMonth.reduce(
      (sum, b) => sum + b.lineItems.reduce((s, li) => s + li.amount, 0),
      0,
    );

    return {
      totalPayable,
      overdueCount: overdueBills.length,
      overdueAmount,
      dueSoonCount: dueSoonBills.length,
      dueSoonAmount,
      paidThisMonthAmount,
      paidThisMonthCount: paidThisMonth.length,
    };
  }

  async getRecentBills(limit = 8) {
    const bills = await this.db.bill.findMany({
      where: this.scope(),
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: { vendor: true, lineItems: true },
    });
    return bills.map((b) => ({
      ...b,
      totalAmount: b.lineItems.reduce((s, li) => s + li.amount, 0),
    }));
  }
}
