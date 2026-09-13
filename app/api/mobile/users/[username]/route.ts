import {
  getMobileUser,
  serializeLibraryEntry,
  serializeUser,
} from "@/app/api/mobile/_helpers";
import prisma from "@/lib/prisma";
import { isPendingUsername } from "@/lib/usernames";
import { NextRequest, NextResponse } from "next/server";

type UserRouteProps = {
  params: Promise<{ username: string }>;
};

export async function GET(_request: NextRequest, { params }: UserRouteProps) {
  const { dbUser, response } = await getMobileUser();

  if (!dbUser) {
    return response;
  }

  const { username } = await params;
  const normalizedUsername = username.toLowerCase();

  if (isPendingUsername(normalizedUsername)) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const profileUser = await prisma.user.findUnique({
    where: { username: normalizedUsername },
    include: {
      shows: {
        include: { show: true },
        orderBy: { updatedAt: "desc" },
      },
      _count: {
        select: { followers: true, following: true, shows: true },
      },
    },
  });

  if (!profileUser || isPendingUsername(profileUser.username)) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const follow = await prisma.follows.findUnique({
    where: {
      followerId_followingId: {
        followerId: dbUser.id,
        followingId: profileUser.id,
      },
    },
  });

  return NextResponse.json({
    user: {
      ...serializeUser(profileUser),
      isCurrentUser: profileUser.id === dbUser.id,
      isFollowing: !!follow,
      counts: {
        shows: profileUser._count.shows,
        followers: profileUser._count.followers,
        following: profileUser._count.following,
      },
    },
    entries: profileUser.shows.map(serializeLibraryEntry),
  });
}
