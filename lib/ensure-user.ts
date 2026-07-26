import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { createPendingUsername } from "@/lib/usernames";

export const ensureDbUser = async () => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { authUserId: userId },
  });

  if (user) {
    if (!user.firstName) {
      const clerkUser = await currentUser();
      return await prisma.user.update({
        where: { authUserId: userId },
        data: {
          firstName: clerkUser?.firstName || "Friend",
          lastName: clerkUser?.lastName || "",
        },
      });
    }
    return user;
  }

  const clerkUser = await currentUser();

  try {
    return await prisma.user.create({
      data: {
        authUserId: userId,
        username: createPendingUsername(userId),
        firstName: clerkUser?.firstName || "Friend",
        lastName: clerkUser?.lastName || "",
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === "P2002") {
      const existingUser = await prisma.user.findUnique({
        where: { authUserId: userId },
      });
      if (existingUser) return existingUser;
    }
    throw error;
  }
};
