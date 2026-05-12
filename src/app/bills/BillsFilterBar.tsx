"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { type BillStatus } from "../../../generated/prisma";
import { cn } from "~/lib/utils";

interface Tab {
  label: string;
  value: BillStatus | "ALL";
}

interface BillsFilterBarProps {
  tabs: Tab[];
  activeStatus: BillStatus | "ALL";
  search: string;
}

export function BillsFilterBar({ tabs, activeStatus, search }: BillsFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const navigate = useCallback(
    (status: BillStatus | "ALL", q: string) => {
      const params = new URLSearchParams();
      if (status !== "ALL") params.set("status", status);
      if (q) params.set("q", q);
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname);
      });
    },
    [router, pathname],
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => navigate(tab.value, search)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeStatus === tab.value
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          defaultValue={search}
          placeholder="Search vendor or invoice #"
          onChange={(e) => navigate(activeStatus, e.target.value)}
          className="w-64 rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
        />
      </div>
    </div>
  );
}
