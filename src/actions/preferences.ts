"use server";

import { revalidatePath } from "next/cache";
import { db } from "~/server/db";
import { requireUserContext } from "~/server/get-user";

type ActionResult =
  | { success: true; data: { hideSeed: boolean } }
  | { success: false; error: string };

export async function setHideSeed(hideSeed: boolean): Promise<ActionResult> {
  try {
    const { userId } = await requireUserContext();
    await db.user.update({
      where: { id: userId },
      data: { hideSeed },
    });
    // Every protected surface filters on the seed flag, so invalidate them all.
    revalidatePath("/dashboard");
    revalidatePath("/bills");
    revalidatePath("/vendors");
    return { success: true, data: { hideSeed } };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to update preference",
    };
  }
}
