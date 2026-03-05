import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

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
  return await prisma.user.create({
    data: {
      authUserId: userId,
      firstName: clerkUser?.firstName || "Friend",
      lastName: clerkUser?.lastName || "",
    },
  });
};
