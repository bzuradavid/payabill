"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { vendorService } from "~/server/container";

const vendorSchema = z.object({
  name: z.string().min(1, "Vendor name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  defaultPaymentMethod: z.enum(["ACH", "CHECK", "WIRE"]).optional(),
  bankName: z.string().optional(),
  bankRoutingNumber: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  taxId: z.string().optional(),
});

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createVendor(
  rawData: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const data = vendorSchema.parse(rawData);
    const vendor = await vendorService.create({
      ...data,
      email: data.email ?? undefined,
    });
    revalidatePath("/vendors");
    return { success: true, data: { id: vendor.id } };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to create vendor",
    };
  }
}

export async function updateVendor(
  id: string,
  rawData: unknown,
): Promise<ActionResult> {
  try {
    const data = vendorSchema.parse(rawData);
    await vendorService.update(id, {
      ...data,
      email: data.email ?? undefined,
    });
    revalidatePath(`/vendors/${id}`);
    revalidatePath("/vendors");
    return { success: true, data: undefined };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to update vendor",
    };
  }
}

export async function deactivateVendor(id: string): Promise<ActionResult> {
  try {
    await vendorService.deactivate(id);
    revalidatePath(`/vendors/${id}`);
    revalidatePath("/vendors");
    return { success: true, data: undefined };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to deactivate vendor",
    };
  }
}
