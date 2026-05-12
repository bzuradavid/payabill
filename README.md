# Payabill

A modern accounts payable product inspired by Ramp Bill Pay. Built with Next.js 15, Prisma, NextAuth v5, and Tailwind CSS.

**Live demo:** [payabill.vercel.app](https://payabill.vercel.app) — sign in with `manager@payabill.com` / `pass1234` to explore the full workflow.

---

## What This Product Does

Finance teams lose hours every week chasing paper invoices, hunting down approvers over Slack, and reconciling spreadsheets to figure out what's actually been paid. Payabill replaces that with a structured workflow: every bill is tracked from the moment it arrives, routed to the right approver, and closed out with a timestamped payment record.

The concrete payoff for finance teams:
- **Visibility** — one view shows every outstanding payable, its status, and whether it's overdue — no spreadsheet digging
- **Control** — bills cannot be paid without manager approval; rejections require a reason that feeds back to the submitter
- **Auditability** — every state transition (submission → approval → payment) is recorded with who did it and when
- **Accountability** — staff see only their own bills; managers see everything across the workspace

Payabill is a multi-tenant workflow engine for managing vendor invoices through their full lifecycle — from receipt to payment.

The product has four primary surfaces:

- **Bills inbox** — a triage view of all outstanding invoices, filterable by status, with overdue bills visually surfaced
- **Vendor directory** — a record of suppliers with their contact info, bank details, and payment history
- **Dashboard** — a role-differentiated view of cash position (managers see org-wide totals; staff see their own submitted bills)
- **Staff management** — manager-only page to invite teammates and manage who can submit bills in the workspace

---

## Workflows Prioritized

### 1. Bill creation

Create a bill by selecting a vendor, entering invoice metadata (number, dates, payment method), and adding line items with GL coding. Bills start as **Draft** and can be saved or immediately submitted.

### 2. Approval workflow

Submitted bills enter **Pending Approval**. A manager can:

- **Approve** — moves to Approved, ready to schedule payment
- **Reject** — moves to Rejected with a required reason surfaced back to the submitter

### 3. Payment scheduling and execution

Approved bills can be **scheduled** for a specific payment date (creating a Payment record with PENDING status), then **marked paid** to close the loop (completing the payment and recording `paidAt`).

### 4. Bill status machine

```
DRAFT → PENDING_APPROVAL → APPROVED → SCHEDULED → PAID
                        ↘ REJECTED
         (any non-PAID state) → VOID
```

### 5. Role-based access

- **Manager** — approves/rejects bills, schedules payments, invites staff, sees all bills in the workspace
- **Staff** — creates and submits bills (including to new vendors), sees only their own bills

---

## What Was Left Out (and Why)

| Feature                                 | Reason                                                                                                  |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Real ACH/wire execution                 | Requires banking infrastructure (Stripe Treasury, Plaid); payment scheduling is the right MVP boundary  |
| OCR / invoice parsing                   | Useful but product-agnostic; doesn't test AP-specific thinking                                          |
| ERP integrations (QuickBooks, NetSuite) | Integration layer belongs after core product is proven                                                  |
| Recurring bills                         | Adds scheduling complexity; correct v2 feature                                                          |
| Multi-entity / multi-company            | Each workspace is already a single org; cross-org use cases are v2                                      |
| 1099 tracking                           | Separate tax compliance concern                                                                          |
| Multi-level approval chains             | Single-step approval covers the core workflow; routing rules are v2                                      |
| Email notifications                     | Invitations are link-based only; email delivery not wired up                                            |

---

## Setup Instructions

### Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 14+ (see options below)
- Google OAuth credentials (for Google sign-in — credentials login still works without it)

---

### Database setup (Docker)

Spin up a PostgreSQL container with one command:

```bash
docker run -d \
  --name payabill-db \
  -e POSTGRES_USER=payabill \
  -e POSTGRES_PASSWORD=payabill \
  -e POSTGRES_DB=payabill \
  -p 5432:5432 \
  postgres:16
```

Your connection string will be:

```
postgresql://payabill:payabill@localhost:5432/payabill
```

To stop and start the container later:

```bash
docker stop payabill-db
docker start payabill-db
```

To reset the database entirely:

```bash
docker rm -f payabill-db
# then re-run the docker run command above
```

---

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values. If you used the Docker command above, you can paste these in directly:

```
# PostgreSQL — use the same URL for both in local dev
DATABASE_URL="postgresql://payabill:payabill@localhost:5432/payabill"
DIRECT_URL="postgresql://payabill:payabill@localhost:5432/payabill"

# NextAuth — generate a secret with: npx auth secret
AUTH_SECRET="<paste generated secret here>"

# Google OAuth (optional for local dev — credentials login works without it)
# Create at https://console.cloud.google.com/apis/credentials
# Set redirect URI to: http://localhost:3000/api/auth/callback/google
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
```

> **`DIRECT_URL`** is required by Prisma when using a connection pooler (e.g. PgBouncer in production). In local dev, set it to the same value as `DATABASE_URL`.

### 3. Apply schema

Push the Prisma schema to your new database (creates all tables):

```bash
npm run db:push
```

### 4. Seed demo data

```bash
npm run db:seed
```

This creates a **"Payable Demo Co"** organization with two pre-seeded accounts:

| Email | Password | Role |
|---|---|---|
| `manager@payabill.com` | `pass1234` | Manager |
| `staff@payabill.com` | `pass1234` | Staff |

The seed also creates 6 vendors (Stripe, AWS, Notion, WeWork, Gusto, HubSpot), 8 GL accounts, and ~19 bills spanning all statuses with realistic amounts and dates split between the two users.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with the credentials above to explore the full app, or use Google sign-in to create a fresh empty workspace.

> **Tip:** Sign in as manager first to see the full dashboard, staff management, and approval workflow. Then open a private/incognito window and sign in as staff to see the role-restricted view.

---

## Testing

The test suite covers all service-layer business logic using Vitest. Tests are pure unit tests — no database connection required.

### Run the tests

```bash
# One-shot run
npm test

# Interactive watch mode
npm run test:watch
```

### Test suites

| File | Tests | What it covers |
|---|---|---|
| `src/server/services/__tests__/BillService.test.ts` | 42 | Bill state machine (all 7 transitions), role guards (manager vs staff), org scoping, `getDashboardStats` with deterministic date logic |
| `src/server/services/__tests__/VendorService.test.ts` | 16 | CRUD role guards, `createInline` staff access, org scoping on all queries, `totalPaid` aggregation |
| `src/server/services/__tests__/StaffService.test.ts` | 21 | Invite validation (email format, existing member, cross-org), email normalisation, invitation org-scope, `removeStaff` guards |
| `src/server/__tests__/assign-org.test.ts` | 8 | Org assignment on first sign-in: new org creation, invitation matching, duplicate-join prevention |

### Test infrastructure

- **`src/test/helpers.ts`** — `makeMockDb()` factory (Prisma mock with full `vi.fn()` delegates), `managerCtx` / `staffCtx` fixtures, and data builders (`makeBill`, `makeVendor`, `makeLineItem`, `makePayment`)
- **`src/test/setup.ts`** — global stubs for Next.js-only packages (`server-only`, `next/navigation`, `~/server/auth`, `~/server/db`) that can't run in a bare Node environment

Services accept `(db, ctx)` via constructor injection, so tests pass a mocked DB directly — no real PostgreSQL instance, no migrations, no seed data needed.

---

## Key Architecture Decisions

### Authentication — NextAuth v5 with Google + Credentials

Sign-in supports Google OAuth (for real workspaces) and email/password credentials (for the seeded demo accounts). The `/login` page handles both. On first Google sign-in, `NextAuth.events.createUser` fires `assignUserToOrganization()`, which either:
- Creates a new **Organization** for the user as a **Manager**, or
- Joins an existing org as **Staff** if a pending invitation matches the email.

### Multi-tenant Organization Model

All domain data belongs to an `Organization`, not directly to a `User`. A user belongs to exactly one organization and has a role (`MANAGER` or `STAFF`). This is the authorization boundary — services scope every query by `organizationId`, and the bill service additionally filters by `createdById` for STAFF users.

### Server Actions + RSC (no tRPC)

Reads happen directly in RSC (no round-trip), mutations are `"use server"` functions that call services and call `revalidatePath` to bust the RSC cache.

### Service Layer with Manual DI

Business logic lives in plain classes rather than route handlers. `container.ts` wires them together with constructor injection — each service takes `(db, ctx: UserContext)` and scopes every query to the user's org. Makes the logic testable in isolation.

```
src/server/
  services/
    BillService.ts       ← AP state machine + org/role scoping
    VendorService.ts     ← vendor CRUD + aggregates
    GLAccountService.ts  ← read-only chart of accounts
    StaffService.ts      ← invite, list, and remove org members
  container.ts           ← wires services, exports getServices()
  auth.ts                ← NextAuth config
  get-user.ts            ← requireUserContext(), requireManagerContext()
  assign-org.ts          ← org assignment on first sign-in
  seed-user.ts           ← org-level demo data seeding
  db.ts                  ← Prisma singleton
```

### Data Model

```
Organization    — workspace; owns all domain data
User            — workspace member with role (MANAGER | STAFF)
Invitation      — pending invite by email; consumed on first sign-in
Vendor          — supplier with bank details, default payment method
GLAccount       — chart of accounts (expense categories)
Bill            — AP invoice: vendor + dates + status + createdBy user
BillLineItem    — line items with quantity/price/GL code (cascade delete)
Payment         — payment record: scheduled date, method, status, reference
```

The `Bill` model is the center of the product. All workflow transitions are mutations on `Bill.status` with corresponding timestamp fields (`submittedAt`, `approvedAt`, `paidAt`). Bills also carry `createdById` so staff see only their own work.

### Route Groups

The app is split into two route groups:

| Group | Auth | Routes |
|---|---|---|
| `(marketing)` | Public | `/` (landing), `/login`, `/docs` |
| `(app)` | Required | `/dashboard`, `/bills/*`, `/vendors/*`, `/staff` |

The `(app)/layout.tsx` calls `auth()` and redirects unauthenticated users to `/login`. The `/staff` route additionally requires the MANAGER role.

---

## Project Structure

```
src/
  app/
    (marketing)/
      page.tsx            ← Landing page
      login/page.tsx      ← Sign in (Google + credentials)
      docs/page.tsx       ← Technical documentation (public)
    (app)/
      layout.tsx          ← Auth gate → redirect /login if unauthed
      dashboard/
        page.tsx          ← Role-split: ManagerDashboard | StaffDashboard
        ManagerDashboard.tsx
        StaffDashboard.tsx
      bills/
        page.tsx          ← Bills inbox (RSC + client filter bar)
        BillsFilterBar.tsx
        new/
          page.tsx        ← Create bill (RSC data fetch)
          NewBillForm.tsx ← Client form with line items
        [id]/
          page.tsx        ← Bill detail (RSC)
          BillActions.tsx ← Client workflow action buttons + modals
      vendors/
        page.tsx          ← Vendor list (RSC)
        VendorForm.tsx    ← Shared create/edit form (client)
        new/page.tsx
        [id]/page.tsx
        [id]/edit/page.tsx
      staff/
        page.tsx          ← Manager-only: invite + list members
        InviteStaffForm.tsx
        StaffMembersTable.tsx
        PendingInvitationsTable.tsx
    api/
      auth/[...nextauth]/ ← NextAuth handler
      docs/route.ts       ← Machine-readable JSON documentation
  actions/
    bills.ts              ← Server actions: create, submit, approve, reject, etc.
    vendors.ts            ← Server actions: create, update, deactivate
    auth.ts               ← signInWithGoogle, signOutAction
    staff.ts              ← inviteStaff, revokeInvitation, removeStaff
  server/
    services/             ← Business logic (org-scoped)
    container.ts          ← DI wiring
    auth.ts               ← NextAuth configuration
    get-user.ts           ← requireUserContext(), requireManagerContext()
    assign-org.ts         ← Org assignment on sign-up
    seed-user.ts          ← Demo data seeding
    db.ts                 ← Prisma singleton
  components/
    auth/                 ← CredentialsForm, GoogleSignInButton
    layout/               ← Sidebar, AppShell
    ui/                   ← Badge, Button, Card, Input, Select, Modal, etc.
    bills/                ← BillStatusBadge, LineItemsEditor
    dashboard/            ← DashboardTour
  lib/
    utils.ts              ← cn, formatCurrency, formatDate, isOverdue
```
