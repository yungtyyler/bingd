"use server";

import prisma from "@/lib/prisma";
import { ensureDbUser } from "@/lib/ensure-user";
import { revalidatePath } from "next/cache";

export async function toggleFollow(
  targetUserId: string,
  pathToRevalidate: string,
) {
  const currentUser = await ensureDbUser();

  if (currentUser.id === targetUserId) {
    return { error: "You cannot follow yourself." };
  }

  try {
    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: currentUser.id,
            followingId: targetUserId,
          },
        },
      });
    } else {
      await prisma.follows.create({
        data: {
          followerId: currentUser.id,
          followingId: targetUserId,
        },
      });
    }

    revalidatePath(pathToRevalidate);
    return { success: true };
  } catch (error) {
    console.error("Follow toggle error:", error);
    return { error: "Failed to update follow status." };
  }
}
