import {
  getMobileUser,
  serializeLibraryEntry,
} from "@/app/api/mobile/_helpers";
import prisma from "@/lib/prisma";
import { PENDING_USERNAME_PREFIX } from "@/lib/usernames";
import { NextResponse } from "next/server";

function serializeFriendActivity(activity: Parameters<typeof serializeLibraryEntry>[0] & {
  user: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  } | null;
}) {
  return {
    ...serializeLibraryEntry(activity),
    user: activity.user
      ? {
          id: activity.user.id,
          username: activity.user.username,
          firstName: activity.user.firstName,
          lastName: activity.user.lastName,
          profileImageUrl: activity.user.profileImageUrl,
        }
      : null,
    show: activity.show
      ? {
          tvmazeId: activity.show.tvmazeId,
          name: activity.show.name,
          imageUrl: activity.show.imageUrl,
          network: activity.show.network,
        }
      : null,
  };
}

export async function GET() {
  const { dbUser, response } = await getMobileUser();

  if (!dbUser) {
    return response;
  }

  const following = await prisma.follows.findMany({
    where: { followerId: dbUser.id },
    select: { followingId: true },
  });

  const followingIds = following.map((follow) => follow.followingId);

  if (followingIds.length === 0) {
    return NextResponse.json({
      followingCount: 0,
      activities: [],
    });
  }

  const activities = await prisma.userShow.findMany({
    where: {
      userId: { in: followingIds },
      user: {
        username: {
          not: {
            startsWith: PENDING_USERNAME_PREFIX,
          },
        },
      },
    },
    include: {
      show: true,
      user: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 30,
  });

  return NextResponse.json({
    followingCount: followingIds.length,
    activities: activities.map(serializeFriendActivity),
  });
}
