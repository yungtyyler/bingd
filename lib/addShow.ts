import { ensureDbUser } from "@/lib/ensure-user";
import prisma from "@/lib/prisma";

export default async function addShow(params: {
  tvmazeId: number;
  name: string;
  imageUrl?: string;
}) {
  const dbUser = await ensureDbUser();
  const show = await prisma.show.upsert({
    where: { tvmazeId: params.tvmazeId },
    update: { name: params.name, imageUrl: params.imageUrl ?? null },
    create: {
      tvmazeId: params.tvmazeId,
      name: params.name,
      imageUrl: params.imageUrl ?? null,
    },
    select: { id: true },
  });

  await prisma.userShow.upsert({
    where: { userId_showId: { userId: dbUser.id, showId: show.id } },
    update: {},
    create: { userId: dbUser.id, showId: show.id },
  });
}
