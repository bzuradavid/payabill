"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { billService } from "~/server/container";

const lineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().positive(),
  amount: z.number().positive(),
  glAccountId: z.string().optional(),
});

const createBillSchema = z.object({
  vendorId: z.string().min(1),
  invoiceNumber: z.string().optional(),
  invoiceDate: z.string(), // ISO string from form
  dueDate: z.string(),
  paymentMethod: z.enum(["ACH", "CHECK", "WIRE"]).optional(),
  memo: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item required"),
});

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createBill(
  rawData: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const data = createBillSchema.parse(rawData);
    const bill = await billService.create({
      ...data,
      invoiceDate: new Date(data.invoiceDate),
      dueDate: new Date(data.dueDate),
      paymentMethod: data.paymentMethod,
    });
    revalidatePath("/bills");
    revalidatePath("/");
    return { success: true, data: { id: bill.id } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to create bill" };
  }
}

export async function submitBill(id: string): Promise<ActionResult> {
  try {
    await billService.submit(id);
    revalidatePath(`/bills/${id}`);
    revalidatePath("/bills");
    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to submit bill" };
  }
}

export async function approveBill(id: string): Promise<ActionResult> {
  try {
    await billService.approve(id);
    revalidatePath(`/bills/${id}`);
    revalidatePath("/bills");
    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to approve bill" };
  }
}

export async function rejectBill(
  id: string,
  reason: string,
): Promise<ActionResult> {
  try {
    if (!reason.trim()) {
      return { success: false, error: "Rejection reason is required" };
    }
    await billService.reject(id, reason);
    revalidatePath(`/bills/${id}`);
    revalidatePath("/bills");
    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to reject bill" };
  }
}

export async function schedulePayment(
  id: string,
  scheduledDate: string,
): Promise<ActionResult> {
  try {
    const date = new Date(scheduledDate);
    if (isNaN(date.getTime())) {
      return { success: false, error: "Invalid scheduled date" };
    }
    await billService.schedulePayment(id, date);
    revalidatePath(`/bills/${id}`);
    revalidatePath("/bills");
    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to schedule payment" };
  }
}

export async function markPaid(id: string): Promise<ActionResult> {
  try {
    await billService.markPaid(id);
    revalidatePath(`/bills/${id}`);
    revalidatePath("/bills");
    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to mark bill as paid" };
  }
}

export async function voidBill(id: string): Promise<ActionResult> {
  try {
    await billService.void(id);
    revalidatePath(`/bills/${id}`);
    revalidatePath("/bills");
    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to void bill" };
  }
}
