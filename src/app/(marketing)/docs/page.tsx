export const dynamic = "force-dynamic";

import Link from "next/link";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation — Payabill",
  description: "Technical reference for the Payabill AP platform",
};

const sections = [
  { id: "overview", label: "Overview" },
  { id: "auth", label: "Auth & Org Model" },
  { id: "seed-data", label: "Demo Data" },
  { id: "architecture", label: "Architecture" },
  { id: "data-model", label: "Data Model" },
  { id: "bill-lifecycle", label: "Bill Lifecycle" },
  { id: "routes", label: "Routes & Pages" },
  { id: "server-actions", label: "Server Actions" },
  { id: "services", label: "Service Layer" },
  { id: "environment", label: "Environment" },
  { id: "machine-api", label: "Machine API" },
];

function SectionHeading({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className="mt-16 scroll-mt-8 border-t border-slate-100 pt-10 text-xl font-semibold tracking-tight text-slate-900 first:mt-0 first:border-t-0 first:pt-0"
    >
      {children}
    </h2>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-8 text-sm font-semibold tracking-widest text-slate-400 uppercase">
      {children}
    </h3>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-sm leading-7 text-slate-600">{children}</p>;
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.8em] text-slate-700">
      {children}
    </code>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-900 px-5 py-4 font-mono text-[0.8rem] leading-6 text-slate-300">
      {children}
    </pre>
  );
}

function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | React.ReactNode)[][];
}) {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-2.5 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
            >
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 align-top text-slate-600">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[0.7rem] font-medium text-indigo-600">
      {children}
    </span>
  );
}

