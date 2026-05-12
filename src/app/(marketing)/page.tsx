export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user?.id) redirect("/dashboard");

  return (
    <main className="relative overflow-hidden bg-white">
      {/* Decorative background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl"
      >
        <div
          className="relative left-1/2 aspect-[1155/678] w-[60rem] -translate-x-1/2 rotate-[20deg] bg-gradient-to-tr from-[#312D97] to-[#10A6CC] opacity-25"
          style={{
            clipPath:
              "polygon(74% 44%, 100% 61%, 97% 26%, 85% 0%, 80% 2%, 72% 32%, 60% 62%, 52% 68%, 47% 58%, 45% 34%, 27% 76%, 0% 64%, 17% 100%, 27% 76%, 76% 97%, 74% 44%)",
          }}
        />
      </div>

      {/* Top bar */}
      <header className="relative z-10">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#312D97] shadow-lg shadow-[#312D97]/30">
              <svg
                className="h-5 w-5 text-white"
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
            <span className="text-lg font-bold tracking-tight text-[#1a174f]">
              Payabill
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <a
              href="#features"
              className="hidden text-sm font-medium text-slate-600 hover:text-[#312D97] sm:block"
            >
              Features
            </a>
            <a
              href="#workflow"
              className="hidden text-sm font-medium text-slate-600 hover:text-[#312D97] sm:block"
            >
              Workflow
            </a>
            <Link
              href="/docs"
              className="hidden text-sm font-medium text-slate-600 hover:text-[#312D97] sm:block"
            >
              Docs
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-[#312D97] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#312D97]/30 transition-all hover:-translate-y-0.5 hover:bg-[#1d175a]"
            >
              Sign in
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-12 pb-20 lg:px-8 lg:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="bg-brand-50 mb-6 inline-flex items-center gap-2 rounded-full border border-[#ecebff] px-4 py-1.5 text-xs font-semibold text-[#312D97]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#10A6CC]" />
            Accounts payable, on autopilot
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[#1a174f] sm:text-6xl">
            Pay every vendor on time,{" "}
            <span className="bg-gradient-to-r from-[#312D97] to-[#10A6CC] bg-clip-text text-transparent">
              with zero spreadsheets.
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Payabill is the modern AP workflow for small and mid-market finance
            teams. Collect invoices, route approvals, and schedule payments —
            all from one calm, fast workspace.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-[#312D97] px-7 py-3 text-base font-semibold text-white shadow-xl shadow-[#312D97]/30 transition-all hover:-translate-y-0.5 hover:bg-[#1d175a]"
            >
              Get started — it&apos;s free
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <a
              href="#features"
              className="text-base font-semibold text-[#1a174f] hover:text-[#312D97]"
            >
              See features →
            </a>
          </div>
          <p className="mt-5 text-xs text-slate-400">
            Sign up with Google or email. New workspaces are fully empty until
            you create your first vendor and bill.
          </p>
        </div>

        {/* Hero "screenshot" mock */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="to-brand-50 rounded-3xl border border-[#ecebff] bg-gradient-to-b from-white p-3 shadow-2xl shadow-[#312D97]/10">
            <div className="overflow-hidden rounded-2xl border border-[#ecebff] bg-white">
              <div className="bg-brand-50 flex items-center justify-between border-b border-[#ecebff] px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                </div>
                <span className="font-mono text-xs text-slate-400">
                  payabill.app/dashboard
                </span>
                <span className="w-12" />
              </div>
              <div className="grid grid-cols-2 gap-3 px-4 py-4 sm:grid-cols-4 sm:gap-4 sm:px-6 sm:py-6">
                {[
                  {
                    label: "Outstanding",
                    value: "$48,210",
                    tone: "text-[#1a174f]",
                  },
                  {
                    label: "Due this week",
                    value: "$21,750",
                    tone: "text-amber-600",
                  },
                  { label: "Overdue", value: "$0", tone: "text-emerald-600" },
                  {
                    label: "Paid this month",
                    value: "$31,074",
                    tone: "text-emerald-700",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-[#ecebff] bg-white px-3 py-3 shadow-sm sm:px-4 sm:py-4"
                  >
                    <p className="text-[0.65rem] font-medium tracking-wide text-slate-400 uppercase sm:text-[0.7rem]">
                      {s.label}
                    </p>
                    <p
                      className={`mt-1 text-lg font-bold sm:text-xl ${s.tone}`}
                    >
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-4 sm:px-6 sm:pb-6">
                <div className="overflow-hidden rounded-2xl border border-[#ecebff]">
                  <div className="bg-brand-50 hidden grid-cols-[2fr_1fr_1fr_1fr] gap-4 border-b border-[#ecebff] px-5 py-2.5 text-[0.65rem] font-semibold tracking-wider text-slate-500 uppercase sm:grid">
                    <span>Vendor</span>
                    <span>Due</span>
                    <span className="text-right">Amount</span>
                    <span>Status</span>
                  </div>
                  {[
                    {
                      name: "WeWork Companies LLC",
                      due: "in 3d",
                      amt: "$20,750.00",
                      status: "Scheduled",
                      color: "bg-purple-100 text-purple-700",
                    },
                    {
                      name: "Amazon Web Services",
                      due: "in 7d",
                      amt: "$4,930.00",
                      status: "Approved",
                      color: "bg-indigo-100 text-indigo-700",
                    },
                    {
                      name: "Stripe, Inc.",
                      due: "in 12d",
                      amt: "$2,810.00",
                      status: "Pending",
                      color: "bg-amber-100 text-amber-700",
                    },
                  ].map((b) => (
                    <div
                      key={b.name}
                      className="flex items-center justify-between gap-3 border-b border-[#ecebff] px-3 py-3 last:border-0 sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr] sm:gap-4 sm:px-5 sm:text-sm"
                    >
                      <div className="min-w-0 flex-1 sm:flex-none">
                        <p className="truncate text-sm font-medium text-[#1a174f]">
                          {b.name}
                        </p>
                        <p className="mt-0.5 text-[0.7rem] text-slate-500 sm:hidden">
                          Due {b.due}
                        </p>
                      </div>
                      <span className="hidden text-slate-500 sm:inline">
                        Due {b.due}
                      </span>
                      <span className="text-right text-sm font-medium whitespace-nowrap text-slate-900">
                        {b.amt}
                      </span>
                      <span className="hidden sm:inline">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${b.color}`}
                        >
                          {b.status}
                        </span>
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold whitespace-nowrap sm:hidden ${b.color}`}
                      >
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-brand-50/50 relative z-10 py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-xs font-semibold tracking-widest text-[#312D97] uppercase">
              Everything you need
            </h2>
            <p className="mt-3 text-3xl font-bold tracking-tight text-[#1a174f] sm:text-4xl">
              An AP workspace that actually fits how you work
            </p>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Centralise vendors, track every invoice, enforce approval policy,
              and schedule payments — without bolting together five tools.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Bills inbox",
                body: "One inbox for every invoice. Filter by status, search across vendors and invoice numbers, and never lose a bill again.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                ),
              },
              {
                title: "Vendor directory",
                body: "Store contact details, payment preferences, bank info, and 1099 tax IDs in one place — with a full payment history per vendor.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                ),
              },
              {
                title: "Approval workflow",
                body: "Draft → Pending → Approved → Scheduled → Paid. A clean state machine with full audit trails on every transition.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                ),
              },
              {
                title: "Payment scheduling",
                body: "Schedule ACH, wire, or check payments ahead of due dates. Every payment is tracked with reference numbers and processed dates.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                ),
              },
              {
                title: "Live dashboard",
                body: "Real-time totals for outstanding, due soon, overdue, and paid-this-month — so you always know what's coming.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                ),
              },
              {
                title: "Roles built in",
                body: "Staff submit bills (including to brand-new vendors). Managers approve, schedule, and invite teammates. Everyone sees only what they should.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-5.13a4 4 0 11-8 0 4 4 0 018 0zm6 0a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                ),
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-[#ecebff] bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#312D97]/10"
              >
                <div className="bg-brand-50 flex h-11 w-11 items-center justify-center rounded-xl text-[#312D97] transition-colors group-hover:bg-[#312D97] group-hover:text-white">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {f.icon}
                  </svg>
                </div>
                <h3 className="mt-5 text-base font-semibold text-[#1a174f]">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="relative z-10 py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-xs font-semibold tracking-widest text-[#312D97] uppercase">
              How it works
            </h2>
            <p className="mt-3 text-3xl font-bold tracking-tight text-[#1a174f] sm:text-4xl">
              From invoice received to vendor paid — in four steps
            </p>
          </div>

          <ol className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: "01",
                title: "Capture",
                body: "Add bills with vendor, line items, GL accounts, and due dates.",
              },
              {
                n: "02",
                title: "Approve",
                body: "Submit for review. Reject with a reason, or move to approved.",
              },
              {
                n: "03",
                title: "Schedule",
                body: "Pick a payment date and method — ACH, wire, or check.",
              },
              {
                n: "04",
                title: "Pay",
                body: "Mark as paid when funds clear. Full audit trail saved.",
              },
            ].map((s) => (
              <li
                key={s.n}
                className="relative rounded-2xl border border-[#ecebff] bg-white p-6 shadow-sm"
              >
                <span className="font-mono text-xs font-bold text-[#10A6CC]">
                  {s.n}
                </span>
                <h3 className="mt-2 text-base font-semibold text-[#1a174f]">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#312D97] to-[#1d175a] px-8 py-16 text-center shadow-2xl shadow-[#312D97]/30 sm:px-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 0%, #10A6CC 0%, transparent 50%), radial-gradient(circle at 80% 100%, #ffffff 0%, transparent 50%)",
              }}
            />
            <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to take the chaos out of AP?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-base leading-7 text-white/80">
              Sign in with Google and you&apos;ll land in a fully-loaded
              workspace in under five seconds. No setup, no credit card.
            </p>
            <div className="relative mt-8 flex items-center justify-center">
              <Link
                href="/login"
                className="hover:bg-brand-50 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-base font-semibold text-[#312D97] shadow-xl transition-all hover:-translate-y-0.5"
              >
                Continue with Google
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#ecebff] py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 sm:flex-row lg:px-8">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Payabill. A demo AP product.
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/login" className="hover:text-[#312D97]">
              Sign in
            </Link>
            <Link href="/docs" className="hover:text-[#312D97]">
              Docs
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
