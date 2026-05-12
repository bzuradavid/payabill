export const dynamic = "force-dynamic";

import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation — Payables",
  description: "Technical reference for the Payables AP platform",
};

const sections = [
  { id: "overview", label: "Overview" },
  { id: "auth", label: "Auth & User Scoping" },
  { id: "seed-data", label: "Seed Data & Toggle" },
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
    <h3 className="mt-8 text-sm font-semibold uppercase tracking-widest text-slate-400">
      {children}
    </h3>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 leading-7 text-slate-600 text-sm">{children}</p>
  );
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
    <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-900 px-5 py-4 text-[0.8rem] leading-6 text-slate-300 font-mono">
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
                className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
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
                <td key={j} className="px-4 py-2.5 text-slate-600 align-top">
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

function StatusPill({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
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
    <div className="flex min-h-full">
      {/* Sticky TOC */}
      <aside className="hidden w-52 flex-shrink-0 xl:block">
        <div className="sticky top-0 overflow-y-auto py-10 pl-8 pr-4">
          <p className="mb-4 text-[0.65rem] font-semibold uppercase tracking-widest text-slate-400">
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
            <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-slate-400">
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
            Payables AP
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-slate-500">
            An accounts payable workflow engine that moves vendor invoices from
            receipt through approval to payment. Technical reference for
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
          Payables is a self-contained AP platform built for small-to-mid-size
          finance teams. It provides three primary surfaces: a{" "}
          <strong>Bills inbox</strong> for managing the full invoice lifecycle, a{" "}
          <strong>Vendor directory</strong> for supplier management, and a{" "}
          <strong>Dashboard</strong> for real-time payables metrics.
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
            ["Auth", "NextAuth v5-beta · Google OAuth · PrismaAdapter (database sessions)"],
            ["Styling", "Tailwind CSS 4.0 (PostCSS)"],
            ["Validation", "Zod"],
            ["Font", "Geist Sans (Google Fonts)"],
          ]}
        />

        {/* ── Auth & User Scoping ── */}
        <SectionHeading id="auth">Auth &amp; User Scoping</SectionHeading>
        <Prose>
          Payables is a multi-tenant single-user-per-tenant product: every user
          gets their own private workspace. The application surfaces are split
          into two route groups:
        </Prose>
        <Table
          headers={["Group", "Layout", "Auth", "Routes"]}
          rows={[
            [
              "(marketing)",
              "src/app/(marketing)/layout.tsx",
              "Public",
              "/ (landing), /login",
            ],
            [
              "(app)",
              "src/app/(app)/layout.tsx",
              "Required — redirects to /login",
              "/dashboard, /bills/*, /vendors/*, /docs",
            ],
          ]}
        />

        <SubHeading>Sign-in flow</SubHeading>
        <Prose>
          A single &quot;Continue with Google&quot; button on{" "}
          <Code>/login</Code> handles both sign-up and sign-in. The
          PrismaAdapter creates a new <Code>User</Code> row the first time a
          Google account is seen.
        </Prose>
        <CodeBlock>{`/  →  /login  →  Google OAuth  →  /api/auth/callback/google
                                          ↓
                          PrismaAdapter creates User (first time)
                                          ↓
                                      /dashboard`}</CodeBlock>

        <SubHeading>Per-request user context</SubHeading>
        <Prose>
          Every authenticated request resolves a <Code>UserContext</Code>{" "}
          (<Code>userId</Code> + <Code>showSeed</Code> preference) via{" "}
          <Code>requireUserContext()</Code> in{" "}
          <Code>src/server/get-user.ts</Code>. Services are instantiated
          per-request through <Code>getServices()</Code> in{" "}
          <Code>src/server/container.ts</Code>; they baked the user&apos;s id
          into every query.
        </Prose>
        <CodeBlock>{`// Every service method filters by userId automatically
// (and by seed: false when showSeed is off)
private scope() {
  return {
    userId: this.ctx.userId,
    ...(this.ctx.showSeed ? {} : { seed: false }),
  };
}`}</CodeBlock>

        <SubHeading>User-scoped models</SubHeading>
        <Prose>
          <Code>Vendor</Code>, <Code>Bill</Code>, and <Code>GLAccount</Code>{" "}
          each carry a required <Code>userId</Code> FK (cascade-delete with
          User). <Code>BillLineItem</Code> and <Code>Payment</Code> inherit
          their owner via their parent bill.
        </Prose>

        {/* ── Seed Data & Toggle ── */}
        <SectionHeading id="seed-data">Seed Data &amp; Toggle</SectionHeading>
        <Prose>
          New workspaces start empty. Users can opt into a realistic demo
          dataset (6 vendors, 8 GL accounts, ~20 bills across every status)
          by flipping the &quot;Show demo data&quot; switch on the dashboard.
        </Prose>

        <SubHeading>How seeding works</SubHeading>
        <Prose>
          The first time a user turns on &quot;Show demo data&quot;,{" "}
          <Code>setShowSeed(true)</Code> calls{" "}
          <Code>seedUserData(db, user.id)</Code> from{" "}
          <Code>src/server/seed-user.ts</Code>, inserts a personal copy of
          the demo dataset (all rows marked <Code>seed: true</Code>), and
          stamps <Code>User.seededAt</Code>. The <Code>seededAt</Code>{" "}
          guard makes seeding one-shot: toggling off-then-on again won&apos;t
          duplicate rows.
        </Prose>
        <Prose>
          Because seeding is per-user, edits never leak between accounts —
          each user owns their own demo rows and can modify or delete them
          freely.
        </Prose>

        <SubHeading>The seed field</SubHeading>
        <Table
          headers={["Model", "Field", "Default"]}
          rows={[
            ["Vendor", "seed: Boolean", "false"],
            ["Bill", "seed: Boolean", "false"],
            ["BillLineItem", "seed: Boolean", "false"],
            ["Payment", "seed: Boolean", "false"],
            ["GLAccount", "seed: Boolean", "false"],
          ]}
        />
        <Prose>
          New rows the user creates default to <Code>seed: false</Code>, so
          they remain visible regardless of the toggle.
        </Prose>

        <SubHeading>The toggle</SubHeading>
        <Prose>
          The dashboard header includes a &quot;Show demo data&quot; switch
          (
          <Code>src/components/dashboard/ShowSeedToggle.tsx</Code>) that
          flips <Code>User.showSeed</Code> via the{" "}
          <Code>setShowSeed()</Code> server action. When disabled, every
          service method appends <Code>seed: false</Code> to its where-clause,
          so seeded rows are filtered out of every page —{" "}
          <em>dashboards, lists, detail pages, and aggregates alike</em>.
        </Prose>
        <CodeBlock>{`// src/actions/preferences.ts
export async function setShowSeed(showSeed: boolean) {
  const { userId } = await requireUserContext();
  if (showSeed) {
    // First-time enable seeds the demo dataset; subsequent toggles just flip the flag.
    const user = await db.user.findUniqueOrThrow({
      where: { id: userId },
      select: { seededAt: true },
    });
    if (!user.seededAt) {
      await seedUserData(db, userId);
      await db.user.update({
        where: { id: userId },
        data: { showSeed: true, seededAt: new Date() },
      });
    } else {
      await db.user.update({ where: { id: userId }, data: { showSeed: true } });
    }
  } else {
    await db.user.update({ where: { id: userId }, data: { showSeed: false } });
  }
  revalidatePath("/dashboard");
  revalidatePath("/bills");
  revalidatePath("/vendors");
}`}</CodeBlock>

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
│   │   └── login/page.tsx    Sign in / sign up
│   ├── (app)/        Authenticated surfaces — AppShell + auth guard
│   │   ├── layout.tsx        Calls auth() → redirect("/login") if unauthed
│   │   ├── dashboard/        Live stats + "Show demo data" toggle
│   │   ├── bills/            Bills inbox + create + detail
│   │   ├── vendors/          Vendor directory + create + edit + detail
│   │   └── docs/             This documentation
│   ├── layout.tsx    Root: html/body + Geist font (no AppShell)
│   └── api/
│       ├── auth/     NextAuth route handler
│       └── docs/     Machine-readable JSON documentation
├── actions/          Server Actions ("use server") — mutations only
│   ├── bills.ts      Bill lifecycle
│   ├── vendors.ts    Vendor CRUD
│   ├── auth.ts       signInWithGoogle, signOutAction
│   └── preferences.ts setShowSeed (one-shot seeds on first enable)
├── server/
│   ├── auth.ts       NextAuth config
│   ├── db.ts         Prisma singleton
│   ├── get-user.ts   requireUserContext() — { userId, showSeed }
│   ├── container.ts  Per-request service factory: getServices()
│   ├── seed-user.ts  Per-user demo seeding (seed: true on every row)
│   └── services/     Business logic classes — all user-scoped
├── components/
│   ├── ui/           Primitive components (Button, Card, Switch, …)
│   ├── layout/       AppShell, Sidebar (with UserMenu + sign out)
│   ├── dashboard/    ShowSeedToggle
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
              "Server Components",
              "Pages are async RSCs that call services directly — no API round-trips",
            ],
            [
              "Server Actions",
              "All mutations live in src/actions/, return ActionResult<T>",
            ],
            [
              "Per-request DI",
              "getServices() returns user-scoped service instances; every query filters by userId",
            ],
            [
              "Seed flag",
              "Every domain row carries a seed:Boolean. Services append seed:false unless User.showSeed is on",
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

        <SubHeading>Bill</SubHeading>
        <Prose>Central entity. One bill per vendor invoice.</Prose>
        <Table
          headers={["Field", "Type", "Notes"]}
          rows={[
            ["id", "String (cuid)", "Primary key"],
            ["userId", "String", "FK → User (workspace owner, cascade delete)"],
            ["seed", "Boolean", "true for demo rows; hidden unless User.showSeed = true"],
            ["vendorId", "String", "FK → Vendor"],
            ["invoiceNumber", "String?", "Vendor's invoice reference"],
            ["invoiceDate", "DateTime?", ""],
            ["dueDate", "DateTime?", "Used for overdue calculation"],
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
            ["seed", "Boolean", "Inherits from parent bill at seed time"],
            ["description", "String", ""],
            ["quantity", "Decimal", ""],
            ["unitPrice", "Decimal", ""],
            ["amount", "Decimal", "quantity × unitPrice"],
            ["glAccountId", "String?", "FK → GLAccount"],
          ]}
        />

        <SubHeading>Vendor</SubHeading>
        <Table
          headers={["Field", "Type", "Notes"]}
          rows={[
            ["id", "String (cuid)", ""],
            ["userId", "String", "FK → User (cascade delete)"],
            ["seed", "Boolean", "true for demo rows"],
            ["name", "String", "Indexed"],
            ["email / phone / website", "String?", ""],
            ["address.*", "String?", "line1, line2, city, state, zip, country"],
            ["bankName / bankRoutingNumber / bankAccountNumber", "String?", ""],
            ["taxId", "String?", ""],
            ["defaultPaymentMethod", "PaymentMethod?", ""],
            ["status", "VendorStatus", "ACTIVE · INACTIVE"],
          ]}
        />

        <SubHeading>GLAccount</SubHeading>
        <Table
          headers={["Field", "Type", "Notes"]}
          rows={[
            ["id", "String (cuid)", ""],
            ["userId", "String", "FK → User (cascade delete)"],
            ["seed", "Boolean", "true for demo rows"],
            ["code", "String", "Unique per user (@@unique([userId, code]))"],
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
            ["seed", "Boolean", "Inherits from parent bill at seed time"],
            ["amount", "Decimal", ""],
            ["method", "PaymentMethod", "ACH · CHECK · WIRE"],
            ["status", "PaymentStatus", "PENDING · PROCESSING · COMPLETED · FAILED"],
            ["reference", "String?", ""],
            ["scheduledDate", "DateTime?", ""],
            ["processedDate", "DateTime?", ""],
          ]}
        />

        <SubHeading>User</SubHeading>
        <Prose>
          Workspace owner. NextAuth PrismaAdapter creates one row per Google
          account on first sign-in. New workspaces start empty;{" "}
          <Code>seedUserData()</Code> only runs when the user first turns on
          &quot;Show demo data&quot;.
        </Prose>
        <Table
          headers={["Field", "Type", "Notes"]}
          rows={[
            ["id", "String (cuid)", "Primary key"],
            ["name / email / image", "String?", "From Google profile"],
            ["showSeed", "Boolean", "When false (default), services filter out seed:true rows"],
            ["seededAt", "DateTime?", "Stamped on first showSeed=true; gates one-shot seeding"],
            ["accounts / sessions", "[]", "NextAuth"],
            ["vendors / bills / glAccounts", "[]", "Cascade-delete on user delete"],
          ]}
        />

        <SubHeading>NextAuth models</SubHeading>
        <Prose>
          <Code>Account</Code>, <Code>Session</Code>, and{" "}
          <Code>VerificationToken</Code> are standard NextAuth Prisma adapter
          models. The PrismaAdapter manages them — no application code
          touches them directly.
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
              { label: "PENDING APPROVAL", color: "bg-amber-100 text-amber-700" },
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
            <span className="text-[0.7rem] text-slate-400 w-full">
              From PENDING APPROVAL:
            </span>
            <span className="text-slate-400 ml-2">↳</span>
            <StatusPill label="REJECTED" color="bg-red-100 text-red-700" />
            <span className="text-xs text-slate-400">(can be resubmitted)</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-[0.7rem] text-slate-400 w-full">
              From any non-PAID status:
            </span>
            <span className="text-slate-400 ml-2">↳</span>
            <StatusPill label="VOID" color="bg-slate-200 text-slate-600" />
          </div>
        </div>

        <Table
          headers={["Transition", "From", "To", "Action"]}
          rows={[
            ["Submit", "DRAFT", "PENDING_APPROVAL", "submitBill()"],
            ["Approve", "PENDING_APPROVAL", "APPROVED", "approveBill()"],
            ["Reject", "PENDING_APPROVAL", "REJECTED", "rejectBill(id, reason)"],
            ["Schedule", "APPROVED", "SCHEDULED", "schedulePayment()"],
            ["Mark paid", "SCHEDULED", "PAID", "markPaid()"],
            ["Void", "Any except PAID", "VOID", "voidBill()"],
          ]}
        />

        {/* ── Routes ── */}
        <SectionHeading id="routes">Routes &amp; Pages</SectionHeading>
        <Prose>
          All pages are React Server Components. They fetch data directly via
          service singletons and render on the server. Interactive sections are
          extracted into <Code>&quot;use client&quot;</Code> components.
        </Prose>
        <Table
          headers={["Route", "Group", "File", "Purpose"]}
          rows={[
            ["/", "(marketing)", "app/(marketing)/page.tsx", "Landing page. Redirects to /dashboard when signed in."],
            ["/login", "(marketing)", "app/(marketing)/login/page.tsx", "Sign-in / sign-up via Google."],
            ["/dashboard", "(app)", "app/(app)/dashboard/page.tsx", "Live stats + recent bills + Show-demo-data toggle"],
            ["/bills", "(app)", "app/(app)/bills/page.tsx", "Bills inbox with status filter + search"],
            ["/bills/new", "(app)", "app/(app)/bills/new/page.tsx", "Create bill with line items"],
            ["/bills/[id]", "(app)", "app/(app)/bills/[id]/page.tsx", "Bill detail + state-machine actions"],
            ["/vendors", "(app)", "app/(app)/vendors/page.tsx", "Vendor directory with search"],
            ["/vendors/new", "(app)", "app/(app)/vendors/new/page.tsx", "Create vendor"],
            ["/vendors/[id]", "(app)", "app/(app)/vendors/[id]/page.tsx", "Vendor detail + bill history"],
            ["/vendors/[id]/edit", "(app)", "app/(app)/vendors/[id]/edit/page.tsx", "Edit vendor"],
            ["/docs", "(app)", "app/(app)/docs/page.tsx", "This page"],
            ["/api/auth/[...nextauth]", "—", "app/api/auth/[...nextauth]/route.ts", "NextAuth handler (signin, callback, signout, session)"],
            ["/api/docs", "—", "app/api/docs/route.ts", "Machine-readable JSON documentation"],
          ]}
        />

        {/* ── Server Actions ── */}
        <SectionHeading id="server-actions">Server Actions</SectionHeading>
        <Prose>
          Defined in <Code>src/actions/</Code> with the <Code>&quot;use server&quot;</Code>{" "}
          directive. All validate input with Zod, call the appropriate service
          method, and call <Code>revalidatePath()</Code> to invalidate RSC cache.
        </Prose>

        <SubHeading>Bills — src/actions/bills.ts</SubHeading>
        <Table
          headers={["Function", "Input", "Returns"]}
          rows={[
            ["createBill()", "FormData (vendor, dates, lineItems, paymentMethod)", "ActionResult<{ id: string }>"],
            ["submitBill()", "FormData { id }", "ActionResult"],
            ["approveBill()", "FormData { id }", "ActionResult"],
            ["rejectBill()", "FormData { id, reason }", "ActionResult"],
            ["schedulePayment()", "FormData { id, scheduledDate, method, reference? }", "ActionResult"],
            ["markPaid()", "FormData { id }", "ActionResult"],
            ["voidBill()", "FormData { id }", "ActionResult"],
          ]}
        />

        <SubHeading>Vendors — src/actions/vendors.ts</SubHeading>
        <Table
          headers={["Function", "Input", "Returns"]}
          rows={[
            ["createVendor()", "FormData (name, email?, phone?, address, bank, taxId, …)", "ActionResult<{ id: string }>"],
            ["updateVendor()", "FormData { id, …partial vendor fields }", "ActionResult"],
            ["deactivateVendor()", "FormData { id }", "ActionResult"],
          ]}
        />

        <SubHeading>Auth — src/actions/auth.ts</SubHeading>
        <Table
          headers={["Function", "Behavior"]}
          rows={[
            ["signInWithGoogle()", "Calls NextAuth signIn('google'); redirects to /dashboard on success"],
            ["signOutAction()", "Calls NextAuth signOut(); redirects to / (landing)"],
          ]}
        />

        <SubHeading>Preferences — src/actions/preferences.ts</SubHeading>
        <Table
          headers={["Function", "Input", "Returns"]}
          rows={[
            ["setShowSeed(showSeed)", "boolean", "ActionResult<{ showSeed }>; updates User.showSeed and seeds the demo dataset on first enable; revalidates /dashboard, /bills, /vendors"],
          ]}
        />

        {/* ── Services ── */}
        <SectionHeading id="services">Service Layer</SectionHeading>
        <Prose>
          Services encapsulate all business logic and database access. Each
          service takes the Prisma client and a <Code>UserContext</Code> (
          <Code>userId</Code> + <Code>showSeed</Code>) in its constructor and
          appends both filters to every query. Instances are returned by{" "}
          <Code>getServices()</Code> in <Code>src/server/container.ts</Code> —
          a per-request factory consumed by both pages (RSC reads) and
          actions (mutations).
        </Prose>
        <CodeBlock>{`// In any RSC or server action
const { billService, vendorService, glAccountService, ctx } =
  await getServices();
// Throws/redirects to /login if unauthenticated.
// All subsequent service calls are scoped to ctx.userId.`}</CodeBlock>

        <SubHeading>BillService</SubHeading>
        <Table
          headers={["Method", "Description"]}
          rows={[
            ["list(filters?)", "Filter by status[], search string, sort"],
            ["getById(id)", "Includes vendor, lineItems.glAccount, payments"],
            ["create(data)", "Creates bill in DRAFT with nested line items"],
            ["update(id, data)", "Only allowed in DRAFT status"],
            ["submit / approve / reject / schedulePayment / markPaid / void", "State transitions with pre-condition validation"],
            ["getDashboardStats()", "Aggregates: totalPayable, overdue count/amount, dueSoon, paidThisMonth"],
            ["getRecentBills(limit)", "Last N bills by createdAt desc"],
          ]}
        />

        <SubHeading>VendorService</SubHeading>
        <Table
          headers={["Method", "Description"]}
          rows={[
            ["list(filters?)", "Search by name/email; includes _count.bills and totalPaid aggregate"],
            ["getById(id)", "Includes bills"],
            ["create(data)", ""],
            ["update(id, data)", "Partial updates"],
            ["deactivate(id)", "Sets status → INACTIVE"],
          ]}
        />

        <SubHeading>GLAccountService</SubHeading>
        <Table
          headers={["Method", "Description"]}
          rows={[["list()", "All GL accounts ordered by type then code"]]}
        />

        {/* ── Environment ── */}
        <SectionHeading id="environment">Environment</SectionHeading>
        <Prose>
          Variables are validated at startup via <Code>src/env.js</Code> (t3-env
          pattern). Missing required variables throw at build time. Google
          OAuth credentials are mandatory now that authentication is required
          for the workspace.
        </Prose>
        <Table
          headers={["Variable", "Required", "Purpose"]}
          rows={[
            ["DATABASE_URL", "Yes", "PostgreSQL connection string (pooled)"],
            ["DIRECT_URL", "Yes", "Direct DB URL for Prisma migrations"],
            ["AUTH_SECRET", "Production only", "NextAuth secret for JWT signing"],
            ["AUTH_GOOGLE_ID", "Yes", "Google OAuth client ID"],
            ["AUTH_GOOGLE_SECRET", "Yes", "Google OAuth client secret"],
            ["NODE_ENV", "Yes", "development · test · production"],
          ]}
        />

        {/* ── Machine API ── */}
        <SectionHeading id="machine-api">Machine API</SectionHeading>
        <Prose>
          A structured JSON representation of this documentation is available
          at <Code>/api/docs</Code>. It is designed for AI agents and automated
          tooling that need to understand the application&apos;s capabilities
          without parsing HTML.
        </Prose>
        <CodeBlock>{`GET /api/docs
Content-Type: application/json

{
  "version": "1.0.0",
  "name": "Payables AP",
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
          current state of the application schema; no runtime data is included.
        </Prose>

        {/* Footer */}
        <div className="mt-16 flex items-center justify-between border-t border-slate-100 pt-8 text-xs text-slate-400">
          <span>Payables AP · Technical Reference</span>
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
  );
}
