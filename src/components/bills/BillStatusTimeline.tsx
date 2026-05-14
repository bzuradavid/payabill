import { type BillStatus } from "../../../generated/prisma";
import { BillStatusBadge } from "./BillStatusBadge";
import { formatDate } from "~/lib/utils";

interface HistoryEntry {
  id: string;
  fromStatus: BillStatus | null;
  toStatus: BillStatus;
  note: string | null;
  createdAt: Date;
  changedBy: { name: string | null; email: string | null } | null;
}

interface BillStatusTimelineProps {
  history: HistoryEntry[];
}

export function BillStatusTimeline({ history }: BillStatusTimelineProps) {
  if (history.length === 0) return null;

  return (
    <div className="flex flex-col">
      {history.map((entry, i) => (
        <div key={entry.id} className="flex gap-3">
          {/* Spine */}
          <div className="flex flex-col items-center">
            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-slate-300" />
            {i < history.length - 1 && (
              <div className="mt-1 w-px flex-1 bg-slate-100" />
            )}
          </div>

          {/* Content */}
          <div className="pb-4 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              {entry.fromStatus && (
                <>
                  <BillStatusBadge status={entry.fromStatus} />
                  <span className="text-xs text-slate-400">→</span>
                </>
              )}
              <BillStatusBadge status={entry.toStatus} />
            </div>
            <p className="mt-0.5 text-xs text-slate-400">
              {entry.changedBy?.name ?? entry.changedBy?.email ?? "System"}
              {" · "}
              {formatDate(entry.createdAt)}
            </p>
            {entry.note && (
              <p className="mt-1.5 rounded-md bg-red-50 px-2 py-1.5 text-xs leading-relaxed text-red-700">
                {entry.note}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
