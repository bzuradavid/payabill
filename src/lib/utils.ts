import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isBefore, differenceInDays } from "date-fns";
import { type BillStatus } from "../../generated/prisma";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatDateShort(date: Date | string): string {
  return format(new Date(date), "MM/dd/yy");
}

export function isOverdue(dueDate: Date | string, status: BillStatus): boolean {
  const terminalStatuses: BillStatus[] = ["PAID", "VOID", "REJECTED"];
  if (terminalStatuses.includes(status)) return false;
  return isBefore(new Date(dueDate), new Date());
}

export function getDueDateLabel(dueDate: Date | string, status: BillStatus): string {
  const terminalStatuses: BillStatus[] = ["PAID", "VOID", "REJECTED"];
  if (terminalStatuses.includes(status)) return formatDate(dueDate);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diff = differenceInDays(due, today);

  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return "Due today";
  if (diff <= 7) return `Due in ${diff}d`;
  return formatDate(dueDate);
}
