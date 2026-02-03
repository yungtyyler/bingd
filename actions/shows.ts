"use server";

import { ensureDbUser } from "@/lib/ensure-user";
import prisma from "@/lib/prisma";
import { TVMazeSearchItem } from "@/types";
import { revalidatePath } from "next/cache";
import { WatchStatus } from "@/app/generated/prisma/client";

export async function searchShows(query: string) {
  if (!query) return [];

  const res = await fetch(
    `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    throw new Error("There was an issue fetching shows.");
  }

  const data = (await res.json()) as TVMazeSearchItem[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((item: any) => {
    return {
      tvmazeId: item.show.id,
      name: item.show.name,
      imageUrl: item.show.image?.medium ?? item.show.image?.original ?? null,
    };
  });
}

export async function addShow(params: {
  tvmazeId: number;
  name: string;
  imageUrl?: string;
  status?: WatchStatus;
}) {
  const dbUser = await ensureDbUser();

  // 1. Ensure the Show exists in our global table
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

  // 2. Link it to the User
  await prisma.userShow.upsert({
    where: {
      userId_showId: {
        userId: dbUser.id,
        showId: show.id,
      },
    },
    // If it exists, we might want to just return, or update status if provided
    update: params.status ? { status: params.status } : {},
    create: {
      userId: dbUser.id,
      showId: show.id,
      status: params.status ?? "PLANNED",
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
