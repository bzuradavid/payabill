# Payables

A modern accounts payable product inspired by Ramp Bill Pay. Built with Next.js 15, Prisma, and Tailwind CSS.

---

## What This Product Does

Payables is a workflow engine for managing vendor invoices through their full lifecycle — from receipt to payment. The core premise: finance teams need to track money they owe, route it through appropriate approval gates, and execute payment with a full audit trail.

The product has three primary surfaces:

- **Bills inbox** — a triage view of all outstanding invoices, filterable by status, with overdue bills visually surfaced
- **Vendor directory** — a record of suppliers with their contact info, bank details, and payment history
- **Dashboard** — a high-level view of cash position: total outstanding, what's overdue, what's due this week, and what's been paid this month

---

## Workflows Prioritized

### 1. Bill creation

Create a bill by selecting a vendor, entering invoice metadata (number, dates, payment method), and adding line items with GL coding. Bills start as **Draft** and can be saved or immediately submitted.

### 2. Approval workflow

Submitted bills enter **Pending Approval**. An approver can:

- **Approve** — moves to Approved, ready to schedule payment
- **Reject** — moves to Rejected with a required reason surfaced back to the submitter

### 3. Payment scheduling and execution

Approved bills can be **scheduled** for a specific payment date (creating a Payment record with PENDING status), then **marked paid** to close the loop (completing the payment and recording `paidAt`).

### 4. Bill status machine

```
DRAFT → PENDING_APPROVAL → APPROVED → SCHEDULED → PAID
                        ↘ REJECTED
         (any state) → VOID
```

---

## What Was Left Out (and Why)

| Feature                                 | Reason                                                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Real ACH/wire execution                 | Requires banking infrastructure (Stripe Treasury, Plaid); payment scheduling is the right MVP boundary |
| OCR / invoice parsing                   | Useful but product-agnostic; doesn't test AP-specific thinking                                         |
| ERP integrations (QuickBooks, NetSuite) | Integration layer belongs after core product is proven                                                 |
| Recurring bills                         | Adds scheduling complexity; correct v2 feature                                                         |
| Multi-entity / multi-company            | Fundamentally changes the data model; single-org is the right MVP scope                                |
| 1099 tracking                           | Separate tax compliance concern                                                                        |
| Multi-level approval chains             | Single-step approval covers the core workflow; routing rules are v2                                    |
| Authentication                          | Removed to reduce demo friction; all routes are unauthenticated                                        |

---

## Setup Instructions

### Prerequisites

- Node.js 20+
- PostgreSQL database
- npm 10+

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your `DATABASE_URL`:

```
DATABASE_URL="postgresql://user:password@localhost:5432/payabill"
```

### 3. Apply schema and generate client

```bash
npm run db:push
```

### 4. Seed demo data

```bash
npm run db:seed
```

This creates 6 vendors (Stripe, AWS, Notion, WeWork, Gusto, HubSpot), 8 GL accounts, and ~20 bills spanning all statuses with realistic amounts and dates.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Key Architecture Decisions

### Server Actions + RSC (no tRPC)

The original T3 scaffold used tRPC. We replaced it with Next.js 15 Server Actions and React Server Components — the native React 19 pattern for this stack. Reads happen directly in RSC (no round-trip), mutations are `"use server"` functions that call services and call `revalidatePath` to bust the RSC cache. This removes the client-side tRPC setup entirely and simplifies the mental model.

### Service Layer with Manual DI

Business logic lives in plain classes (`BillService`, `VendorService`, `GLAccountService`) rather than route handlers. A `container.ts` file wires them together with constructor injection — no decorator framework needed. This makes the logic testable in isolation (pass a mock `db` to the constructor) and keeps actions thin.

```
src/server/
  services/
    BillService.ts       ← all AP state machine logic
    VendorService.ts     ← vendor CRUD + aggregates
    GLAccountService.ts  ← read-only chart of accounts
  container.ts           ← wires services, exports singletons
  db.ts                  ← Prisma singleton
```

### Data Model

```
Vendor          — supplier with bank details, default payment method
GLAccount       — chart of accounts (expense categories)
Bill            — AP invoice: vendor + dates + status + payment method
BillLineItem    — line items with quantity/price/GL code (cascade delete)
Payment         — payment record: scheduled date, method, status, reference
```

The `Bill` model is the center of the product. All workflow transitions (submit, approve, reject, schedule, pay, void) are mutations on `Bill.status` with corresponding timestamp fields (`submittedAt`, `approvedAt`, `paidAt`). The `Payment` model records the actual payment intent — created when a bill is scheduled, updated to COMPLETED when marked paid.

### No Auth

The product runs without authentication. For a production system you'd gate the approval actions behind roles (AP Clerk, AP Manager), but for an MVP demo the friction of login adds no product signal.

---

## Project Structure

```
src/
  app/
    page.tsx              ← Dashboard (RSC)
    bills/
      page.tsx            ← Bills inbox (RSC + client filter bar)
      BillsFilterBar.tsx  ← Client component: tab + search
      new/
        page.tsx          ← Create bill (RSC data fetch)
        NewBillForm.tsx   ← Client form with line items
      [id]/
        page.tsx          ← Bill detail (RSC)
        BillActions.tsx   ← Client workflow action buttons + modals
    vendors/
      page.tsx            ← Vendor list (RSC)
      VendorForm.tsx      ← Shared create/edit form (client)
      new/page.tsx        ← Create vendor
      [id]/page.tsx       ← Vendor detail (RSC)
      [id]/edit/page.tsx  ← Edit vendor
  actions/
    bills.ts              ← Server actions: create, submit, approve, reject, etc.
    vendors.ts            ← Server actions: create, update, deactivate
  server/
    services/             ← Business logic
    container.ts          ← DI wiring
    db.ts                 ← Prisma singleton
  components/
    layout/               ← Sidebar, AppShell
    ui/                   ← Badge, Button, Card, Input, Select, Modal, etc.
    bills/                ← BillStatusBadge, LineItemsEditor
  lib/
    utils.ts              ← cn, formatCurrency, formatDate, isOverdue
```
