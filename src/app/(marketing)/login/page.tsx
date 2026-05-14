export const dynamic = "force-dynamic";

import { type Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CredentialsForm } from "~/components/auth/CredentialsForm";
import { GoogleSignInButton } from "~/components/auth/GoogleSignInButton";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export const metadata: Metadata = {
  title: "Sign in — Payabill",
  description: "Sign in or create your Payabill workspace.",
};

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.id) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true },
    });
    // Only short-circuit to the app if the user is fully set up. Otherwise
    // fall through and let them sign in again — avoids a redirect loop with
    // the (app) layout when the session token references a deleted user.
    if (user?.organizationId) redirect("/dashboard");
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-white px-6 py-4 sm:py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 aspect-square w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-[#312D97]/15 to-[#10A6CC]/15 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-4 flex items-center justify-center gap-2.5 sm:mb-8"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#312D97] shadow-lg shadow-[#312D97]/30 sm:h-10 sm:w-10">
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
          <span className="text-xl font-bold tracking-tight text-[#1a174f]">
            Payabill
          </span>
        </Link>

        <div className="rounded-3xl border border-[#ecebff] bg-white p-5 shadow-2xl shadow-[#312D97]/10 sm:p-8">
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight text-[#1a174f] sm:text-2xl">
              Welcome
            </h1>
            <p className="mt-1 text-sm leading-6 text-slate-500 sm:mt-1.5">
              Sign in to your workspace or create a new one.
            </p>
          </div>

          <div className="mt-4 sm:mt-6">
            <GoogleSignInButton />
          </div>

          <div className="mt-4 flex items-center gap-4 sm:mt-5">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-[0.7rem] font-medium tracking-widest text-slate-400 uppercase">
              Or with email
            </span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          <div className="mt-4 sm:mt-5">
            <CredentialsForm />
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400 sm:mt-6">
          Try the demo:{" "}
          <span className="font-medium">manager@payabill.com</span> or{" "}
          <span className="font-medium">staff@payabill.com</span> with password{" "}
          <span className="font-medium">pass1234</span>.
        </p>
      </div>
    </div>
  );
}
