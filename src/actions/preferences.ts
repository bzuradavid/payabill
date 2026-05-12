"use server";

import { revalidatePath } from "next/cache";
import { db } from "~/server/db";
import { requireUserContext } from "~/server/get-user";
import { seedUserData } from "~/server/seed-user";

type ActionResult =
  | { success: true; data: { showSeed: boolean } }
  | { success: false; error: string };

export async function setShowSeed(showSeed: boolean): Promise<ActionResult> {
  try {
    const { userId } = await requireUserContext();

    if (showSeed) {
      // First-time enable triggers seeding; subsequent toggles are a no-op for data.
      const user = await db.user.findUniqueOrThrow({
        where: { id: userId },
        select: { seededAt: true },
      });
      if (!user.seededAt) {
        await seedUserData(db, userId);
        await db.user.update({
          where: { id: userId },
          data: { showSeed: true, seededAt: new Date() },
        });
      } else {
        await db.user.update({
          where: { id: userId },
          data: { showSeed: true },
        });
      }
    } else {
      await db.user.update({
        where: { id: userId },
        data: { showSeed: false },
      });
    }

    // Every protected surface filters on the seed flag, so invalidate them all.
    revalidatePath("/dashboard");
    revalidatePath("/bills");
    revalidatePath("/vendors");
    return { success: true, data: { showSeed } };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to update preference",
    };
  }
}
