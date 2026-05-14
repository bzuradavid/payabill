import {
  type PrismaClient,
  type Prisma,
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
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

type TxClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

const BILL_INCLUDE = {
  vendor: true,
  lineItems: {
    include: { glAccount: true },
    orderBy: { createdAt: "asc" as const },
  },
  payments: { orderBy: { createdAt: "desc" as const } },
  statusHistory: {
    include: { changedBy: { select: { name: true, email: true } } },
    orderBy: { createdAt: "asc" as const },
  },
} as const;

export class BillService {
  constructor(
    private db: PrismaClient,
    private ctx: UserContext,
  ) {}

  private scope() {
    return {
      organizationId: this.ctx.organizationId,
      ...(this.ctx.role === "STAFF" ? { createdById: this.ctx.userId } : {}),
    };
  }

  private requireManager() {
    if (this.ctx.role !== "MANAGER") {
      throw new Error("Forbidden: manager role required");
    }
  }

  private async logTransition(
    tx: TxClient | PrismaClient,
    billId: string,
    fromStatus: BillStatus | null,
    toStatus: BillStatus,
    note?: string,
  ) {
    await tx.billStatusHistory.create({
      data: {
        billId,
        fromStatus: fromStatus ?? undefined,
        toStatus,
        changedById: this.ctx.userId,
        note,
      },
    });
  }

  async list(filters: BillListFilters = {}) {
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = Math.max(1, filters.pageSize ?? 20);

    const where: Prisma.BillWhereInput = {
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
    };

    const orderBy =
      filters.sortBy === "createdAt"
        ? { createdAt: filters.sortDir ?? ("desc" as const) }
        : { dueDate: filters.sortDir ?? ("asc" as const) };

    const [bills, total] = await Promise.all([
      this.db.bill.findMany({
        where,
        include: {
          vendor: true,
          lineItems: true,
          payments: { orderBy: { createdAt: "desc" } },
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.db.bill.count({ where }),
    ]);

    return {
      data: bills.map((b) => ({
        ...b,
        totalAmount: b.lineItems.reduce((s, li) => s + li.amount, 0),
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
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
      where: { id: data.vendorId, organizationId: this.ctx.organizationId },
      select: { id: true },
    });
    if (!vendor) throw new Error("Vendor not found");

    const { lineItems, ...billData } = data;
    return this.db.$transaction(async (tx) => {
      const bill = await tx.bill.create({
        data: {
          ...billData,
          organizationId: this.ctx.organizationId,
          createdById: this.ctx.userId,
          status: BillStatus.DRAFT,
          lineItems: { create: lineItems },
        },
        include: BILL_INCLUDE,
      });
      await this.logTransition(tx, bill.id, null, BillStatus.DRAFT);
      return bill;
    });
  }

  async update(id: string, data: UpdateBillInput) {
    const bill = await this.db.bill.findFirst({
      where: { id, ...this.scope() },
    });
    if (!bill) throw new Error("Bill not found");
    if (bill.status !== BillStatus.DRAFT && bill.status !== BillStatus.REJECTED) {
      throw new Error("Only draft or rejected bills can be edited");
    }

    const isRejected = bill.status === BillStatus.REJECTED;
    const { lineItems, ...billData } = data;

    if (lineItems) {
      await this.db.billLineItem.deleteMany({ where: { billId: id } });
    }

    return this.db.$transaction(async (tx) => {
      const updated = await tx.bill.update({
        where: { id },
        data: {
          ...billData,
          ...(isRejected ? { status: BillStatus.DRAFT, rejectionReason: null } : {}),
          ...(lineItems ? { lineItems: { create: lineItems } } : {}),
        },
        include: BILL_INCLUDE,
      });
      if (isRejected) {
        await this.logTransition(tx, id, BillStatus.REJECTED, BillStatus.DRAFT);
      }
      return updated;
    });
  }

  async submit(id: string) {
    const bill = await this.db.bill.findFirst({
      where: { id, ...this.scope() },
      include: { lineItems: true },
    });
    if (!bill) throw new Error("Bill not found");
    if (bill.status !== BillStatus.DRAFT) {
      throw new Error("Only draft bills can be submitted");
    }
    if (bill.lineItems.length === 0) {
      throw new Error("Bill must have at least one line item");
    }
    return this.db.$transaction(async (tx) => {
      const updated = await tx.bill.update({
        where: { id },
        data: { status: BillStatus.PENDING_APPROVAL, submittedAt: new Date() },
        include: BILL_INCLUDE,
      });
      await this.logTransition(tx, id, BillStatus.DRAFT, BillStatus.PENDING_APPROVAL);
      return updated;
    });
  }

  async approve(id: string) {
    this.requireManager();
    const bill = await this.db.bill.findFirst({
      where: { id, organizationId: this.ctx.organizationId },
    });
    if (!bill) throw new Error("Bill not found");
    if (bill.status !== BillStatus.PENDING_APPROVAL) {
      throw new Error("Only pending bills can be approved");
    }
    return this.db.$transaction(async (tx) => {
      const updated = await tx.bill.update({
        where: { id },
        data: { status: BillStatus.APPROVED, approvedAt: new Date() },
        include: BILL_INCLUDE,
      });
      await this.logTransition(tx, id, BillStatus.PENDING_APPROVAL, BillStatus.APPROVED);
      return updated;
    });
  }

  async reject(id: string, reason: string) {
    this.requireManager();
    const bill = await this.db.bill.findFirst({
      where: { id, organizationId: this.ctx.organizationId },
    });
    if (!bill) throw new Error("Bill not found");
    if (bill.status !== BillStatus.PENDING_APPROVAL) {
      throw new Error("Only pending bills can be rejected");
    }
    return this.db.$transaction(async (tx) => {
      const updated = await tx.bill.update({
        where: { id },
        data: { status: BillStatus.REJECTED, rejectionReason: reason },
        include: BILL_INCLUDE,
      });
      await this.logTransition(tx, id, BillStatus.PENDING_APPROVAL, BillStatus.REJECTED, reason);
      return updated;
    });
  }

  async schedulePayment(id: string, scheduledDate: Date) {
    this.requireManager();
    const bill = await this.db.bill.findFirst({
      where: { id, organizationId: this.ctx.organizationId },
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
      await this.logTransition(tx, id, BillStatus.APPROVED, BillStatus.SCHEDULED);
      return updated;
    });
  }

  async markPaid(id: string) {
    this.requireManager();
    const bill = await this.db.bill.findFirst({
      where: { id, organizationId: this.ctx.organizationId },
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
          data: { status: PaymentStatus.COMPLETED, processedDate: new Date() },
        });
      }
      const updated = await tx.bill.update({
        where: { id },
        data: { status: BillStatus.PAID, paidAt: new Date() },
        include: BILL_INCLUDE,
      });
      await this.logTransition(tx, id, BillStatus.SCHEDULED, BillStatus.PAID);
      return updated;
    });
  }

  async void(id: string) {
    this.requireManager();
    const bill = await this.db.bill.findFirst({
      where: { id, organizationId: this.ctx.organizationId },
    });
    if (!bill) throw new Error("Bill not found");
    if (bill.status === BillStatus.PAID) {
      throw new Error("Paid bills cannot be voided");
    }
    return this.db.$transaction(async (tx) => {
      const updated = await tx.bill.update({
        where: { id },
        data: { status: BillStatus.VOID },
        include: BILL_INCLUDE,
      });
      await this.logTransition(tx, id, bill.status, BillStatus.VOID);
      return updated;
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

  async getPendingApprovals(limit = 5) {
    const bills = await this.db.bill.findMany({
      where: {
        organizationId: this.ctx.organizationId,
        status: BillStatus.PENDING_APPROVAL,
      },
      take: limit,
      orderBy: { submittedAt: "asc" },
      include: { vendor: true, lineItems: true, createdBy: { select: { name: true, email: true } } },
    });
    return bills.map((b) => ({
      ...b,
      totalAmount: b.lineItems.reduce((s, li) => s + li.amount, 0),
    }));
  }
}
