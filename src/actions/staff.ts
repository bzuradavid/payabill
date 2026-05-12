"use server";

import { revalidatePath } from "next/cache";
import { getServices } from "~/server/container";

type ActionResult = { ok: true } | { ok: false; error: string };

function revalidateStaff() {
  revalidatePath("/staff");
}

export async function inviteStaff(email: string): Promise<ActionResult> {
  try {
    const { staffService } = await getServices();
    await staffService.inviteStaff(email);
    revalidateStaff();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to invite" };
  }
}

export async function revokeInvitation(id: string): Promise<ActionResult> {
  try {
    const { staffService } = await getServices();
    await staffService.revokeInvitation(id);
    revalidateStaff();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to revoke" };
  }
}

export async function removeStaff(userId: string): Promise<ActionResult> {
  try {
    const { staffService } = await getServices();
    await staffService.removeStaff(userId);
    revalidateStaff();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to remove" };
  }
}
