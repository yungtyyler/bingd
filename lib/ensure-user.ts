import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function ensureDbUser() {
  const { userId: authUserId } = await auth();

  if (!authUserId) {
    throw new Error("Not Authenticated.");
  }

  const user = await prisma.user.upsert({
    where: { authUserId },
    update: {},
    create: { authUserId },
    select: { id: true, authUserId: true },
  });

  return user;
}
