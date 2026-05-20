"use server";

import prisma from "@/lib/prisma";
import { ensureDbUser } from "@/lib/ensure-user";
import { revalidatePath } from "next/cache";

export async function updateUsername(formData: FormData) {
  const dbUser = await ensureDbUser();
  const rawUsername = formData.get("username") as string;

  if (!rawUsername || rawUsername.length < 3) {
    return { error: "Username must be at least 3 characters." };
  }

  // Force usernames to be lowercase and remove spaces for clean URLs
  const cleanUsername = rawUsername.toLowerCase().replace(/\s+/g, "");

  try {
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { username: cleanUsername },
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true, message: "Username updated successfully!" };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "That username is already taken." };
    }
    return { error: "Something went wrong. Please try again." };
  }
}
