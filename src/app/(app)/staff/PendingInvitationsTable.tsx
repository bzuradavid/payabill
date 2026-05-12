"use client";

import { useState, useTransition } from "react";

import { revokeInvitation } from "~/actions/staff";
import { formatDate } from "~/lib/utils";

interface Invitation {
  id: string;
  email: string;
  createdAt: Date;
}

export function PendingInvitationsTable({
  invitations,
}: {
  invitations: Invitation[];
}) {
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const onRevoke = (id: string, email: string) => {
    if (!confirm(`Revoke the invitation for ${email}?`)) return;
    setPendingId(id);
    startTransition(async () => {
      const result = await revokeInvitation(id);
      if (!result.ok) alert(result.error);
      setPendingId(null);
    });
  };

  if (invitations.length === 0) {
    return (
      <div className="px-6 py-10 text-center text-sm text-slate-500">
        No pending invitations.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#ecebff] bg-brand-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <th className="px-6 py-3">Email</th>
            <th className="px-6 py-3">Invited</th>
            <th className="px-6 py-3" />
          </tr>
        </thead>
        <tbody>
          {invitations.map((inv) => (
            <tr key={inv.id} className="border-b border-[#ecebff] last:border-0">
              <td className="px-6 py-3.5 font-medium text-slate-900">
                {inv.email}
              </td>
              <td className="px-6 py-3.5 text-slate-500">
                {formatDate(inv.createdAt)}
              </td>
              <td className="px-6 py-3.5 text-right">
                <button
                  type="button"
                  onClick={() => onRevoke(inv.id, inv.email)}
                  disabled={isPending && pendingId === inv.id}
                  className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                >
                  Revoke
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
