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

export class VendorService {
  constructor(
    private db: PrismaClient,
    private ctx: UserContext,
  ) {}

  private scope() {
    return {
      userId: this.ctx.userId,
      ...(this.ctx.showSeed ? {} : { seed: false }),
    };
  }

  async list(filters: VendorListFilters = {}) {
    const vendors = await this.db.vendor.findMany({
      where: {
        ...this.scope(),
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
                ...(this.ctx.showSeed ? {} : { seed: false }),
                status: {
                  notIn: [BillStatus.VOID, BillStatus.REJECTED],
                },
              },
            },
          },
        },
        bills: {
          where: {
            ...(this.ctx.showSeed ? {} : { seed: false }),
            status: BillStatus.PAID,
          },
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

  async getById(id: string) {
    return this.db.vendor.findFirst({
      where: { id, userId: this.ctx.userId },
      include: {
        bills: {
          where: this.ctx.showSeed ? undefined : { seed: false },
          include: {
            lineItems: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  create(data: CreateVendorInput) {
    return this.db.vendor.create({
      data: { ...data, userId: this.ctx.userId },
    });
  }

  async update(id: string, data: UpdateVendorInput) {
    const vendor = await this.db.vendor.findFirst({
      where: { id, userId: this.ctx.userId },
      select: { id: true },
    });
    if (!vendor) throw new Error("Vendor not found");
    return this.db.vendor.update({ where: { id }, data });
  }

  async deactivate(id: string) {
    const vendor = await this.db.vendor.findFirst({
      where: { id, userId: this.ctx.userId },
      select: { id: true },
    });
    if (!vendor) throw new Error("Vendor not found");
    return this.db.vendor.update({
      where: { id },
      data: { status: "INACTIVE" },
    });
  }
}
