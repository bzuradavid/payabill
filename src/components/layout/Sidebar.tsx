"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { cn } from "~/lib/utils";
import { signOutAction } from "~/actions/auth";

export interface SidebarUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/bills",
    label: "Bills",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: "/vendors",
    label: "Vendors",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    href: "/docs",
    label: "Docs",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
];

interface SidebarProps {
  user: SidebarUser;
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ user, open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isSigningOut, startSignOut] = useTransition();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const handleSignOut = () => {
    startSignOut(async () => {
      await signOutAction();
    });
  };

  const initial = (user.name ?? user.email ?? "?").trim().charAt(0).toUpperCase();
  const displayName = user.name ?? user.email ?? "Account";

  return (
    <aside
      className={cn(
        "flex h-screen flex-col",
        "fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-200 ease-in-out",
        open ? "translate-x-0" : "-translate-x-full",
        "md:relative md:w-56 md:shrink-0 md:translate-x-0",
      )}
      style={{ background: "linear-gradient(to bottom, #312D97, #2f2a90)" }}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="text-sm font-semibold tracking-tight text-white">
          Payables
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-white/15 text-white shadow-sm"
                : "text-white/60 hover:bg-white/10 hover:text-white",
            )}
          >
            <span className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
              isActive(item.href) ? "bg-white/20" : "bg-transparent",
            )}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt=""
              className="h-9 w-9 shrink-0 rounded-full border border-white/20 object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold text-white">
              {initial}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">
              {displayName}
            </p>
            {user.email && (
              <p className="truncate text-[0.7rem] text-white/50">
                {user.email}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {isSigningOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </aside>
  );
}
