"use client";

import { useState, useTransition } from "react";

import { removeStaff } from "~/actions/staff";
import { Badge } from "~/components/ui/Badge";

interface Member {
  id: string;
  name: string | null;
  email: string | null;
  role: "MANAGER" | "STAFF";
}

export function StaffMembersTable({
  members,
  currentUserId,
}: {
  members: Member[];
  currentUserId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const onRemove = (id: string, label: string) => {
    if (!confirm(`Remove ${label} from this workspace?`)) return;
    setPendingId(id);
    startTransition(async () => {
      const result = await removeStaff(id);
      if (!result.ok) alert(result.error);
      setPendingId(null);
    });
  };

  if (members.length === 0) {
    return (
      <div className="px-6 py-10 text-center text-sm text-slate-500">
        No teammates yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#ecebff] bg-brand-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">Email</th>
            <th className="px-6 py-3">Role</th>
            <th className="px-6 py-3" />
          </tr>
        </thead>
        <tbody>
          {members.map((m) => {
            const label = m.name ?? m.email ?? "this user";
            const isYou = m.id === currentUserId;
            return (
              <tr
                key={m.id}
                className="border-b border-[#ecebff] last:border-0"
              >
                <td className="px-6 py-3.5 font-medium text-slate-900">
                  {m.name ?? <span className="text-slate-400">—</span>}
                  {isYou && (
                    <span className="ml-2 text-xs font-medium text-[#10A6CC]">
                      (you)
                    </span>
                  )}
                </td>
                <td className="px-6 py-3.5 text-slate-500">
                  {m.email ?? "—"}
                </td>
                <td className="px-6 py-3.5">
                  <Badge variant={m.role === "MANAGER" ? "indigo" : "gray"}>
                    {m.role === "MANAGER" ? "Manager" : "Staff"}
                  </Badge>
                </td>
                <td className="px-6 py-3.5 text-right">
                  {!isYou && m.role === "STAFF" && (
                    <button
                      type="button"
                      onClick={() => onRemove(m.id, label)}
                      disabled={isPending && pendingId === m.id}
                      className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
