"use client";

import { useRouter, usePathname } from "next/navigation";
import { type ReactNode, useCallback, useOptimistic, useTransition } from "react";
import { type BillStatus } from "../../../../generated/prisma";
import { cn } from "~/lib/utils";
import { BillsTableSkeleton } from "./BillsTableSkeleton";

const DEFAULT_PAGE_SIZE = 10;

interface Tab {
  label: string;
  value: BillStatus | "ALL";
}

interface BillsFilterBarProps {
  tabs: Tab[];
  activeStatus: BillStatus | "ALL";
  search: string;
  children: ReactNode;
  page: number;
  totalPages: number;
  pageSize: number;
  total: number;
  pageSizeOptions?: number[];
}

function getPageNumbers(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (page > 3) pages.push("…");
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (page < totalPages - 2) pages.push("…");
  pages.push(totalPages);
  return pages;
}

export function BillsFilterBar({
  tabs,
  activeStatus,
  search,
  children,
  page,
  totalPages,
  pageSize,
  total,
  pageSizeOptions = [10, 20, 50],
}: BillsFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(activeStatus);

  const navigate = useCallback(
    (status: BillStatus | "ALL", q: string, p: number, ps: number) => {
      const params = new URLSearchParams();
      if (status !== "ALL") params.set("status", status);
      if (q) params.set("q", q);
      if (p > 1) params.set("page", String(p));
      if (ps !== DEFAULT_PAGE_SIZE) params.set("pageSize", String(ps));
      const qs = params.toString();
      startTransition(() => {
        setOptimisticStatus(status);
        router.push(qs ? `${pathname}?${qs}` : pathname);
      });
    },
    [router, pathname, setOptimisticStatus],
  );

  const pages = getPageNumbers(page, totalPages);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs */}
        <div className="overflow-x-auto">
          <div className="flex gap-1 rounded-2xl border border-[#ecebff] bg-white p-1 shadow-sm shadow-[#d3d1ff]/30 w-max">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => navigate(tab.value, search, 1, pageSize)}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
                  optimisticStatus === tab.value
                    ? "bg-[#312D97] text-white shadow-sm"
                    : "text-slate-500 hover:bg-brand-50 hover:text-[#312D97]",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
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
            onChange={(e) => navigate(activeStatus, e.target.value, 1, pageSize)}
            className="w-full rounded-xl border border-[#ecebff] bg-white py-2 pr-3 pl-9 text-sm text-[#1a174f] placeholder:text-slate-400 transition-colors focus:border-[#312D97] focus:ring-1 focus:ring-[#312D97] focus:outline-none sm:w-64"
          />
        </div>
      </div>

      {/* Card — owns both the table area and the pagination footer */}
      <div className="overflow-hidden rounded-2xl border border-[#ecebff] bg-white shadow-lg shadow-[#d3d1ff]/40">
        {isPending ? <BillsTableSkeleton /> : children}

        {total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#ecebff] px-6 py-4">
            {/* Page size selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Rows per page</span>
              <select
                value={pageSize}
                onChange={(e) =>
                  navigate(optimisticStatus, search, 1, parseInt(e.target.value, 10))
                }
                className="rounded-lg border border-[#ecebff] bg-white px-2 py-1 text-sm text-[#1a174f] focus:border-[#312D97] focus:outline-none focus:ring-1 focus:ring-[#312D97]"
              >
                {pageSizeOptions.map((ps) => (
                  <option key={ps} value={ps}>{ps}</option>
                ))}
              </select>
            </div>

            {/* Page navigation */}
            {totalPages > 1 ? (
              <nav className="flex items-center gap-1" aria-label="Pagination">
                <button
                  onClick={() => navigate(optimisticStatus, search, page - 1, pageSize)}
                  disabled={page <= 1}
                  aria-label="Previous page"
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-sm font-medium transition-colors",
                    page <= 1
                      ? "cursor-not-allowed text-slate-300"
                      : "text-slate-500 hover:bg-brand-50 hover:text-[#312D97]",
                  )}
                >
                  ← Prev
                </button>

                {pages.map((p, i) =>
                  p === "…" ? (
                    <span key={`e-${i}`} className="px-1 text-sm text-slate-300">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => navigate(optimisticStatus, search, p, pageSize)}
                      aria-current={p === page ? "page" : undefined}
                      className={cn(
                        "rounded-xl px-3 py-1.5 text-sm font-medium transition-colors",
                        p === page
                          ? "bg-[#312D97] text-white shadow-sm"
                          : "text-slate-500 hover:bg-brand-50 hover:text-[#312D97]",
                      )}
                    >
                      {p}
                    </button>
                  ),
                )}

                <button
                  onClick={() => navigate(optimisticStatus, search, page + 1, pageSize)}
                  disabled={page >= totalPages}
                  aria-label="Next page"
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-sm font-medium transition-colors",
                    page >= totalPages
                      ? "cursor-not-allowed text-slate-300"
                      : "text-slate-500 hover:bg-brand-50 hover:text-[#312D97]",
                  )}
                >
                  Next →
                </button>
              </nav>
            ) : (
              <p className="text-sm text-slate-500">
                {total} result{total !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
