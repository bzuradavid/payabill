import { type BillStatus } from "../../../generated/prisma";
import { Badge } from "~/components/ui/Badge";

const statusConfig: Record<
  BillStatus,
  { label: string; variant: "gray" | "amber" | "indigo" | "purple" | "emerald" | "red" | "blue" }
> = {
  DRAFT: { label: "Draft", variant: "gray" },
  PENDING_APPROVAL: { label: "Pending Approval", variant: "amber" },
  APPROVED: { label: "Approved", variant: "indigo" },
  SCHEDULED: { label: "Scheduled", variant: "purple" },
  PAID: { label: "Paid", variant: "emerald" },
  REJECTED: { label: "Rejected", variant: "red" },
  VOID: { label: "Void", variant: "gray" },
};

interface BillStatusBadgeProps {
  status: BillStatus;
}

export function BillStatusBadge({ status }: BillStatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