function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}
    >
      {label}
    </span>
  );
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#312D97] shadow-md shadow-[#312D97]/30">
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight text-[#1a174f]">
              Payabill
            </span>
            <span className="ml-1 hidden text-sm text-slate-400 sm:inline">
              / Documentation
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="hidden text-sm font-medium text-slate-600 hover:text-[#312D97] sm:block"
            >
              Home
            </Link>
            <Link
              href="/login"
              className="hover:bg-brand-900 rounded-full bg-[#312D97] px-4 py-1.5 text-sm font-semibold text-white shadow-md shadow-[#312D97]/30 transition-all hover:-translate-y-0.5"
            >
              Sign in
            </Link>
          </div>
        </nav>
      </header>

      <div className="flex min-h-full">
        {/* Sticky TOC */}
        <aside className="hidden w-52 flex-shrink-0 xl:block">
          <div className="sticky top-0 overflow-y-auto py-10 pr-4 pl-8">
            <p className="mb-4 text-[0.65rem] font-semibold tracking-widest text-slate-400 uppercase">
              On this page
            </p>
            <nav className="space-y-1">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block rounded py-1 text-xs text-slate-500 transition-colors hover:text-slate-900"
                >
                  {s.label}
                </a>
              ))}
            </nav>
            <div className="mt-8 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-[0.65rem] font-semibold tracking-widest text-slate-400 uppercase">
                Machine API
              </p>
              <a
                href="/api/docs"
                target="_blank"
                className="mt-1 block font-mono text-[0.7rem] text-indigo-500 hover:text-indigo-700"
              >
                GET /api/docs
              </a>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <article className="min-w-0 flex-1 px-8 py-10 xl:pr-16">
          {/* Header */}
          <div className="mb-12">
            <div className="mb-3 flex items-center gap-2">
              <Tag>v0.1.0</Tag>
              <Tag>Next.js 15</Tag>
              <Tag>Prisma</Tag>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Payabill AP
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-slate-500">
              An accounts payable workflow engine that moves vendor invoices
              from receipt through approval to payment. Technical reference for
              engineers and AI agents.
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Machine-readable version available at{" "}
              <a
                href="/api/docs"
                target="_blank"
                className="font-mono text-indigo-500 hover:underline"
              >
                /api/docs
              </a>
            </p>
          </div>

          {/* ── Overview ── */}
          <SectionHeading id="overview">Overview</SectionHeading>
          <Prose>
            Payabill is a self-contained AP platform built for small-to-mid-size
            finance teams. It provides three primary surfaces: a{" "}
            <strong>Bills inbox</strong> for managing the full invoice
            lifecycle, a <strong>Vendor directory</strong> for supplier
            management, and a <strong>Dashboard</strong> for real-time payables
            metrics.
          </Prose>
          <Prose>
            There is no external REST API — all mutations are implemented as
            Next.js Server Actions. Data is fetched server-side in React Server
            Components and rendered without client-side data-fetching libraries.
          </Prose>

          <SubHeading>Stack</SubHeading>
          <Table
            headers={["Layer", "Technology"]}
            rows={[
              ["Framework", "Next.js 15.2 (App Router, React 19)"],
              ["Language", "TypeScript 5.8 (strict)"],
              ["Database", "PostgreSQL via Prisma 6.6"],
              [
                "Auth",
                "NextAuth v5-beta · Google OAuth · PrismaAdapter (database sessions)",
              ],
              ["Styling", "Tailwind CSS 4.0 (PostCSS)"],
              ["Validation", "Zod"],
              ["Font", "Geist Sans (Google Fonts)"],
            ]}
          />

          {/* ── Auth & Org Model ── */}
          <SectionHeading id="auth">Auth &amp; Org Model</SectionHeading>
          <Prose>
            Payabill is multi-tenant: every user belongs to exactly one{" "}
            <Code>Organization</Code>. The application surfaces are split into
            two route groups:
          </Prose>
          <Table
            headers={["Group", "Layout", "Auth", "Routes"]}
            rows={[
              [
                "(marketing)",
                "src/app/(marketing)/layout.tsx",
                "Public",
                "/ (landing), /login, /docs",
              ],
              [
                "(app)",
                "src/app/(app)/layout.tsx",
                "Required — redirects to /login",
                "/dashboard, /bills/*, /vendors/*, /staff",
              ],
            ]}
          />

          <SubHeading>Sign-in flow</SubHeading>
          <Prose>
            The <Code>/login</Code> page supports Google OAuth (
            <Code>Continue with Google</Code>) and email/password credentials.
            On first Google sign-in, the PrismaAdapter creates a{" "}
            <Code>User</Code> row and fires the{" "}
            <Code>events.createUser</Code> hook, which calls{" "}
            <Code>assignUserToOrganization()</Code>:
          </Prose>
          <CodeBlock>{`/login  →  Google OAuth  →  /api/auth/callback/google
                              ↓
              PrismaAdapter creates User (first time)
                              ↓
           events.createUser → assignUserToOrganization()
           ┌─ pending Invitation matches email?
           │   yes → join that org as STAFF, delete invitation
           └─ no  → create new Organization, user becomes MANAGER
                              ↓
                          /dashboard`}</CodeBlock>

          <SubHeading>Roles</SubHeading>
          <Table
            headers={["Role", "Can do"]}
            rows={[
              [
                "MANAGER",
                "Approve/reject bills, schedule payments, access /staff, see all bills in the org",
              ],
              [
                "STAFF",
                "Create and submit bills (including to new vendors), see only their own bills",
              ],
            ]}
          />

          <SubHeading>Per-request user context</SubHeading>
          <Prose>
            Every authenticated request resolves a <Code>UserContext</Code> (
            <Code>userId</Code>, <Code>organizationId</Code>,{" "}
            <Code>role</Code>) via <Code>requireUserContext()</Code> in{" "}
            <Code>src/server/get-user.ts</Code>. Services are instantiated
            per-request through <Code>getServices()</Code> in{" "}
            <Code>src/server/container.ts</Code>.
          </Prose>
          <CodeBlock>{`// src/server/get-user.ts
export interface UserContext {
  userId: string;
  organizationId: string;
  role: UserRole; // "MANAGER" | "STAFF"
}

// BillService scopes by org; STAFF additionally filters to their own bills
private scope() {
  return {
    organizationId: this.ctx.organizationId,
    ...(this.ctx.role === "STAFF" ? { createdById: this.ctx.userId } : {}),
  };
}`}</CodeBlock>

          <SubHeading>Organization-scoped models</SubHeading>
          <Prose>
            <Code>Vendor</Code>, <Code>Bill</Code>, and <Code>GLAccount</Code>{" "}
            each carry a required <Code>organizationId</Code> FK (cascade-delete
            with Organization). <Code>Bill</Code> additionally has{" "}
            <Code>createdById</Code> (FK to User) for role-based filtering.{" "}
            <Code>BillLineItem</Code> and <Code>Payment</Code> inherit their org
            via their parent bill.
          </Prose>

          {/* ── Demo Data ── */}
          <SectionHeading id="seed-data">Demo Data</SectionHeading>
          <Prose>
            Running <Code>npm run db:seed</Code> creates a{" "}
            <strong>Payable Demo Co</strong> organization with two pre-seeded
            accounts and a full realistic dataset.
          </Prose>

          <Table
            headers={["Email", "Password", "Role"]}
            rows={[
              ["manager@payabill.com", "pass1234", "MANAGER"],
              ["staff@payabill.com", "pass1234", "STAFF"],
            ]}
          />

          <SubHeading>What gets seeded</SubHeading>
          <Prose>
            <Code>seedOrganization()</Code> in{" "}
            <Code>src/server/seed-user.ts</Code> creates 6 vendors (Stripe, AWS,
            Notion, WeWork, Gusto, HubSpot), 8 GL accounts, and ~19 bills
            spanning all statuses. Bills are split between the manager and staff
            user so signing in as either role shows realistic data for that
            perspective.
          </Prose>
          <Prose>
            The seed script is idempotent: it deletes the existing{" "}
            <Code>Payable Demo Co</Code> org and its users before re-creating
            them, so running it multiple times is safe.
          </Prose>

          {/* ── Architecture ── */}
          <SectionHeading id="architecture">Architecture</SectionHeading>
          <Prose>
            The app follows a layered architecture with a clear boundary between
            server-only and client code.
          </Prose>
          <CodeBlock>{`src/
├── app/              Next.js pages (Server Components by default)
│   ├── (marketing)/  Public surfaces — no AppShell, no auth
│   │   ├── page.tsx          Landing
│   │   ├── login/page.tsx    Sign in (Google + credentials)
│   │   └── docs/page.tsx     This documentation
│   ├── (app)/        Authenticated surfaces — AppShell + auth guard
│   │   ├── layout.tsx        Calls auth() → redirect("/login") if unauthed
│   │   ├── dashboard/        Role-split: ManagerDashboard | StaffDashboard
│   │   ├── bills/            Bills inbox + create + detail
│   │   ├── vendors/          Vendor directory + create + edit + detail
│   │   └── staff/            Manager-only: invite + manage team members
│   ├── layout.tsx    Root: html/body + Geist font (no AppShell)
│   └── api/
│       ├── auth/     NextAuth route handler
│       └── docs/     Machine-readable JSON documentation
├── actions/          Server Actions ("use server") — mutations only
│   ├── bills.ts      Bill lifecycle
│   ├── vendors.ts    Vendor CRUD
│   ├── auth.ts       signInWithGoogle, signOutAction
│   └── staff.ts      inviteStaff, revokeInvitation, removeStaff
├── server/
│   ├── auth.ts       NextAuth config (Google + Credentials providers)
│   ├── db.ts         Prisma singleton
│   ├── get-user.ts   requireUserContext() — { userId, organizationId, role }
│   ├── container.ts  Per-request service factory: getServices()
│   ├── assign-org.ts Org assignment on first sign-in
│   ├── seed-user.ts  seedOrganization() — org-level demo data
│   └── services/     Business logic classes — all org-scoped
├── components/
│   ├── auth/         CredentialsForm, GoogleSignInButton
│   ├── ui/           Primitive components (Button, Card, Switch, …)
│   ├── layout/       AppShell, Sidebar (with UserMenu + sign out)
│   ├── dashboard/    DashboardTour
│   ├── bills/        Bill-specific components
│   └── vendors/      Vendor-specific components
└── lib/utils.ts      cn(), formatCurrency(), formatDate(), …`}</CodeBlock>

          <SubHeading>Key patterns</SubHeading>
          <Table
            headers={["Pattern", "Implementation"]}
            rows={[
              [
                "Route groups",
                "(marketing) for public surfaces, (app) for the authenticated workspace",
              ],
              [
                "Auth gate",
                "(app)/layout.tsx calls auth() and redirects unauthenticated users to /login",
              ],
              [
                "Role gate",
                "requireManagerContext() in get-user.ts redirects STAFF users to /dashboard",
              ],
              [
                "Server Components",
                "Pages are async RSCs that call services directly — no API round-trips",
              ],
              [
                "Server Actions",
                "All mutations live in src/actions/, return ActionResult<T>",
              ],
              [
                "Per-request DI",
                "getServices() returns org-scoped service instances; every query filters by organizationId",
              ],
              [
                "Role scoping",
                "BillService.scope() adds createdById filter for STAFF users so they only see their own bills",
              ],
              [
                "Cache invalidation",
                "revalidatePath() called after every mutation to bust RSC cache",
              ],
              [
                "State machine",
                "Bill status transitions validated in BillService before every update",
              ],
              [
                "Validation",
                "Zod schemas at action entry points; no client-side validation",
              ],
              [
                "Class composition",
                "cn() = clsx + tailwind-merge for safe Tailwind class merging",
              ],
            ]}
          />

          <SubHeading>Action result contract</SubHeading>
          <Prose>
            Every server action returns a discriminated union so callers never
            need to catch exceptions:
          </Prose>
          <CodeBlock>{`type ActionResult<T = void> =
  | { success: true;  data: T }
  | { success: false; error: string }`}</CodeBlock>

          {/* ── Data Model ── */}
          <SectionHeading id="data-model">Data Model</SectionHeading>

          <SubHeading>Organization</SubHeading>
          <Prose>Top-level tenant. All domain data is scoped to an org.</Prose>
          <Table
            headers={["Field", "Type", "Notes"]}
            rows={[
              ["id", "String (cuid)", "Primary key"],
              ["name", "String", "e.g. &quot;Acme Corp&quot;"],
              ["users", "User[]", "Members of this workspace"],
              ["vendors / bills / glAccounts / invitations", "[]", "Owned data (cascade delete)"],
            ]}
          />

          <SubHeading>User</SubHeading>
          <Prose>
            Workspace member. NextAuth PrismaAdapter creates one row per account
            on first sign-in, then <Code>assignUserToOrganization()</Code>{" "}
            attaches the user to an org.
          </Prose>
          <Table
            headers={["Field", "Type", "Notes"]}
            rows={[
              ["id", "String (cuid)", "Primary key"],
              ["name / email / image", "String?", "From Google profile or credentials"],
              ["passwordHash", "String?", "Bcrypt hash — only set for credentials users"],
              ["organizationId", "String?", "FK → Organization"],
              ["role", "UserRole", "MANAGER · STAFF"],
              ["accounts / sessions", "[]", "NextAuth adapter tables"],
            ]}
          />

          <SubHeading>Invitation</SubHeading>
          <Prose>
            Pending invite. When a new user signs in and their email matches an
            invitation, they join that org as STAFF and the invitation is
            deleted.
          </Prose>
          <Table
            headers={["Field", "Type", "Notes"]}
            rows={[
              ["id", "String (cuid)", ""],
              ["organizationId", "String", "FK → Organization (cascade delete)"],
              ["email", "String", "Unique per org (@@unique([organizationId, email]))"],
            ]}
          />

          <SubHeading>Bill</SubHeading>
          <Prose>Central entity. One bill per vendor invoice.</Prose>
          <Table
            headers={["Field", "Type", "Notes"]}
            rows={[
              ["id", "String (cuid)", "Primary key"],
              ["organizationId", "String", "FK → Organization (cascade delete)"],
              ["createdById", "String", "FK → User; used for STAFF role scoping"],
              ["vendorId", "String", "FK → Vendor"],
              ["invoiceNumber", "String?", "Vendor's invoice reference"],
              ["invoiceDate", "DateTime", ""],
              ["dueDate", "DateTime", "Used for overdue calculation"],
              ["status", "BillStatus", "See Bill Lifecycle"],
              ["memo", "String?", ""],
              ["paymentMethod", "PaymentMethod?", "ACH · CHECK · WIRE"],
              ["rejectionReason", "String?", "Set on REJECTED transition"],
              ["submittedAt / approvedAt / paidAt", "DateTime?", "Audit trail"],
            ]}
          />

          <SubHeading>BillLineItem</SubHeading>
          <Table
            headers={["Field", "Type", "Notes"]}
            rows={[
              ["id", "String (cuid)", ""],
              ["billId", "String", "FK → Bill (cascade delete)"],
              ["description", "String", ""],
              ["quantity", "Float", ""],
              ["unitPrice", "Float", ""],
              ["amount", "Float", "quantity × unitPrice"],
              ["glAccountId", "String?", "FK → GLAccount"],
            ]}
          />

          <SubHeading>Vendor</SubHeading>
          <Table
            headers={["Field", "Type", "Notes"]}
            rows={[
              ["id", "String (cuid)", ""],
              ["organizationId", "String", "FK → Organization (cascade delete)"],
              ["name", "String", "Indexed"],
              ["email / phone / website", "String?", ""],
              ["address.*", "String?", "line1, line2, city, state, zip, country"],
              ["bankName / bankRoutingNumber / bankAccountNumber", "String?", ""],
              ["taxId", "String?", ""],
              ["defaultPaymentMethod", "PaymentMethod", "ACH · CHECK · WIRE"],
              ["status", "VendorStatus", "ACTIVE · INACTIVE"],
            ]}
          />

          <SubHeading>GLAccount</SubHeading>
          <Table
            headers={["Field", "Type", "Notes"]}
            rows={[
              ["id", "String (cuid)", ""],
              ["organizationId", "String", "FK → Organization (cascade delete)"],
              ["code", "String", "Unique per org (@@unique([organizationId, code]))"],
              ["name", "String", ""],
              ["type", "GLAccountType", "EXPENSE · LIABILITY · ASSET"],
            ]}
          />

          <SubHeading>Payment</SubHeading>
          <Table
            headers={["Field", "Type", "Notes"]}
            rows={[
              ["id", "String (cuid)", ""],
              ["billId", "String", "FK → Bill"],
              ["amount", "Float", ""],
              ["method", "PaymentMethod", "ACH · CHECK · WIRE"],
              ["status", "PaymentStatus", "PENDING · PROCESSING · COMPLETED · FAILED"],
              ["reference", "String?", ""],
              ["scheduledDate", "DateTime?", ""],
              ["processedDate", "DateTime?", ""],
            ]}
          />

          <SubHeading>NextAuth models</SubHeading>
          <Prose>
            <Code>Account</Code>, <Code>Session</Code>, and{" "}
            <Code>VerificationToken</Code> are standard NextAuth Prisma adapter
            models. The PrismaAdapter manages them — no application code touches
            them directly.
          </Prose>

          {/* ── Bill Lifecycle ── */}
          <SectionHeading id="bill-lifecycle">Bill Lifecycle</SectionHeading>
          <Prose>
            Bills move through a strict state machine. Every transition is
            validated in <Code>BillService</Code> before the database write.
          </Prose>

          {/* State machine diagram */}
          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-100 bg-slate-50 p-6">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {[
                { label: "DRAFT", color: "bg-slate-200 text-slate-700" },
                { label: "→", color: "" },
                {
                  label: "PENDING APPROVAL",
                  color: "bg-amber-100 text-amber-700",
                },
                { label: "→", color: "" },
                { label: "APPROVED", color: "bg-indigo-100 text-indigo-700" },
                { label: "→", color: "" },
                { label: "SCHEDULED", color: "bg-purple-100 text-purple-700" },
                { label: "→", color: "" },
                { label: "PAID", color: "bg-emerald-100 text-emerald-700" },
              ].map((item, i) =>
                item.color ? (
                  <span
                    key={i}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${item.color}`}
                  >
                    {item.label}
                  </span>
                ) : (
                  <span key={i} className="text-slate-400">
                    {item.label}
                  </span>
                ),
              )}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="w-full text-[0.7rem] text-slate-400">
                From PENDING APPROVAL:
              </span>
              <span className="ml-2 text-slate-400">↳</span>
              <StatusPill label="REJECTED" color="bg-red-100 text-red-700" />
              <span className="text-xs text-slate-400">
                (can be resubmitted)
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="w-full text-[0.7rem] text-slate-400">
                From any non-PAID status:
              </span>
              <span className="ml-2 text-slate-400">↳</span>
              <StatusPill label="VOID" color="bg-slate-200 text-slate-600" />
            </div>
          </div>

          <Table
            headers={["Transition", "From", "To", "Action"]}
            rows={[
              ["Submit", "DRAFT", "PENDING_APPROVAL", "submitBill()"],
              ["Approve", "PENDING_APPROVAL", "APPROVED", "approveBill()"],
              [
                "Reject",
                "PENDING_APPROVAL",
                "REJECTED",
                "rejectBill(id, reason)",
              ],
              ["Schedule", "APPROVED", "SCHEDULED", "schedulePayment()"],
              ["Mark paid", "SCHEDULED", "PAID", "markPaid()"],
              ["Void", "Any except PAID", "VOID", "voidBill()"],
            ]}
          />

          {/* ── Routes ── */}
          <SectionHeading id="routes">Routes &amp; Pages</SectionHeading>
          <Prose>
            All pages are React Server Components. They fetch data directly via
            service singletons and render on the server. Interactive sections
            are extracted into <Code>&quot;use client&quot;</Code> components.
          </Prose>
          <Table
            headers={["Route", "Group", "File", "Purpose"]}
            rows={[
              [
                "/",
                "(marketing)",
                "app/(marketing)/page.tsx",
                "Landing page. Redirects to /dashboard when signed in.",
              ],
              [
                "/login",
                "(marketing)",
                "app/(marketing)/login/page.tsx",
                "Sign-in / sign-up via Google.",
              ],
              [
                "/dashboard",
                "(app)",
                "app/(app)/dashboard/page.tsx",
                "Live stats + recent bills + Show-demo-data toggle",
              ],
              [
                "/bills",
                "(app)",
                "app/(app)/bills/page.tsx",
                "Bills inbox with status filter + search",
              ],
              [
                "/bills/new",
                "(app)",
                "app/(app)/bills/new/page.tsx",
                "Create bill with line items",
              ],
              [
                "/bills/[id]",
                "(app)",
                "app/(app)/bills/[id]/page.tsx",
                "Bill detail + state-machine actions",
              ],
              [
                "/bills/[id]/edit",
                "(app)",
                "app/(app)/bills/[id]/edit/page.tsx",
                "Edit a draft bill. Redirects to /bills/[id] if bill is not in DRAFT status.",
              ],
              [
                "/vendors",
                "(app)",
                "app/(app)/vendors/page.tsx",
                "Vendor directory with search",
              ],
              [
                "/vendors/new",
                "(app)",
                "app/(app)/vendors/new/page.tsx",
                "Create vendor",
              ],
              [
                "/vendors/[id]",
                "(app)",
                "app/(app)/vendors/[id]/page.tsx",
                "Vendor detail + bill history",
              ],
              [
                "/vendors/[id]/edit",
                "(app)",
                "app/(app)/vendors/[id]/edit/page.tsx",
                "Edit vendor",
              ],
              [
                "/staff",
                "(app)",
                "app/(app)/staff/page.tsx",
                "Manager-only: invite staff by email, view team members, revoke invitations.",
              ],
              [
                "/docs",
                "(marketing)",
                "app/(marketing)/docs/page.tsx",
                "This page (public, no auth required)",
              ],
              [
                "/api/auth/[...nextauth]",
                "—",
                "app/api/auth/[...nextauth]/route.ts",
                "NextAuth handler (signin, callback, signout, session)",
              ],
              [
                "/api/docs",
                "—",
                "app/api/docs/route.ts",
                "Machine-readable JSON documentation",
              ],
            ]}
          />

          {/* ── Server Actions ── */}
          <SectionHeading id="server-actions">Server Actions</SectionHeading>
          <Prose>
            Defined in <Code>src/actions/</Code> with the{" "}
            <Code>&quot;use server&quot;</Code> directive. All validate input
            with Zod, call the appropriate service method, and call{" "}
            <Code>revalidatePath()</Code> to invalidate RSC cache.
          </Prose>

          <SubHeading>Bills — src/actions/bills.ts</SubHeading>
          <Table
            headers={["Function", "Input", "Returns"]}
            rows={[
              [
                "createBill()",
                "FormData (vendor, dates, lineItems, paymentMethod)",
                "ActionResult<{ id: string }>",
              ],
              [
                "updateBill()",
                "id + same shape as createBill",
                "ActionResult — DRAFT only; replaces all line items",
              ],
              ["submitBill()", "FormData { id }", "ActionResult"],
              ["approveBill()", "FormData { id }", "ActionResult"],
              ["rejectBill()", "FormData { id, reason }", "ActionResult"],
              [
                "schedulePayment()",
                "FormData { id, scheduledDate, method, reference? }",
                "ActionResult",
              ],
              ["markPaid()", "FormData { id }", "ActionResult"],
              ["voidBill()", "FormData { id }", "ActionResult"],
            ]}
          />

          <SubHeading>Vendors — src/actions/vendors.ts</SubHeading>
          <Table
            headers={["Function", "Input", "Returns"]}
            rows={[
              [
                "createVendor()",
                "FormData (name, email?, phone?, address, bank, taxId, …)",
                "ActionResult<{ id: string }>",
              ],
              [
                "updateVendor()",
                "FormData { id, …partial vendor fields }",
                "ActionResult",
              ],
              ["deactivateVendor()", "FormData { id }", "ActionResult"],
            ]}
          />

          <SubHeading>Auth — src/actions/auth.ts</SubHeading>
          <Table
            headers={["Function", "Behavior"]}
            rows={[
              [
                "signInWithGoogle()",
                "Calls NextAuth signIn('google'); redirects to /dashboard on success",
              ],
              [
                "signOutAction()",
                "Calls NextAuth signOut(); redirects to / (landing)",
              ],
            ]}
          />

          <SubHeading>Staff — src/actions/staff.ts</SubHeading>
          <Prose>All operations require the MANAGER role.</Prose>
          <Table
            headers={["Function", "Input", "Returns"]}
            rows={[
              [
                "inviteStaff()",
                "FormData { email }",
                "ActionResult — creates a pending Invitation; user joins on next sign-in",
              ],
              [
                "revokeInvitation()",
                "FormData { id }",
                "ActionResult — deletes the Invitation",
              ],
              [
                "removeStaff()",
                "FormData { userId }",
                "ActionResult — detaches user from org (cannot remove yourself or another manager)",
              ],
            ]}
          />

          {/* ── Services ── */}
          <SectionHeading id="services">Service Layer</SectionHeading>
          <Prose>
            Services encapsulate all business logic and database access. Each
            service takes the Prisma client and a <Code>UserContext</Code> (
            <Code>userId</Code>, <Code>organizationId</Code>,{" "}
            <Code>role</Code>) in its constructor and scopes every query to the
            org. Instances are returned by{" "}
            <Code>getServices()</Code> in <Code>src/server/container.ts</Code> —
            a per-request factory consumed by both pages (RSC reads) and actions
            (mutations).
          </Prose>
          <CodeBlock>{`// In any RSC or server action
const { billService, vendorService, glAccountService, staffService, ctx } =
  await getServices();
// Redirects to /login if unauthenticated.
// All service calls are scoped to ctx.organizationId.`}</CodeBlock>

          <SubHeading>BillService</SubHeading>
          <Table
            headers={["Method", "Description"]}
            rows={[
              ["list(filters?)", "Filter by status[], search string, sort. Paginated: page (default 1), pageSize (default 20). Returns { data, total, page, pageSize, totalPages }."],
              ["getById(id)", "Includes vendor, lineItems.glAccount, payments"],
              ["create(data)", "Creates bill in DRAFT with nested line items"],
              ["update(id, data)", "Only allowed in DRAFT status"],
              [
                "submit / approve / reject / schedulePayment / markPaid / void",
                "State transitions with pre-condition validation",
              ],
              [
                "getDashboardStats()",
                "Aggregates: totalPayable, overdue count/amount, dueSoon, paidThisMonth",
              ],
              ["getRecentBills(limit)", "Last N bills by createdAt desc"],
            ]}
          />

          <SubHeading>VendorService</SubHeading>
          <Table
            headers={["Method", "Description"]}
            rows={[
              [
                "list(filters?)",
                "Search by name/email; includes _count.bills and totalPaid aggregate. Paginated: page (default 1), pageSize (default 20). Returns { data, total, page, pageSize, totalPages }.",
              ],
              ["getById(id)", "Includes bills"],
              ["create(data)", ""],
              ["update(id, data)", "Partial updates"],
              ["deactivate(id)", "Sets status → INACTIVE"],
            ]}
          />

          <SubHeading>GLAccountService</SubHeading>
          <Table
            headers={["Method", "Description"]}
            rows={[["list()", "All GL accounts for the org, ordered by type then code"]]}
          />

          <SubHeading>StaffService</SubHeading>
          <Prose>All methods require the MANAGER role; throws if called by STAFF.</Prose>
          <Table
            headers={["Method", "Description"]}
            rows={[
              ["listMembers()", "All users in the org, ordered by role then createdAt"],
              ["listInvitations()", "All pending invitations for the org"],
              ["inviteStaff(email)", "Upserts an Invitation; rejects existing org members or cross-org emails"],
              ["revokeInvitation(id)", "Deletes the invitation after verifying org ownership"],
              ["removeStaff(userId)", "Detaches user from org; cannot remove self or managers"],
            ]}
          />

          {/* ── Environment ── */}
          <SectionHeading id="environment">Environment</SectionHeading>
          <Prose>
            Variables are validated at startup via <Code>src/env.js</Code>{" "}
            (t3-env pattern). Missing required variables throw at build time.
            Google OAuth credentials are mandatory now that authentication is
            required for the workspace.
          </Prose>
          <Table
            headers={["Variable", "Required", "Purpose"]}
            rows={[
              ["DATABASE_URL", "Yes", "PostgreSQL connection string (pooled)"],
              ["DIRECT_URL", "Yes", "Direct DB URL for Prisma migrations"],
              [
                "AUTH_SECRET",
                "Production only",
                "NextAuth secret for JWT signing",
              ],
              ["AUTH_GOOGLE_ID", "Yes", "Google OAuth client ID"],
              ["AUTH_GOOGLE_SECRET", "Yes", "Google OAuth client secret"],
              ["NODE_ENV", "Yes", "development · test · production"],
            ]}
          />

          {/* ── Machine API ── */}
          <SectionHeading id="machine-api">Machine API</SectionHeading>
          <Prose>
            A structured JSON representation of this documentation is available
            at <Code>/api/docs</Code>. It is designed for AI agents and
            automated tooling that need to understand the application&apos;s
            capabilities without parsing HTML.
          </Prose>
          <CodeBlock>{`GET /api/docs
Content-Type: application/json

{
  "version": "1.0.0",
  "name": "Payabill AP",
  "description": "...",
  "stack": { ... },
  "routes": [ { "path", "method", "description", "file" } ],
  "dataModels": [ { "name", "description", "fields": [...] } ],
  "serverActions": [ { "name", "file", "actions": [...] } ],
  "services": [ { "name", "file", "methods": [...] } ],
  "billLifecycle": { "states": [...], "transitions": [...] },
  "environment": [ { "name", "required", "purpose" } ]
}`}</CodeBlock>
          <Prose>
            The endpoint is unauthenticated and read-only. It reflects the
            current state of the application schema; no runtime data is
            included.
          </Prose>

          {/* Footer */}
          <div className="mt-16 flex items-center justify-between border-t border-slate-100 pt-8 text-xs text-slate-400">
            <span>Payabill AP · Technical Reference</span>
            <a
              href="/api/docs"
              target="_blank"
              className="font-mono text-indigo-400 hover:text-indigo-600"
            >
              /api/docs ↗
            </a>
          </div>
        </article>
      </div>
    </div>
  );
}
