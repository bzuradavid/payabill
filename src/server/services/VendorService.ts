import {
  type PrismaClient,
  type VendorStatus,
  type PaymentMethod,
  BillStatus,
} from "../../../generated/prisma";

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
  constructor(private db: PrismaClient) {}

  async list(filters: VendorListFilters = {}) {
    const vendors = await this.db.vendor.findMany({
      where: {
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

  async getById(id: string) {
    return this.db.vendor.findUnique({
      where: { id },
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
    return this.db.vendor.create({ data });
  }

  update(id: string, data: UpdateVendorInput) {
    return this.db.vendor.update({ where: { id }, data });
  }

  deactivate(id: string) {
    return this.db.vendor.update({
      where: { id },
      data: { status: "INACTIVE" },
    });
  }
}
