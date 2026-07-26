"use server";

import { ensureDbUser } from "@/lib/ensure-user";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateNotificationPreferences(formData: FormData) {
  const dbUser = await ensureDbUser();
  const rawTimezone = formData.get("timezone");
  const timezone =
    typeof rawTimezone === "string" && rawTimezone.trim().length > 0
      ? rawTimezone.trim()
      : null;

  try {
    await prisma.notificationPreference.upsert({
      where: { userId: dbUser.id },
      update: {
        pushEnabled: formData.get("pushEnabled") === "on",
        airingTonightEnabled: formData.get("airingTonightEnabled") === "on",
        airingThisWeekEnabled: formData.get("airingThisWeekEnabled") === "on",
        newSeasonThisWeekEnabled:
          formData.get("newSeasonThisWeekEnabled") === "on",
        timezone,
      },
      create: {
        userId: dbUser.id,
        pushEnabled: formData.get("pushEnabled") === "on",
        airingTonightEnabled: formData.get("airingTonightEnabled") === "on",
        airingThisWeekEnabled: formData.get("airingThisWeekEnabled") === "on",
        newSeasonThisWeekEnabled:
          formData.get("newSeasonThisWeekEnabled") === "on",
        timezone,
      },
    });

    revalidatePath("/settings");
    return { success: true, message: "Notification preferences saved." };
  } catch (error) {
    console.error("Failed to update notification preferences:", error);
    return { error: "Could not save notification preferences." };
  }
}
