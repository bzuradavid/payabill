import {
  type PrismaClient,
  type VendorStatus,
  type PaymentMethod,
  BillStatus,
} from "../../../generated/prisma";
import { type UserContext } from "~/server/get-user";

export interface CreateVendorInput {
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  defaultPaymentMethod?: PaymentMethod;
  bankName?: string;
  bankRoutingNumber?: string;
  bankAccountNumber?: string;
  taxId?: string;
}

export type UpdateVendorInput = Partial<CreateVendorInput>;

export interface VendorListFilters {
  search?: string;
  status?: VendorStatus;
}

export interface CreateInlineVendorInput {
  name: string;
  email?: string;
  defaultPaymentMethod?: PaymentMethod;
}

export class VendorService {
  constructor(
    private db: PrismaClient,
    private ctx: UserContext,
  ) {}

  private requireManager() {
    if (this.ctx.role !== "MANAGER") {
      throw new Error("Forbidden: manager role required");
    }
  }

  async list(filters: VendorListFilters = {}) {
    const vendors = await this.db.vendor.findMany({
      where: {
        organizationId: this.ctx.organizationId,
        status: filters.status,
        ...(filters.search
          ? {
              OR: [
                { name: { contains: filters.search, mode: "insensitive" } },
                { email: { contains: filters.search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        _count: {
          select: {
            bills: {
              where: {
                status: {
                  notIn: [BillStatus.VOID, BillStatus.REJECTED],
                },
              },
            },
          },
        },
        bills: {
          where: { status: BillStatus.PAID },
          include: { lineItems: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return vendors.map((v) => {
      const totalPaid = v.bills.reduce(
        (sum, bill) =>
          sum + bill.lineItems.reduce((s, li) => s + li.amount, 0),
        0,
      );
      return {
        id: v.id,
        name: v.name,
        email: v.email,
        phone: v.phone,
        website: v.website,
        defaultPaymentMethod: v.defaultPaymentMethod,
        status: v.status,
        activeBillCount: v._count.bills,
        totalPaid,
        createdAt: v.createdAt,
      };
    });
  }

  /** Lightweight list for vendor pickers — active org vendors only, sorted by name. */
  listForPicker() {
    return this.db.vendor.findMany({
      where: { organizationId: this.ctx.organizationId, status: "ACTIVE" },
      select: { id: true, name: true, defaultPaymentMethod: true },
      orderBy: { name: "asc" },
    });
  }

  async getById(id: string) {
    return this.db.vendor.findFirst({
      where: { id, organizationId: this.ctx.organizationId },
      include: {
        bills: {
          include: {
            lineItems: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  create(data: CreateVendorInput) {
    this.requireManager();
    return this.db.vendor.create({
      data: { ...data, organizationId: this.ctx.organizationId },
    });
  }

  /**
   * Lightweight vendor creation usable by staff while submitting a bill —
   * only requires a name. Managers can fill in bank details later.
   */
  createInline(data: CreateInlineVendorInput) {
    return this.db.vendor.create({
      data: {
        name: data.name,
        email: data.email,
        defaultPaymentMethod: data.defaultPaymentMethod,
        organizationId: this.ctx.organizationId,
      },
    });
  }

  async update(id: string, data: UpdateVendorInput) {
    this.requireManager();
    const vendor = await this.db.vendor.findFirst({
      where: { id, organizationId: this.ctx.organizationId },
      select: { id: true },
    });
    if (!vendor) throw new Error("Vendor not found");
    return this.db.vendor.update({ where: { id }, data });
  }

  async deactivate(id: string) {
    this.requireManager();
    const vendor = await this.db.vendor.findFirst({
      where: { id, organizationId: this.ctx.organizationId },
      select: { id: true },
    });
    if (!vendor) throw new Error("Vendor not found");
    return this.db.vendor.update({
      where: { id },
      data: { status: "INACTIVE" },
    });
  }
}
