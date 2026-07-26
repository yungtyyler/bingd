"use server";

import prisma from "@/lib/prisma";
import { ensureDbUser } from "@/lib/ensure-user";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

export async function deleteAccount(formData: FormData) {
  const confirmation = formData.get("confirmation");
  const { userId } = await auth();

  if (!userId) {
    return { error: "You must be signed in to delete your account." };
  }

  if (confirmation !== "DELETE") {
    return { error: "Type DELETE to confirm account deletion." };
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { authUserId: userId },
      select: { id: true },
    });

    if (dbUser) {
      await prisma.user.delete({
        where: { id: dbUser.id },
      });
    }

    const client = await clerkClient();
    await client.users.deleteUser(userId);
  } catch (error) {
    console.error("Failed to delete account:", error);
    return { error: "Could not delete your account. Please try again." };
  }

  redirect("/");
}
