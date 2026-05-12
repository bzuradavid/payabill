import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const docs = {
  version: "1.2.0",
  name: "Payabill AP",
  description:
    "Accounts payable workflow engine. Moves vendor invoices from receipt through approval to payment. Built with Next.js 15 App Router, Prisma, PostgreSQL, and NextAuth v5. Multi-tenant: each Organization is a workspace with MANAGER and STAFF roles.",
  humanDocs: "/docs",

  stack: {
    framework: "Next.js 15.2 (App Router, React 19)",
    language: "TypeScript 5.8 (strict)",
    database: "PostgreSQL via Prisma 6.6",
    auth: "NextAuth v5-beta · Google OAuth · Credentials · PrismaAdapter (JWT sessions)",
    styling: "Tailwind CSS 4.0 (PostCSS)",
    validation: "Zod",
    font: "Geist Sans",
  },

  auth: {
    description:
      "Authentication is required for every (app) route (/dashboard, /bills/*, /vendors/*, /staff). The (app) layout calls auth() and redirects unauthenticated users to /login. The (marketing) route group (landing, login, docs) is public.",
    providers: [
      "Google OAuth — handles both sign-in and sign-up",
      "Credentials — email/password for seeded demo accounts",
    ],
    sessionStrategy: "JWT (next-auth v5 default)",
    onSignUp:
      "NextAuth events.createUser → assignUserToOrganization(): joins org via pending Invitation (becomes STAFF), or creates a new Organization (becomes MANAGER).",
    onSignIn: "Redirect to /dashboard.",
    onSignOut: "Redirect to / (landing).",
    routeGroups: [
      {
        name: "(marketing)",
        layout: "src/app/(marketing)/layout.tsx",
        protected: false,
        routes: ["/", "/login", "/docs"],
      },
      {
        name: "(app)",
        layout: "src/app/(app)/layout.tsx",
        protected: true,
        protection:
          "Calls auth(); if no session, redirects to /login. Renders AppShell.",
        routes: ["/dashboard", "/bills/*", "/vendors/*", "/staff"],
      },
    ],
  },

  roles: {
    description:
      "Every User has a role (MANAGER or STAFF) within their Organization. Roles are set when the user joins an org and enforced in services and route handlers.",
    MANAGER:
      "Can approve/reject bills, schedule payments, access /staff, see all bills in the org.",
    STAFF:
      "Can create and submit bills (including to new vendors), sees only the bills they created.",
    roleGate:
      "requireManagerContext() in src/server/get-user.ts redirects STAFF users to /dashboard.",
  },

  orgModel: {
    description:
      "All domain data (Vendor, Bill, GLAccount) belongs to an Organization. Services filter every query by organizationId. BillService additionally adds a createdById filter for STAFF users.",
    scopedModels: ["Vendor", "Bill", "GLAccount"],
    inheritedScoping: [
      "BillLineItem (via Bill.organizationId)",
      "Payment (via Bill.organizationId)",
    ],
    enforcement:
      "All Prisma queries from services include `where: { organizationId: ctx.organizationId }`. BillService.scope() also adds `createdById: ctx.userId` when role === STAFF.",
  },

  seedData: {
    description:
      "Running `npm run db:seed` creates a 'Payable Demo Co' organization with two pre-seeded accounts and a full realistic dataset.",
    accounts: [
      { email: "manager@payabill.com", password: "pass1234", role: "MANAGER" },
      { email: "staff@payabill.com", password: "pass1234", role: "STAFF" },
    ],
    seededData:
      "6 vendors, 8 GL accounts, ~19 bills spanning all statuses, split between the manager and staff user.",
    routine: "src/server/seed-user.ts → seedOrganization(db, orgId, managerId, staffId)",
    idempotent:
      "Deletes the existing 'Payable Demo Co' org and users before re-creating; safe to run multiple times.",
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
        "Sign-in / sign-up page. Google OAuth + email/password credentials. Redirects to /dashboard if already signed in.",
      file: "src/app/(marketing)/login/page.tsx",
    },
    {
      path: "/dashboard",
      method: "GET",
      type: "page",
      group: "(app)",
      auth: "required",
      description:
        "Role-differentiated dashboard. Managers see org-wide AP stats and all recent bills. Staff see a personal view of their submitted bills.",
      file: "src/app/(app)/dashboard/page.tsx",
    },
    {
      path: "/bills",
      method: "GET",
      type: "page",
      group: "(app)",
      auth: "required",
      description:
        "Bills inbox. Filter by status, search by vendor name or invoice number. Org-scoped; STAFF see only their own bills.",
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
      description: "Vendor directory with bill-count aggregates. Org-scoped.",
      file: "src/app/(app)/vendors/page.tsx",
    },
    {
      path: "/vendors/new",
      method: "GET",
      type: "page",
      group: "(app)",
      auth: "required",
      description:
        "Create a new vendor with contact info, address, and bank details.",
      file: "src/app/(app)/vendors/new/page.tsx",
    },
    {
      path: "/vendors/[id]",
      method: "GET",
      type: "page",
      group: "(app)",
      auth: "required",
      description:
        "Vendor detail with contact info and associated bill history.",
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
      path: "/staff",
      method: "GET",
      type: "page",
      group: "(app)",
      auth: "required — MANAGER only",
      description:
        "Invite staff by email, view current team members, and revoke pending invitations. Redirects STAFF role to /dashboard.",
      file: "src/app/(app)/staff/page.tsx",
    },
    {
      path: "/docs",
      method: "GET",
      type: "page",
      group: "(marketing)",
      auth: "public",
      description: "Human-readable technical documentation.",
      file: "src/app/(marketing)/docs/page.tsx",
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
      name: "Organization",
      description: "Top-level tenant. All domain data is scoped to an org.",
      file: "prisma/schema.prisma",
      fields: [
        { name: "id", type: "String (cuid)", required: true, description: "Primary key" },
        { name: "name", type: "String", required: true, description: "" },
        { name: "users", type: "User[]", required: false, description: "Members" },
        {
          name: "vendors / bills / glAccounts / invitations",
          type: "[]",
          required: false,
          description: "Cascade-delete on org delete",
        },
      ],
    },
    {
      name: "User",
      description:
        "Workspace member. PrismaAdapter creates one row per account on first sign-in. assignUserToOrganization() attaches to an org.",
      file: "prisma/schema.prisma",
      fields: [
        { name: "id", type: "String (cuid)", required: true, description: "Primary key" },
        { name: "name", type: "String", required: false, description: "From profile" },
        { name: "email", type: "String", required: false, description: "Unique" },
        { name: "image", type: "String", required: false, description: "Avatar URL" },
        { name: "passwordHash", type: "String", required: false, description: "Bcrypt hash — only set for credentials users" },
        { name: "organizationId", type: "String", required: false, description: "FK → Organization" },
        { name: "role", type: "UserRole", required: true, description: "MANAGER | STAFF (default STAFF)" },
        { name: "accounts / sessions", type: "[]", required: false, description: "NextAuth adapter tables" },
      ],
    },
    {
      name: "Invitation",
      description:
        "Pending invite by email. Consumed on next sign-in if email matches.",
      file: "prisma/schema.prisma",
      fields: [
        { name: "id", type: "String (cuid)", required: true, description: "" },
        { name: "organizationId", type: "String", required: true, description: "FK → Organization (cascade delete)" },
        { name: "email", type: "String", required: true, description: "Unique per org (@@unique([organizationId, email]))" },
      ],
    },
    {
      name: "Bill",
      description:
        "Central entity representing a vendor invoice. Owns the AP state machine. Org-scoped; STAFF users additionally filtered by createdById.",
      file: "prisma/schema.prisma",
      fields: [
        { name: "id", type: "String (cuid)", required: true, description: "Primary key" },
        { name: "organizationId", type: "String", required: true, description: "FK → Organization (cascade delete)" },
        { name: "createdById", type: "String", required: true, description: "FK → User; used for STAFF role scoping" },
        { name: "vendorId", type: "String", required: true, description: "FK → Vendor" },
        { name: "invoiceNumber", type: "String", required: false, description: "Vendor's invoice reference" },
        { name: "invoiceDate", type: "DateTime", required: true, description: "" },
        { name: "dueDate", type: "DateTime", required: true, description: "Used for overdue / due-soon" },
        {
          name: "status",
          type: "BillStatus",
          required: true,
          description: "DRAFT | PENDING_APPROVAL | APPROVED | SCHEDULED | PAID | REJECTED | VOID",
        },
        { name: "memo", type: "String", required: false, description: "" },
        { name: "paymentMethod", type: "PaymentMethod", required: false, description: "ACH | CHECK | WIRE" },
        { name: "rejectionReason", type: "String", required: false, description: "Populated on REJECTED transition" },
        { name: "submittedAt", type: "DateTime", required: false, description: "Set when status → PENDING_APPROVAL" },
        { name: "approvedAt", type: "DateTime", required: false, description: "Set when status → APPROVED" },
        { name: "paidAt", type: "DateTime", required: false, description: "Set when status → PAID" },
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
        { name: "quantity", type: "Float", required: true, description: "" },
        { name: "unitPrice", type: "Float", required: true, description: "" },
        { name: "amount", type: "Float", required: true, description: "quantity × unitPrice" },
        { name: "glAccountId", type: "String", required: false, description: "FK → GLAccount" },
      ],
    },
    {
      name: "Vendor",
      description: "Supplier / payee. Org-scoped.",
      file: "prisma/schema.prisma",
      fields: [
        { name: "id", type: "String (cuid)", required: true, description: "" },
        { name: "organizationId", type: "String", required: true, description: "FK → Organization (cascade delete)" },
        { name: "name", type: "String", required: true, description: "Indexed" },
        { name: "email / phone / website", type: "String", required: false, description: "" },
        {
          name: "addressLine1 / addressLine2 / city / state / zip / country",
          type: "String",
          required: false,
          description: "",
        },
        { name: "bankName / bankRoutingNumber / bankAccountNumber", type: "String", required: false, description: "" },
        { name: "taxId", type: "String", required: false, description: "" },
        { name: "defaultPaymentMethod", type: "PaymentMethod", required: true, description: "ACH | CHECK | WIRE (default ACH)" },
        { name: "status", type: "VendorStatus", required: true, description: "ACTIVE | INACTIVE" },
      ],
    },
    {
      name: "GLAccount",
      description: "Chart-of-accounts entry. Org-scoped; codes unique per org.",
      file: "prisma/schema.prisma",
      fields: [
        { name: "id", type: "String (cuid)", required: true, description: "" },
        { name: "organizationId", type: "String", required: true, description: "FK → Organization (cascade delete)" },
        { name: "code", type: "String", required: true, description: "Unique per org (@@unique([organizationId, code]))" },
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
        { name: "amount", type: "Float", required: true, description: "" },
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
    UserRole: ["MANAGER", "STAFF"],
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
      {
        from: "DRAFT|PENDING_APPROVAL|APPROVED|SCHEDULED|REJECTED",
        to: "VOID",
        action: "voidBill()",
      },
    ],
    roleConstraints: {
      submit: "Any authenticated user (creates bill in their name)",
      approve: "MANAGER only",
      reject: "MANAGER only",
      schedulePayment: "MANAGER only",
      markPaid: "MANAGER only",
      void: "MANAGER only",
    },
  },

  serverActions: [
    {
      name: "Bills",
      file: "src/actions/bills.ts",
      actions: [
        {
          name: "createBill",
          input: "vendorId, invoiceNumber?, invoiceDate, dueDate, memo?, paymentMethod?, lineItems[]",
          returns: "ActionResult<{ id: string }>",
          description: "Creates a bill in DRAFT status for the current user.",
        },
        {
          name: "submitBill",
          input: "id",
          returns: "ActionResult",
          description: "Transitions DRAFT → PENDING_APPROVAL.",
        },
        {
          name: "approveBill",
          input: "id",
          returns: "ActionResult",
          description: "MANAGER only. Transitions PENDING_APPROVAL → APPROVED.",
        },
        {
          name: "rejectBill",
          input: "id, reason",
          returns: "ActionResult",
          description: "MANAGER only. Transitions PENDING_APPROVAL → REJECTED.",
        },
        {
          name: "schedulePayment",
          input: "id, scheduledDate",
          returns: "ActionResult",
          description: "MANAGER only. Transitions APPROVED → SCHEDULED. Creates Payment record.",
        },
        {
          name: "markPaid",
          input: "id",
          returns: "ActionResult",
          description: "MANAGER only. Transitions SCHEDULED → PAID. Updates Payment → COMPLETED.",
        },
        {
          name: "voidBill",
          input: "id",
          returns: "ActionResult",
          description: "MANAGER only. Voids a bill from any non-PAID status.",
        },
      ],
    },
    {
      name: "Vendors",
      file: "src/actions/vendors.ts",
      actions: [
        {
          name: "createVendor",
          input: "name, email?, phone?, address fields, bank fields, taxId?, defaultPaymentMethod?",
          returns: "ActionResult<{ id: string }>",
          description: "Creates a vendor scoped to the current org.",
        },
        {
          name: "updateVendor",
          input: "id, …partial vendor fields",
          returns: "ActionResult",
          description: "Partial update; rejects vendors from another org.",
        },
        {
          name: "deactivateVendor",
          input: "id",
          returns: "ActionResult",
          description: "Sets vendor status to INACTIVE.",
        },
      ],
    },
    {
      name: "Auth",
      file: "src/actions/auth.ts",
      actions: [
        {
          name: "signInWithGoogle",
          input: "—",
          returns: "redirect",
          description: "Calls NextAuth signIn('google'); redirects to /dashboard on success.",
        },
        {
          name: "signOutAction",
          input: "—",
          returns: "redirect",
          description: "Calls NextAuth signOut(); redirects to /.",
        },
      ],
    },
    {
      name: "Staff",
      file: "src/actions/staff.ts",
      note: "All actions require the MANAGER role.",
      actions: [
        {
          name: "inviteStaff",
          input: "email",
          returns: "ActionResult",
          description: "Creates a pending Invitation. User joins on next sign-in if email matches.",
        },
        {
          name: "revokeInvitation",
          input: "id",
          returns: "ActionResult",
          description: "Deletes the Invitation after verifying org ownership.",
        },
        {
          name: "removeStaff",
          input: "userId",
          returns: "ActionResult",
          description: "Detaches user from org. Cannot remove self or managers.",
        },
      ],
    },
  ],

  services: [
    {
      name: "BillService",
      file: "src/server/services/BillService.ts",
      factory: "src/server/container.ts → getServices()",
      scoping:
        "Constructor takes (db, ctx: UserContext). Filters by organizationId. STAFF users additionally filtered to createdById === userId.",
      methods: [
        { name: "list(filters?)", description: "Org-scoped (+ STAFF: own bills). Filter by status[], search, sort." },
        { name: "getById(id)", description: "Returns null if bill belongs to another org." },
        { name: "create(data)", description: "Validates vendor belongs to org. Creates bill in DRAFT." },
        { name: "update(id, data)", description: "Only allowed when status === DRAFT." },
        {
          name: "submit / approve / reject / schedulePayment / markPaid / void",
          description: "State transitions with pre-condition checks. approve/reject/schedule/pay/void require MANAGER role.",
        },
        { name: "getDashboardStats()", description: "Org-wide aggregates: totalPayable, overdue, dueSoon, paidThisMonth." },
        { name: "getRecentBills(limit)", description: "Most recent N bills in the org (STAFF: own bills only)." },
      ],
    },
    {
      name: "VendorService",
      file: "src/server/services/VendorService.ts",
      factory: "src/server/container.ts → getServices()",
      scoping: "Filters by organizationId.",
      methods: [
        { name: "list(filters?)", description: "Org-scoped. Search by name/email; includes _count.bills and totalPaid." },
        { name: "getById(id)", description: "Returns null if vendor belongs to another org." },
        { name: "create(data)", description: "Creates a vendor owned by the current org." },
        { name: "update(id, data)", description: "Partial updates; rejects vendors from another org." },
        { name: "deactivate(id)", description: "Sets status → INACTIVE." },
      ],
    },
    {
      name: "GLAccountService",
      file: "src/server/services/GLAccountService.ts",
      factory: "src/server/container.ts → getServices()",
      scoping: "Filters by organizationId.",
      methods: [
        { name: "list()", description: "All GL accounts for the org, ordered by type then code." },
      ],
    },
    {
      name: "StaffService",
      file: "src/server/services/StaffService.ts",
      factory: "src/server/container.ts → getServices()",
      scoping: "All methods require MANAGER role; throws Forbidden if called by STAFF.",
      methods: [
        { name: "listMembers()", description: "All users in the org, ordered by role then createdAt." },
        { name: "listInvitations()", description: "All pending invitations for the org." },
        { name: "inviteStaff(email)", description: "Upserts an Invitation; rejects existing org members or cross-org emails." },
        { name: "revokeInvitation(id)", description: "Deletes the invitation after verifying org ownership." },
        { name: "removeStaff(userId)", description: "Detaches user from org; cannot remove self or managers." },
      ],
    },
  ],

  environment: [
    {
      name: "DATABASE_URL",
      required: true,
      purpose: "PostgreSQL connection string (pooled, for Prisma queries)",
    },
    {
      name: "DIRECT_URL",
      required: true,
      purpose: "Direct PostgreSQL URL (for Prisma migrations)",
    },
    {
      name: "AUTH_SECRET",
      required: "production only",
      purpose: "NextAuth secret for JWT signing",
    },
    {
      name: "AUTH_GOOGLE_ID",
      required: true,
      purpose: "Google OAuth client ID",
    },
    {
      name: "AUTH_GOOGLE_SECRET",
      required: true,
      purpose: "Google OAuth client secret",
    },
    {
      name: "NODE_ENV",
      required: true,
      purpose: "development | test | production",
    },
  ],

  architecture: {
    patterns: [
      {
        name: "Route groups",
        description: "(marketing) for public surfaces, (app) for authenticated workspace",
      },
      {
        name: "Auth gate",
        description: "(app)/layout.tsx calls auth() and redirects unauthenticated users to /login",
      },
      {
        name: "Role gate",
        description: "requireManagerContext() redirects STAFF to /dashboard; used by /staff and manager-only service methods",
      },
      {
        name: "Server Components",
        description: "Pages are async RSCs that call services directly — no API round-trips for reads",
      },
      {
        name: "Server Actions",
        description: "All mutations in src/actions/. Return ActionResult<T> discriminated union",
      },
      {
        name: "Per-request DI",
        description: "getServices() builds org-scoped service instances each request",
      },
      {
        name: "Org scoping",
        description: "Every Vendor/Bill/GLAccount query filters by organizationId",
      },
      {
        name: "Role scoping",
        description: "BillService.scope() adds createdById filter for STAFF users",
      },
      {
        name: "Cache invalidation",
        description: "revalidatePath() called after every mutation",
      },
      {
        name: "State machine",
        description: "Bill status transitions validated in BillService before every write",
      },
      {
        name: "Validation",
        description: "Zod schemas at action entry points only",
      },
    ],
    dataFlow: {
      reads:
        "Page (RSC) → getServices() → org-scoped service → Prisma (where: { organizationId }) → PostgreSQL",
      mutations:
        "Client component → Server Action → Zod validation → getServices() → service method → Prisma → revalidatePath()",
      auth: "/login → Google OAuth → /api/auth/callback/google → PrismaAdapter creates User → events.createUser → assignUserToOrganization() → /dashboard",
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
