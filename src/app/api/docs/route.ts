import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const docs = {
  version: "1.1.0",
  name: "Payables AP",
  description:
    "Accounts payable workflow engine. Moves vendor invoices from receipt through approval to payment. Built with Next.js 15 App Router, Prisma, PostgreSQL, and NextAuth. Multi-tenant: every authenticated user gets their own private workspace, pre-seeded with demo data they can hide via a dashboard toggle.",
  humanDocs: "/docs",

  stack: {
    framework: "Next.js 15.2 (App Router, React 19)",
    language: "TypeScript 5.8 (strict)",
    database: "PostgreSQL via Prisma 6.6",
    auth: "NextAuth v5-beta, Google OAuth, PrismaAdapter (database sessions)",
    styling: "Tailwind CSS 4.0 (PostCSS)",
    validation: "Zod",
    font: "Geist Sans",
  },

  auth: {
    description:
      "Authentication is required for every /dashboard, /bills, /vendors, and /docs route. The (app) route group's layout calls auth() and redirects unauthenticated users to /login. The (marketing) route group (landing + login) is public.",
    provider: "Google OAuth (single button handles both sign-in and sign-up).",
    sessionStrategy: "database (via PrismaAdapter; required for events.createUser to fire)",
    onSignUp:
      "NextAuth events.createUser → seedUserData(db, user.id) populates a personal copy of the demo dataset, all rows marked seed:true.",
    onSignIn: "Redirect to /dashboard.",
    onSignOut: "Redirect to / (landing).",
    routeGroups: [
      {
        name: "(marketing)",
        layout: "src/app/(marketing)/layout.tsx",
        protected: false,
        routes: ["/", "/login"],
      },
      {
        name: "(app)",
        layout: "src/app/(app)/layout.tsx",
        protected: true,
        protection:
          "Calls auth(); if no session, redirects to /login. Renders AppShell with the authenticated user.",
        routes: ["/dashboard", "/bills/*", "/vendors/*", "/docs"],
      },
    ],
  },

  userScoping: {
    description:
      "Every domain row belongs to exactly one User. Services filter all queries by userId, so users only see their own data.",
    scopedModels: ["Vendor", "Bill", "GLAccount"],
    inheritedScoping: [
      "BillLineItem (via Bill.userId)",
      "Payment (via Bill.userId)",
    ],
    enforcement:
      "All Prisma queries from services include `where: { userId: ctx.userId }`. The UserContext is resolved once per request via requireUserContext() in src/server/get-user.ts.",
  },

  seedData: {
    description:
      "New workspaces start empty. Users can opt into a realistic demo dataset (6 vendors, 8 GL accounts, ~20 bills across all statuses) by flipping the Show-demo-data switch on the dashboard. Demo rows are marked seed:true.",
    seededOn:
      "First time setShowSeed(true) is called for a user (gated by User.seededAt being null) — never on first sign-in",
    seedRoutine: "src/server/seed-user.ts → seedUserData(db, userId)",
    seededModels: ["Vendor", "Bill", "BillLineItem", "Payment", "GLAccount"],
    toggle: {
      ui: "src/components/dashboard/ShowSeedToggle.tsx",
      preferenceField: "User.showSeed (Boolean, default false)",
      seedGuard: "User.seededAt (DateTime?) — null means demo data has never been seeded for this user",
      action: "setShowSeed(showSeed) in src/actions/preferences.ts",
      effect:
        "When showSeed = false (default), every service appends `seed: false` to its where-clause, hiding demo rows from lists, detail pages, and aggregates.",
    },
  },

  routes: [
    {
      path: "/",
      method: "GET",
      type: "page",
      group: "(marketing)",
      auth: "public",
      description:
        "Marketing landing page. Redirects to /dashboard if user is already signed in.",
      file: "src/app/(marketing)/page.tsx",
    },
    {
      path: "/login",
      method: "GET",
      type: "page",
      group: "(marketing)",
      auth: "public",
      description:
        "Sign-in / sign-up page. Single 'Continue with Google' button handles both. Redirects to /dashboard if already signed in.",
      file: "src/app/(marketing)/login/page.tsx",
    },
    {
      path: "/dashboard",
      method: "GET",
      type: "page",
      group: "(app)",
      auth: "required",
      description:
        "Dashboard with live AP stats (total payable, overdue, due soon, paid this month), recent bills, and the 'Show demo data' toggle.",
      file: "src/app/(app)/dashboard/page.tsx",
    },
    {
      path: "/bills",
      method: "GET",
      type: "page",
      group: "(app)",
      auth: "required",
      description:
        "Bills inbox. Filter by status, search by vendor name or invoice number. User-scoped.",
      file: "src/app/(app)/bills/page.tsx",
    },
    {
      path: "/bills/new",
      method: "GET",
      type: "page",
      group: "(app)",
      auth: "required",
      description:
        "Create a new bill. Vendor selector, date pickers, payment method, line items editor.",
      file: "src/app/(app)/bills/new/page.tsx",
    },
    {
      path: "/bills/[id]",
      method: "GET",
      type: "page",
      group: "(app)",
      auth: "required",
      description:
        "Bill detail view with vendor, line items, payments, and state-machine actions for the current status.",
      file: "src/app/(app)/bills/[id]/page.tsx",
    },
    {
      path: "/vendors",
      method: "GET",
      type: "page",
      group: "(app)",
      auth: "required",
      description: "Vendor directory with bill-count aggregates. User-scoped.",
      file: "src/app/(app)/vendors/page.tsx",
    },
    {
      path: "/vendors/new",
      method: "GET",
      type: "page",
      group: "(app)",
      auth: "required",
      description: "Create a new vendor with contact info, address, and bank details.",
      file: "src/app/(app)/vendors/new/page.tsx",
    },
    {
      path: "/vendors/[id]",
      method: "GET",
      type: "page",
      group: "(app)",
      auth: "required",
      description: "Vendor detail with contact info and associated bill history.",
      file: "src/app/(app)/vendors/[id]/page.tsx",
    },
    {
      path: "/vendors/[id]/edit",
      method: "GET",
      type: "page",
      group: "(app)",
      auth: "required",
      description: "Edit vendor details.",
      file: "src/app/(app)/vendors/[id]/edit/page.tsx",
    },
    {
      path: "/docs",
      method: "GET",
      type: "page",
      group: "(app)",
      auth: "required",
      description: "Human-readable technical documentation.",
      file: "src/app/(app)/docs/page.tsx",
    },
    {
      path: "/api/docs",
      method: "GET",
      type: "api",
      group: "—",
      auth: "public",
      description:
        "This endpoint. Machine-readable JSON documentation for AI agents and automated tooling.",
      file: "src/app/api/docs/route.ts",
    },
    {
      path: "/api/auth/[...nextauth]",
      method: "GET|POST",
      type: "api",
      group: "—",
      auth: "public",
      description:
        "NextAuth handler. Provides /api/auth/signin, /api/auth/callback/google, /api/auth/signout, /api/auth/session.",
      file: "src/app/api/auth/[...nextauth]/route.ts",
    },
  ],

  dataModels: [
    {
      name: "User",
      description:
        "Workspace owner. PrismaAdapter creates one row per Google account on first sign-in. New workspaces start empty; seedUserData() runs only when the user first enables 'Show demo data'.",
      file: "prisma/schema.prisma",
      fields: [
        { name: "id", type: "String (cuid)", required: true, description: "Primary key" },
        { name: "name", type: "String", required: false, description: "From Google profile" },
        { name: "email", type: "String", required: false, description: "Unique" },
        { name: "image", type: "String", required: false, description: "Avatar URL from Google" },
        { name: "showSeed", type: "Boolean", required: true, description: "Default false. When false, services filter out seed:true rows" },
        { name: "seededAt", type: "DateTime", required: false, description: "Stamped on first showSeed=true; null means demo dataset has never been seeded" },
      ],
      relations: [
        { field: "vendors", model: "Vendor", type: "one-to-many", onDelete: "cascade" },
        { field: "bills", model: "Bill", type: "one-to-many", onDelete: "cascade" },
        { field: "glAccounts", model: "GLAccount", type: "one-to-many", onDelete: "cascade" },
        { field: "accounts", model: "Account", type: "one-to-many" },
        { field: "sessions", model: "Session", type: "one-to-many" },
      ],
    },
    {
      name: "Bill",
      description:
        "Central entity representing a vendor invoice. Owns the AP state machine. User-scoped.",
      file: "prisma/schema.prisma",
      fields: [
        { name: "id", type: "String (cuid)", required: true, description: "Primary key" },
        { name: "userId", type: "String", required: true, description: "FK → User (cascade delete)" },
        { name: "seed", type: "Boolean", required: true, description: "Default false. True on demo rows" },
        { name: "vendorId", type: "String", required: true, description: "FK → Vendor" },
        { name: "invoiceNumber", type: "String", required: false, description: "Vendor's invoice reference" },
        { name: "invoiceDate", type: "DateTime", required: false, description: "" },
        { name: "dueDate", type: "DateTime", required: false, description: "Used for overdue / due-soon" },
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
        { field: "user", model: "User", type: "many-to-one", onDelete: "cascade" },
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
        { name: "seed", type: "Boolean", required: true, description: "Inherits from parent bill at seed time" },
        { name: "description", type: "String", required: true, description: "" },
        { name: "quantity", type: "Decimal", required: true, description: "" },
        { name: "unitPrice", type: "Decimal", required: true, description: "" },
        { name: "amount", type: "Decimal", required: true, description: "quantity × unitPrice" },
        { name: "glAccountId", type: "String", required: false, description: "FK → GLAccount" },
      ],
    },
    {
      name: "Vendor",
      description: "Supplier / payee. User-scoped.",
      file: "prisma/schema.prisma",
      fields: [
        { name: "id", type: "String (cuid)", required: true, description: "" },
        { name: "userId", type: "String", required: true, description: "FK → User (cascade delete)" },
        { name: "seed", type: "Boolean", required: true, description: "Default false. True on demo rows" },
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
      description: "Chart-of-accounts entry. User-scoped: each user has their own chart, with codes unique per user.",
      file: "prisma/schema.prisma",
      fields: [
        { name: "id", type: "String (cuid)", required: true, description: "" },
        { name: "userId", type: "String", required: true, description: "FK → User (cascade delete)" },
        { name: "seed", type: "Boolean", required: true, description: "Default false" },
        { name: "code", type: "String", required: true, description: "Unique per user (@@unique([userId, code]))" },
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
        { name: "seed", type: "Boolean", required: true, description: "Inherits from parent bill at seed time" },
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
    description:
      "Bills follow a strict state machine. Every transition is validated in BillService before the database write.",
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
        { name: "createBill", input: "vendorId, invoiceNumber?, invoiceDate, dueDate, memo?, paymentMethod?, lineItems[]", returns: "ActionResult<{ id: string }>", description: "Creates a bill in DRAFT status for the current user. Verifies that vendorId belongs to the user." },
        { name: "submitBill", input: "id", returns: "ActionResult", description: "Transitions DRAFT → PENDING_APPROVAL." },
        { name: "approveBill", input: "id", returns: "ActionResult", description: "Transitions PENDING_APPROVAL → APPROVED." },
        { name: "rejectBill", input: "id, reason", returns: "ActionResult", description: "Transitions PENDING_APPROVAL → REJECTED." },
        { name: "schedulePayment", input: "id, scheduledDate", returns: "ActionResult", description: "Transitions APPROVED → SCHEDULED. Creates Payment record." },
        { name: "markPaid", input: "id", returns: "ActionResult", description: "Transitions SCHEDULED → PAID. Updates Payment → COMPLETED." },
        { name: "voidBill", input: "id", returns: "ActionResult", description: "Voids a bill from any non-PAID status." },
      ],
    },
    {
      name: "Vendors",
      file: "src/actions/vendors.ts",
      actions: [
        { name: "createVendor", input: "name, email?, phone?, address fields, bank fields, taxId?, defaultPaymentMethod?", returns: "ActionResult<{ id: string }>", description: "Creates a vendor scoped to the current user." },
        { name: "updateVendor", input: "id, …partial vendor fields", returns: "ActionResult", description: "Partial update; rejects vendors that belong to another user." },
        { name: "deactivateVendor", input: "id", returns: "ActionResult", description: "Sets vendor status to INACTIVE." },
      ],
    },
    {
      name: "Auth",
      file: "src/actions/auth.ts",
      actions: [
        { name: "signInWithGoogle", input: "—", returns: "redirect", description: "Calls NextAuth signIn('google'); redirects to /dashboard on success." },
        { name: "signOutAction", input: "—", returns: "redirect", description: "Calls NextAuth signOut(); redirects to /." },
      ],
    },
    {
      name: "Preferences",
      file: "src/actions/preferences.ts",
      actions: [
        { name: "setShowSeed", input: "showSeed: boolean", returns: "ActionResult<{ showSeed }>", description: "Updates User.showSeed. On the first showSeed=true call (User.seededAt is null), seeds the demo dataset and stamps seededAt. Revalidates /dashboard, /bills, /vendors." },
      ],
    },
  ],

  services: [
    {
      name: "BillService",
      file: "src/server/services/BillService.ts",
      factory: "src/server/container.ts → getServices()",
      scoping: "Constructor takes (db, ctx: { userId, showSeed }). Every query filters by userId; adds seed:false unless showSeed is true.",
      methods: [
        { name: "list(filters?)", description: "User-scoped. Filter by status[], search over vendor name/invoiceNumber, sort." },
        { name: "getById(id)", description: "User-scoped. Returns null if the bill belongs to another user." },
        { name: "create(data)", description: "Validates vendor belongs to user. Creates bill in DRAFT with nested line items." },
        { name: "update(id, data)", description: "User-scoped. Only allowed when status === DRAFT." },
        { name: "submit / approve / reject / schedulePayment / markPaid / void", description: "State transitions with pre-condition checks. All user-scoped." },
        { name: "getDashboardStats()", description: "Aggregates for the current user only (and excludes seed rows unless showSeed=true)." },
        { name: "getRecentBills(limit)", description: "Most recent N bills owned by the current user." },
      ],
    },
    {
      name: "VendorService",
      file: "src/server/services/VendorService.ts",
      factory: "src/server/container.ts → getServices()",
      scoping: "Constructor takes (db, ctx). Filters by userId; honors showSeed on the vendor itself and on aggregated bills.",
      methods: [
        { name: "list(filters?)", description: "User-scoped. Search by name/email; includes _count.bills and totalPaid." },
        { name: "getById(id)", description: "User-scoped. Returns null if vendor belongs to another user." },
        { name: "create(data)", description: "Creates a vendor owned by the current user." },
        { name: "update(id, data)", description: "Partial updates; rejects vendors owned by another user." },
        { name: "deactivate(id)", description: "Sets status → INACTIVE; user-scoped." },
      ],
    },
    {
      name: "GLAccountService",
      file: "src/server/services/GLAccountService.ts",
      factory: "src/server/container.ts → getServices()",
      scoping: "Constructor takes (db, ctx). Returns only the current user's chart of accounts.",
      methods: [{ name: "list()", description: "All GL accounts for the current user, ordered by type then code." }],
    },
  ],

  environment: [
    { name: "DATABASE_URL", required: true, purpose: "PostgreSQL connection string (pooled, for Prisma queries)" },
    { name: "DIRECT_URL", required: true, purpose: "Direct PostgreSQL URL (for Prisma migrations)" },
    { name: "AUTH_SECRET", required: "production only", purpose: "NextAuth secret for JWT/session signing" },
    { name: "AUTH_GOOGLE_ID", required: true, purpose: "Google OAuth client ID (required: auth is mandatory)" },
    { name: "AUTH_GOOGLE_SECRET", required: true, purpose: "Google OAuth client secret" },
    { name: "NODE_ENV", required: true, purpose: "development | test | production" },
  ],

  architecture: {
    patterns: [
      { name: "Route groups", description: "(marketing) for public surfaces, (app) for authenticated workspace" },
      { name: "Auth gate", description: "(app)/layout.tsx calls auth() and redirects unauthenticated users to /login" },
      { name: "Server Components", description: "Pages are async RSCs that call services directly — no API round-trips for reads" },
      { name: "Server Actions", description: "All mutations in src/actions/. Return ActionResult<T> discriminated union" },
      { name: "Per-request DI", description: "getServices() builds user-scoped service instances each request" },
      { name: "User scoping", description: "Every Vendor/Bill/GLAccount query filters by userId" },
      { name: "Seed flag", description: "Domain models carry seed:Boolean. Services append seed:false unless User.showSeed is true" },
      { name: "Cache invalidation", description: "revalidatePath() called after every mutation" },
      { name: "State machine", description: "Bill status transitions validated in BillService before every write" },
      { name: "Validation", description: "Zod schemas at action entry points only" },
      { name: "Class composition", description: "cn() = clsx + tailwind-merge for safe Tailwind class merging" },
    ],
    dataFlow: {
      reads: "Page (RSC) → getServices() → user-scoped service → Prisma (where: { userId }) → PostgreSQL",
      mutations: "Client component → Server Action → Zod validation → getServices() → service method → Prisma → revalidatePath()",
      auth: "/login → Google OAuth → /api/auth/callback/google → PrismaAdapter creates User → events.createUser → seedUserData() → /dashboard",
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
