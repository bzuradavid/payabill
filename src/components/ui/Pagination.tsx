"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn } from "~/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  pageSize: number;
  total: number;
  basePath: string;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
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

export function Pagination({
  page,
  totalPages,
  pageSize,
  total,
  basePath,
  pageSizeOptions = [10, 20, 50],
  defaultPageSize = 20,
}: PaginationProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  if (total === 0) return null;

  const navigate = (p: number, ps: number) => {
    const params = new URLSearchParams();
    if (p > 1) params.set("page", String(p));
    if (ps !== defaultPageSize) params.set("pageSize", String(ps));
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${basePath}?${qs}` : basePath);
    });
  };

  const pages = getPageNumbers(page, totalPages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#ecebff] px-6 py-4">
      {/* Page size selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">Rows per page</span>
        <select
          value={pageSize}
          onChange={(e) => navigate(1, parseInt(e.target.value, 10))}
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
            onClick={() => navigate(page - 1, pageSize)}
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
                onClick={() => navigate(p, pageSize)}
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
            onClick={() => navigate(page + 1, pageSize)}
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
  );
}
