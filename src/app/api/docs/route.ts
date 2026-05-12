import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const docs = {
  version: "1.0.0",
  name: "Payables AP",
  description:
    "Accounts payable workflow engine. Moves vendor invoices from receipt through approval to payment. Built with Next.js 15 App Router, Prisma, PostgreSQL, and NextAuth.",
  humanDocs: "/docs",

  stack: {
    framework: "Next.js 15.2 (App Router, React 19)",
    language: "TypeScript 5.8 (strict)",
    database: "PostgreSQL via Prisma 6.6",
    auth: "NextAuth v5-beta, Google OAuth, PrismaAdapter",
    styling: "Tailwind CSS 4.0 (PostCSS)",
    validation: "Zod",
    font: "Geist Sans",
  },

  routes: [
    {
      path: "/",
      method: "GET",
      type: "page",
      description: "Dashboard with live AP stats (total payable, overdue, due soon, paid this month) and recent bills list.",
      file: "src/app/page.tsx",
    },
    {
      path: "/bills",
      method: "GET",
      type: "page",
      description: "Bills inbox. Supports filtering by status and text search over invoiceNumber and memo.",
      file: "src/app/bills/page.tsx",
    },
    {
      path: "/bills/new",
      method: "GET",
      type: "page",
      description: "Create a new bill. Renders a form with vendor selector, date pickers, payment method, and line items editor.",
      file: "src/app/bills/new/page.tsx",
    },
    {
      path: "/bills/[id]",
      method: "GET",
      type: "page",
      description: "Bill detail view. Shows vendor, line items, payments, and available state-machine actions based on current status.",
      file: "src/app/bills/[id]/page.tsx",
    },
    {
      path: "/vendors",
      method: "GET",
      type: "page",
      description: "Vendor directory with name/email search and bill count aggregates.",
      file: "src/app/vendors/page.tsx",
    },
    {
      path: "/vendors/new",
      method: "GET",
      type: "page",
      description: "Create a new vendor with contact info, address, and bank details.",
      file: "src/app/vendors/new/page.tsx",
    },
    {
      path: "/vendors/[id]",
      method: "GET",
      type: "page",
      description: "Vendor detail with contact info and associated bill history.",
      file: "src/app/vendors/[id]/page.tsx",
    },
    {
      path: "/vendors/[id]/edit",
      method: "GET",
      type: "page",
      description: "Edit vendor details.",
      file: "src/app/vendors/[id]/edit/page.tsx",
    },
    {
      path: "/docs",
      method: "GET",
      type: "page",
      description: "Human-readable technical documentation for the Payables AP platform.",
      file: "src/app/docs/page.tsx",
    },
    {
      path: "/api/docs",
      method: "GET",
      type: "api",
      description: "This endpoint. Machine-readable JSON documentation for AI agents and automated tooling.",
      file: "src/app/api/docs/route.ts",
    },
    {
      path: "/api/auth/[...nextauth]",
      method: "GET|POST",
      type: "api",
      description: "NextAuth handler. Provides /api/auth/signin, /api/auth/callback/google, /api/auth/signout, /api/auth/session.",
      file: "src/app/api/auth/[...nextauth]/route.ts",
    },
  ],

  dataModels: [
    {
      name: "Bill",
      description: "Central entity representing a vendor invoice. Owns the AP state machine.",
      file: "prisma/schema.prisma",
      fields: [
        { name: "id", type: "String (cuid)", required: true, description: "Primary key" },
        { name: "vendorId", type: "String", required: true, description: "FK → Vendor" },
        { name: "invoiceNumber", type: "String", required: false, description: "Vendor's invoice reference number" },
        { name: "invoiceDate", type: "DateTime", required: false, description: "" },
        { name: "dueDate", type: "DateTime", required: false, description: "Used for overdue / due-soon calculations" },
        { name: "status", type: "BillStatus", required: true, description: "DRAFT | PENDING_APPROVAL | APPROVED | SCHEDULED | PAID | REJECTED | VOID" },
        { name: "memo", type: "String", required: false, description: "" },
        { name: "paymentMethod", type: "PaymentMethod", required: false, description: "ACH | CHECK | WIRE" },
        { name: "rejectionReason", type: "String", required: false, description: "Populated on REJECTED transition" },
        { name: "submittedAt", type: "DateTime", required: false, description: "Set when status → PENDING_APPROVAL" },
        { name: "approvedAt", type: "DateTime", required: false, description: "Set when status → APPROVED" },
        { name: "paidAt", type: "DateTime", required: false, description: "Set when status → PAID" },
        { name: "createdAt", type: "DateTime", required: true, description: "Auto-set on insert" },
        { name: "updatedAt", type: "DateTime", required: true, description: "Auto-updated" },
      ],
      relations: [
        { field: "vendor", model: "Vendor", type: "many-to-one" },
        { field: "lineItems", model: "BillLineItem", type: "one-to-many" },
        { field: "payments", model: "Payment", type: "one-to-many" },
      ],
    },
    {
      name: "BillLineItem",
      description: "A single line on a bill. Maps expense to a GL account.",
      file: "prisma/schema.prisma",
      fields: [
        { name: "id", type: "String (cuid)", required: true, description: "" },
        { name: "billId", type: "String", required: true, description: "FK → Bill (cascade delete)" },
        { name: "description", type: "String", required: true, description: "" },
        { name: "quantity", type: "Decimal", required: true, description: "" },
        { name: "unitPrice", type: "Decimal", required: true, description: "" },
        { name: "amount", type: "Decimal", required: true, description: "quantity × unitPrice" },
        { name: "glAccountId", type: "String", required: false, description: "FK → GLAccount" },
      ],
    },
    {
      name: "Vendor",
      description: "Supplier / payee. Holds contact, address, and bank details.",
      file: "prisma/schema.prisma",
      fields: [
        { name: "id", type: "String (cuid)", required: true, description: "" },
        { name: "name", type: "String", required: true, description: "Indexed" },
        { name: "email", type: "String", required: false, description: "" },
        { name: "phone", type: "String", required: false, description: "" },
        { name: "website", type: "String", required: false, description: "" },
        { name: "addressLine1 / addressLine2 / city / state / zip / country", type: "String", required: false, description: "" },
        { name: "bankName / bankRoutingNumber / bankAccountNumber", type: "String", required: false, description: "" },
        { name: "taxId", type: "String", required: false, description: "" },
        { name: "defaultPaymentMethod", type: "PaymentMethod", required: false, description: "ACH | CHECK | WIRE" },
        { name: "status", type: "VendorStatus", required: true, description: "ACTIVE | INACTIVE" },
      ],
    },
    {
      name: "GLAccount",
      description: "Chart of accounts entry. Line items are coded to GL accounts.",
      file: "prisma/schema.prisma",
      fields: [
        { name: "id", type: "String (cuid)", required: true, description: "" },
        { name: "code", type: "String", required: true, description: "Unique account code" },
        { name: "name", type: "String", required: true, description: "" },
        { name: "type", type: "GLAccountType", required: true, description: "EXPENSE | LIABILITY | ASSET" },
      ],
    },
    {
      name: "Payment",
      description: "Payment record created when a bill is scheduled. Updated when paid.",
      file: "prisma/schema.prisma",
      fields: [
        { name: "id", type: "String (cuid)", required: true, description: "" },
        { name: "billId", type: "String", required: true, description: "FK → Bill" },
        { name: "amount", type: "Decimal", required: true, description: "" },
        { name: "method", type: "PaymentMethod", required: true, description: "ACH | CHECK | WIRE" },
        { name: "status", type: "PaymentStatus", required: true, description: "PENDING | PROCESSING | COMPLETED | FAILED" },
        { name: "reference", type: "String", required: false, description: "Check number, ACH trace, etc." },
        { name: "scheduledDate", type: "DateTime", required: false, description: "" },
        { name: "processedDate", type: "DateTime", required: false, description: "" },
        { name: "memo", type: "String", required: false, description: "" },
      ],
    },
  ],

  enums: {
    BillStatus: ["DRAFT", "PENDING_APPROVAL", "APPROVED", "SCHEDULED", "PAID", "REJECTED", "VOID"],
    PaymentStatus: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
    PaymentMethod: ["ACH", "CHECK", "WIRE"],
    VendorStatus: ["ACTIVE", "INACTIVE"],
    GLAccountType: ["EXPENSE", "LIABILITY", "ASSET"],
  },

  billLifecycle: {
    description: "Bills follow a strict state machine. Every transition is validated in BillService before the database write.",
    states: [
      { name: "DRAFT", description: "Bill is being composed. Can be edited." },
      { name: "PENDING_APPROVAL", description: "Submitted for review. Read-only." },
      { name: "APPROVED", description: "Approved, ready to schedule payment." },
      { name: "SCHEDULED", description: "Payment scheduled. Payment record exists." },
      { name: "PAID", description: "Payment completed. Terminal state." },
      { name: "REJECTED", description: "Rejected during approval. Can be resubmitted." },
      { name: "VOID", description: "Cancelled. Terminal state." },
    ],
    transitions: [
      { from: "DRAFT", to: "PENDING_APPROVAL", action: "submitBill()" },
      { from: "PENDING_APPROVAL", to: "APPROVED", action: "approveBill()" },
      { from: "PENDING_APPROVAL", to: "REJECTED", action: "rejectBill(id, reason)" },
      { from: "REJECTED", to: "PENDING_APPROVAL", action: "submitBill()" },
      { from: "APPROVED", to: "SCHEDULED", action: "schedulePayment()" },
      { from: "SCHEDULED", to: "PAID", action: "markPaid()" },
      { from: "DRAFT|PENDING_APPROVAL|APPROVED|SCHEDULED|REJECTED", to: "VOID", action: "voidBill()" },
    ],
  },

  serverActions: [
    {
      name: "Bills",
      file: "src/actions/bills.ts",
      actions: [
        {
          name: "createBill",
          input: "FormData: vendorId, invoiceNumber?, invoiceDate?, dueDate?, memo?, paymentMethod?, lineItems[]",
          returns: "ActionResult<{ id: string }>",
          description: "Creates a bill in DRAFT status with nested line items.",
        },
        {
          name: "submitBill",
          input: "FormData: id",
          returns: "ActionResult",
          description: "Transitions DRAFT → PENDING_APPROVAL. Sets submittedAt.",
        },
        {
          name: "approveBill",
          input: "FormData: id",
          returns: "ActionResult",
          description: "Transitions PENDING_APPROVAL → APPROVED. Sets approvedAt.",
        },
        {
          name: "rejectBill",
          input: "FormData: id, reason",
          returns: "ActionResult",
          description: "Transitions PENDING_APPROVAL → REJECTED. Sets rejectionReason.",
        },
        {
          name: "schedulePayment",
          input: "FormData: id, scheduledDate, method, reference?",
          returns: "ActionResult",
          description: "Transitions APPROVED → SCHEDULED. Creates Payment record with PENDING status.",
        },
        {
          name: "markPaid",
          input: "FormData: id",
          returns: "ActionResult",
          description: "Transitions SCHEDULED → PAID. Updates Payment to COMPLETED. Sets paidAt.",
        },
        {
          name: "voidBill",
          input: "FormData: id",
          returns: "ActionResult",
          description: "Voids a bill from any non-PAID status.",
        },
      ],
    },
    {
      name: "Vendors",
      file: "src/actions/vendors.ts",
      actions: [
        {
          name: "createVendor",
          input: "FormData: name, email?, phone?, website?, address fields, bank fields, taxId?, defaultPaymentMethod?",
          returns: "ActionResult<{ id: string }>",
          description: "Creates a vendor with ACTIVE status.",
        },
        {
          name: "updateVendor",
          input: "FormData: id, …partial vendor fields",
          returns: "ActionResult",
          description: "Partial update of any vendor fields.",
        },
        {
          name: "deactivateVendor",
          input: "FormData: id",
          returns: "ActionResult",
          description: "Sets vendor status to INACTIVE.",
        },
      ],
    },
  ],

  services: [
    {
      name: "BillService",
      file: "src/server/services/BillService.ts",
      singleton: "src/server/container.ts → billService",
      methods: [
        { name: "list(filters?)", description: "Filter by status[], search string over invoiceNumber/memo, sort by createdAt desc" },
        { name: "getById(id)", description: "Full bill with vendor, lineItems.glAccount, payments" },
        { name: "create(data)", description: "Creates bill in DRAFT with nested line items in a transaction" },
        { name: "update(id, data)", description: "Only allowed when status === DRAFT" },
        { name: "submit(id)", description: "State transition with pre-condition check" },
        { name: "approve(id)", description: "State transition with pre-condition check" },
        { name: "reject(id, reason)", description: "State transition with pre-condition check" },
        { name: "schedulePayment(id, data)", description: "Creates Payment, transitions to SCHEDULED" },
        { name: "markPaid(id)", description: "Updates Payment to COMPLETED, transitions to PAID" },
        { name: "void(id)", description: "Allowed from any non-terminal status" },
        { name: "getDashboardStats()", description: "Returns totalPayable, overdueCount, overdueAmount, dueSoonCount, dueSoonAmount, paidThisMonth" },
        { name: "getRecentBills(limit)", description: "Most recent N bills ordered by createdAt desc" },
      ],
    },
    {
      name: "VendorService",
      file: "src/server/services/VendorService.ts",
      singleton: "src/server/container.ts → vendorService",
      methods: [
        { name: "list(filters?)", description: "Search by name/email; includes _count.bills and totalPaid sum" },
        { name: "getById(id)", description: "Vendor with bills included" },
        { name: "create(data)", description: "" },
        { name: "update(id, data)", description: "Partial updates" },
        { name: "deactivate(id)", description: "Sets status → INACTIVE" },
      ],
    },
    {
      name: "GLAccountService",
      file: "src/server/services/GLAccountService.ts",
      singleton: "src/server/container.ts → glAccountService",
      methods: [
        { name: "list()", description: "All GL accounts ordered by type then code" },
      ],
    },
  ],

  environment: [
    { name: "DATABASE_URL", required: true, purpose: "PostgreSQL connection string (pooled, for Prisma queries)" },
    { name: "DIRECT_URL", required: true, purpose: "Direct PostgreSQL URL (for Prisma migrations)" },
    { name: "AUTH_SECRET", required: "production only", purpose: "NextAuth secret for JWT signing" },
    { name: "AUTH_GOOGLE_ID", required: true, purpose: "Google OAuth client ID" },
    { name: "AUTH_GOOGLE_SECRET", required: true, purpose: "Google OAuth client secret" },
    { name: "NODE_ENV", required: true, purpose: "development | test | production" },
  ],

  architecture: {
    patterns: [
      { name: "Server Components", description: "Pages are async RSCs that call services directly — no API round-trips for reads" },
      { name: "Server Actions", description: "All mutations in src/actions/. Return ActionResult<T> discriminated union" },
      { name: "Dependency Injection", description: "Services receive db via constructor. Singletons wired in container.ts" },
      { name: "Cache invalidation", description: "revalidatePath() called after every mutation" },
      { name: "State machine", description: "Bill status transitions validated in BillService before every write" },
      { name: "Validation", description: "Zod schemas at action entry points only" },
      { name: "Class composition", description: "cn() = clsx + tailwind-merge for safe Tailwind class merging" },
    ],
    dataFlow: {
      reads: "Page (RSC) → service singleton → Prisma → PostgreSQL",
      mutations: "Client component → Server Action → Zod validation → service method → Prisma → revalidatePath()",
    },
  },
};

export function GET(_req: NextRequest) {
  return NextResponse.json(docs, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
    },
  });
}
