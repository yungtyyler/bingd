"use server";

import { ensureDbUser } from "@/lib/ensure-user";
import prisma from "@/lib/prisma";
import { ShowSnippet, TVMazeSearchItem } from "@/types";
import { revalidatePath } from "next/cache";
import { WatchStatus } from "@/app/generated/prisma/enums";

export async function searchShows(query: string): Promise<ShowSnippet[]> {
  if (!query) return [];

  const res = await fetch(
    `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    throw new Error("There was an issue fetching shows.");
  }

  const data = (await res.json()) as TVMazeSearchItem[];
  const dbUser = await ensureDbUser();
  const tvmazeIds = data.map((item) => item.show.id);

  const existingShows = await prisma.userShow.findMany({
    where: {
      userId: dbUser.id,
      show: {
        tvmazeId: { in: tvmazeIds },
      },
    },
    include: { show: true },
  });

  const libraryMap = new Map<number, WatchStatus>();

  existingShows.forEach((record) => {
    if (!record.show) return;

    libraryMap.set(record.show.tvmazeId, record.status);
  });

  return data.map((item) => ({
    tvmazeId: item.show.id,
    name: item.show.name,
    imageUrl: item.show.image?.medium ?? item.show.image?.original ?? null,
    status: libraryMap.get(item.show.id),
  }));
}

export async function addShow(show: ShowSnippet) {
  const dbUser = await ensureDbUser();

  const dbShow = await prisma.show.upsert({
    where: { tvmazeId: show.tvmazeId },
    update: { name: show.name, imageUrl: show.imageUrl ?? null },
    create: {
      tvmazeId: show.tvmazeId,
      name: show.name,
      imageUrl: show.imageUrl ?? null,
    },
    select: { id: true },
  });

  const status = (show.status as WatchStatus) ?? WatchStatus.PLANNED;

  await prisma.userShow.upsert({
    where: {
      userId_showId: {
        userId: dbUser.id,
        showId: dbShow.id,
      },
    },
    update: { status },
    create: {
      userId: dbUser.id,
      showId: dbShow.id,
      status,
    },
  });

  revalidatePath("/library");
  return true;
}

export async function updateShowStatus(showId: string, status: WatchStatus) {
  const dbUser = await ensureDbUser();

  await prisma.userShow.update({
    where: {
      userId_showId: {
        userId: dbUser.id,
        showId: showId,
      },
    },
    data: { status },
  });

  revalidatePath("/library");
  return true;
}
