export const dynamic = "force-dynamic";

import { type Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { signInWithGoogle } from "~/actions/auth";

export const metadata: Metadata = {
  title: "Sign in — Payables",
  description: "Sign in or create your Payables workspace with Google.",
};

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.id) redirect("/dashboard");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-6">
      {/* Decorative background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div
          className="absolute -top-40 left-1/2 aspect-square w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-[#312D97]/15 to-[#10A6CC]/15 blur-3xl"
        />
      </div>

      <div className="w-full max-w-md">
        <Link href="/" className="mb-10 flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#312D97] shadow-lg shadow-[#312D97]/30">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-[#1a174f]">
            Payables
          </span>
        </Link>

        <div className="rounded-3xl border border-[#ecebff] bg-white p-8 shadow-2xl shadow-[#312D97]/10 sm:p-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-[#1a174f]">
              Welcome
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sign in or create your workspace.
              <br />
              The same button does both.
            </p>
          </div>

          <form action={signInWithGoogle} className="mt-8">
            <button
              type="submit"
              className="group flex w-full items-center justify-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#1a174f] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#312D97] hover:shadow-lg hover:shadow-[#312D97]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312D97] focus-visible:ring-offset-2"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </form>

          <div className="mt-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-[0.7rem] font-medium uppercase tracking-widest text-slate-400">
              What happens next
            </span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            <Step
              n={1}
              title="One click with Google"
              body="No passwords. New users get a workspace created on the spot."
            />
            <Step
              n={2}
              title="A clean, empty workspace"
              body="You start with nothing — no fake data cluttering your view. Add real vendors and bills as you go."
            />
            <Step
              n={3}
              title="Flip on demo data anytime"
              body='Toggle "Show demo data" on the dashboard to load a realistic demo dataset (vendors, bills, GL accounts, payments) so you can explore the product.'
            />
          </ul>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          By continuing, you agree to be the sole user of your workspace. Your
          data is private to your account.
        </p>
      </div>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-[#312D97]">
        {n}
      </span>
      <div>
        <p className="text-sm font-medium text-[#1a174f]">{title}</p>
        <p className="text-xs leading-5 text-slate-500">{body}</p>
      </div>
    </li>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 01-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.24 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.1A6.6 6.6 0 015.5 12c0-.73.12-1.43.34-2.1V7.07H2.18A11 11 0 001 12c0 1.78.43 3.46 1.18 4.93l3.66-2.83z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.65l3.15-3.15C17.45 2.1 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"
        fill="#EA4335"
      />
    </svg>
  );
}
