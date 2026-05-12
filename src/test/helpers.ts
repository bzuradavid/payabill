import { vi } from "vitest";
import type { PrismaClient } from "../../generated/prisma";
import {
  BillStatus,
  PaymentStatus,
  type UserRole,
} from "../../generated/prisma";

// ── UserContext ────────────────────────────────────────────────────────────────

export interface TestUserContext {
  userId: string;
  organizationId: string;
  role: UserRole;
}

export const managerCtx: TestUserContext = {
  userId: "user-manager",
  organizationId: "org-1",
  role: "MANAGER",
};

export const staffCtx: TestUserContext = {
  userId: "user-staff",
  organizationId: "org-1",
  role: "STAFF",
};

// ── Mock DB factory ────────────────────────────────────────────────────────────

export type MockDb = ReturnType<typeof makeMockDb>;

export function makeMockDb() {
  const db = {
    bill: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    billLineItem: {
      deleteMany: vi.fn(),
    },
    vendor: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    gLAccount: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    payment: {
      create: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    invitation: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    organization: {
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(),
  };

  // Handle both callback and batch forms of $transaction
  db.$transaction.mockImplementation(
    (arg: ((tx: typeof db) => Promise<unknown>) | Promise<unknown>[]) => {
      if (typeof arg === "function") return arg(db);
      if (Array.isArray(arg)) return Promise.all(arg);
    },
  );

  return db as unknown as typeof db & PrismaClient;
}

// ── Test data builders ─────────────────────────────────────────────────────────

export function makeLineItem(overrides: Partial<ReturnType<typeof makeLineItem>> = {}) {
  return {
    id: "li-1",
    billId: "bill-1",
    description: "Widget",
    quantity: 1,
    unitPrice: 100,
    amount: 100,
    glAccountId: null,
    createdAt: new Date("2025-01-01"),
    ...overrides,
  };
}

export function makePayment(overrides: Partial<ReturnType<typeof makePayment>> = {}) {
  return {
    id: "pay-1",
    billId: "bill-1",
    amount: 100,
    method: "ACH" as const,
    status: PaymentStatus.PENDING,
    reference: null,
    scheduledDate: null,
    processedDate: null,
    memo: null,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    ...overrides,
  };
}

export function makeVendor(overrides: Partial<ReturnType<typeof makeVendor>> = {}) {
  return {
    id: "vendor-1",
    organizationId: "org-1",
    name: "ACME Corp",
    email: "billing@acme.com",
    phone: null,
    website: null,
    addressLine1: null,
    addressLine2: null,
    city: null,
    state: null,
    zip: null,
    country: "US",
    defaultPaymentMethod: "ACH" as const,
    bankName: null,
    bankRoutingNumber: null,
    bankAccountNumber: null,
    taxId: null,
    status: "ACTIVE" as const,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    ...overrides,
  };
}

export function makeBill(overrides: Partial<ReturnType<typeof makeBill>> = {}) {
  return {
    id: "bill-1",
    organizationId: "org-1",
    createdById: "user-manager",
    vendorId: "vendor-1",
    invoiceNumber: "INV-001",
    invoiceDate: new Date("2025-01-01"),
    dueDate: new Date("2025-02-01"),
    status: BillStatus.DRAFT,
    memo: null,
    paymentMethod: "ACH" as const,
    rejectionReason: null,
    submittedAt: null,
    approvedAt: null,
    paidAt: null,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    vendor: makeVendor(),
    lineItems: [makeLineItem()],
    payments: [],
    ...overrides,
  };
}
