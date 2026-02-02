"use server";

import { ensureDbUser } from "@/lib/ensure-user";
import prisma from "@/lib/prisma";
import { TVMazeSearchItem } from "@/types";

export async function searchShows(query: string) {
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

  await prisma.userShow
    .upsert({
      where: { userId_showId: { userId: dbUser.id, showId: show.id } },
      update: {},
      create: { userId: dbUser.id, showId: show.id },
    })
    .catch((error) => {
      throw new Error(error);
    });

  return true;
}
