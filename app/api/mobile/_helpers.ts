import { WatchStatus } from "@/app/generated/prisma/enums";
import { ensureDbUser } from "@/lib/ensure-user";
import { isPendingUsername } from "@/lib/usernames";
import { NextResponse } from "next/server";

export async function getMobileUser() {
  try {
    const dbUser = await ensureDbUser();
    return { dbUser, response: null };
  } catch {
    return {
      dbUser: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
}

export function serializeUser(user: {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}) {
  return {
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    profileImageUrl: user.profileImageUrl,
    needsUsername: isPendingUsername(user.username),
  };
}

export function serializeLibraryEntry(entry: {
  id: string;
  showId: string;
  status: WatchStatus;
  updatedAt: Date;
  show: {
    tvmazeId: number;
    name: string;
    imageUrl: string | null;
    status: string | null;
    network: string | null;
    nextEpisodeDate: Date | null;
    nextEpisodeSeason: number | null;
    nextEpisodeNumber: number | null;
  } | null;
}) {
  return {
    id: entry.id,
    showId: entry.showId,
    status: entry.status,
    updatedAt: entry.updatedAt.toISOString(),
    show: entry.show
      ? {
          tvmazeId: entry.show.tvmazeId,
          name: entry.show.name,
          imageUrl: entry.show.imageUrl,
          status: entry.show.status,
          network: entry.show.network,
          nextEpisodeDate: entry.show.nextEpisodeDate?.toISOString() ?? null,
          nextEpisodeSeason: entry.show.nextEpisodeSeason,
          nextEpisodeNumber: entry.show.nextEpisodeNumber,
        }
      : null,
  };
}

export function isWatchStatus(value: unknown): value is WatchStatus {
  return (
    value === WatchStatus.PLANNED ||
    value === WatchStatus.WATCHING ||
    value === WatchStatus.COMPLETED ||
    value === WatchStatus.DROPPED
  );
}
