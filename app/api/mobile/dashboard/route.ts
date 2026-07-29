import {
  getMobileUser,
  serializeLibraryEntry,
} from "@/app/api/mobile/_helpers";
import { WatchStatus } from "@/app/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const { dbUser, response } = await getMobileUser();

  if (!dbUser) {
    return response;
  }

  const [activeShows, upcomingShows] = await Promise.all([
    prisma.userShow.findMany({
      where: {
        userId: dbUser.id,
        status: WatchStatus.WATCHING,
      },
      include: { show: true },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
    prisma.userShow.findMany({
      where: {
        userId: dbUser.id,
        show: {
          nextEpisodeDate: {
            gte: new Date(),
          },
        },
      },
      include: { show: true },
      orderBy: {
        show: { nextEpisodeDate: "asc" },
      },
      take: 6,
    }),
  ]);

  return NextResponse.json({
    user: {
      firstName: dbUser.firstName,
      username: dbUser.username,
    },
    activeShows: activeShows.map(serializeLibraryEntry),
    upcomingShows: upcomingShows.map(serializeLibraryEntry),
  });
}
