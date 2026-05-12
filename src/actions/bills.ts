"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServices } from "~/server/container";

const lineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().positive(),
  amount: z.number().positive(),
  glAccountId: z.string().optional(),
});

const inlineVendorSchema = z.object({
  name: z.string().min(1, "Vendor name is required"),
  email: z.string().email().optional().or(z.literal("")),
  defaultPaymentMethod: z.enum(["ACH", "CHECK", "WIRE"]).optional(),
});

const createBillSchema = z
  .object({
    vendorId: z.string().optional(),
    inlineVendor: inlineVendorSchema.optional(),
    invoiceNumber: z.string().optional(),
    invoiceDate: z.string(),
    dueDate: z.string(),
    paymentMethod: z.enum(["ACH", "CHECK", "WIRE"]).optional(),
    memo: z.string().optional(),
    lineItems: z.array(lineItemSchema).min(1, "At least one line item required"),
  })
  .refine((d) => !!d.vendorId || !!d.inlineVendor, {
    message: "Select an existing vendor or add a new one",
    path: ["vendorId"],
  });

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function invalidateBillSurfaces(id?: string) {
  if (id) revalidatePath(`/bills/${id}`);
  revalidatePath("/bills");
  revalidatePath("/dashboard");
}

export async function createBill(
  rawData: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const data = createBillSchema.parse(rawData);
    const { billService, vendorService } = await getServices();

    let vendorId = data.vendorId;
    if (!vendorId && data.inlineVendor) {
      const created = await vendorService.createInline({
        name: data.inlineVendor.name,
        email: data.inlineVendor.email ?? undefined,
        defaultPaymentMethod: data.inlineVendor.defaultPaymentMethod,
      });
      vendorId = created.id;
    }
    if (!vendorId) {
      return { success: false, error: "Select an existing vendor or add a new one" };
    }

    const bill = await billService.create({
      vendorId,
      invoiceNumber: data.invoiceNumber,
      memo: data.memo,
      lineItems: data.lineItems,
      invoiceDate: new Date(data.invoiceDate),
      dueDate: new Date(data.dueDate),
      paymentMethod: data.paymentMethod,
    });
    invalidateBillSurfaces();
    return { success: true, data: { id: bill.id } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to create bill" };
  }
}

export async function submitBill(id: string): Promise<ActionResult> {
  try {
    const { billService } = await getServices();
    await billService.submit(id);
    invalidateBillSurfaces(id);
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to submit bill" };
  }
}

export async function approveBill(id: string): Promise<ActionResult> {
  try {
    const { billService } = await getServices();
    await billService.approve(id);
    invalidateBillSurfaces(id);
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
    const { billService } = await getServices();
    await billService.reject(id, reason);
    invalidateBillSurfaces(id);
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
    const { billService } = await getServices();
    await billService.schedulePayment(id, date);
    invalidateBillSurfaces(id);
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to schedule payment" };
  }
}

export async function markPaid(id: string): Promise<ActionResult> {
  try {
    const { billService } = await getServices();
    await billService.markPaid(id);
    invalidateBillSurfaces(id);
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to mark bill as paid" };
  }
}

export async function voidBill(id: string): Promise<ActionResult> {
  try {
    const { billService } = await getServices();
    await billService.void(id);
    invalidateBillSurfaces(id);
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to void bill" };
  }
}
