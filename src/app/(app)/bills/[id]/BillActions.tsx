"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { type BillStatus, type UserRole } from "../../../../../generated/prisma";
import { Button } from "~/components/ui/Button";
import { Modal } from "~/components/ui/Modal";
import { Card, CardContent, CardHeader } from "~/components/ui/Card";
import {
  submitBill,
  approveBill,
  rejectBill,
  schedulePayment,
  markPaid,
  voidBill,
} from "~/actions/bills";

interface BillActionsProps {
  bill: { id: string; status: BillStatus; createdById: string };
  role: UserRole;
  userId: string;
}

export function BillActions({ bill, role, userId }: BillActionsProps) {
  const isManager = role === "MANAGER";
  const isCreator = bill.createdById === userId;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState(false);
  const [scheduleModal, setScheduleModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [scheduledDate, setScheduledDate] = useState(
    new Date().toISOString().split("T")[0]!,
  );

  const run = (fn: () => Promise<{ success: boolean; error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.success) {
        setError(result.error ?? "An error occurred");
      } else {
        router.refresh();
      }
    });
  };

  const actions: React.ReactNode[] = [];

  if (bill.status === "DRAFT" && (isManager || isCreator)) {
    actions.push(
      <Link key="edit" href={`/bills/${bill.id}/edit`} className="w-full">
        <Button variant="secondary" className="w-full">Edit</Button>
      </Link>,
      <Button
        key="submit"
        variant="primary"
        loading={isPending}
        onClick={() => run(() => submitBill(bill.id))}
      >
        Submit for Approval
      </Button>,
    );
  }

  if (bill.status === "PENDING_APPROVAL" && isManager) {
    actions.push(
      <Button
        key="approve"
        variant="primary"
        loading={isPending}
        onClick={() => run(() => approveBill(bill.id))}
      >
        Approve
      </Button>,
      <Button
        key="reject"
        variant="danger"
        onClick={() => setRejectModal(true)}
      >
        Reject
      </Button>,
    );
  }

  if (bill.status === "APPROVED" && isManager) {
    actions.push(
      <Button
        key="schedule"
        variant="primary"
        onClick={() => setScheduleModal(true)}
      >
        Schedule Payment
      </Button>,
    );
  }

  if (bill.status === "SCHEDULED" && isManager) {
    actions.push(
      <Button
        key="paid"
        variant="primary"
        loading={isPending}
        onClick={() => run(() => markPaid(bill.id))}
      >
        Mark as Paid
      </Button>,
    );
  }

  const canVoid = isManager && !["PAID", "VOID"].includes(bill.status);
  if (canVoid) {
    actions.push(
      <Button
        key="void"
        variant="ghost"
        className="text-slate-400 hover:text-red-600"
        onClick={() => {
          if (confirm("Are you sure you want to void this bill?")) {
            run(() => voidBill(bill.id));
          }
        }}
      >
        Void Bill
      </Button>,
    );
  }

  if (actions.length === 0) return null;

  return (
    <>
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900">Actions</h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          {actions}
        </CardContent>
      </Card>

      {/* Reject modal */}
      <Modal
        open={rejectModal}
        onClose={() => setRejectModal(false)}
        title="Reject Bill"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600">
            Provide a reason so the submitter knows what to fix.
          </p>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. Invoice exceeds approved budget. Please resubmit with updated approval."
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setRejectModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={isPending}
              disabled={!rejectionReason.trim()}
              onClick={() => {
                run(() => rejectBill(bill.id, rejectionReason));
                setRejectModal(false);
              }}
            >
              Reject Bill
            </Button>
          </div>
        </div>
      </Modal>

      {/* Schedule payment modal */}
      <Modal
        open={scheduleModal}
        onClose={() => setScheduleModal(false)}
        title="Schedule Payment"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600">
            Choose when this payment should be sent.
          </p>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Payment Date
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setScheduleModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={isPending}
              onClick={() => {
                run(() => schedulePayment(bill.id, scheduledDate));
                setScheduleModal(false);
              }}
            >
              Schedule Payment
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
