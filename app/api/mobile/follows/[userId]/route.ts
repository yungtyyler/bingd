import { getMobileUser } from "@/app/api/mobile/_helpers";
import prisma from "@/lib/prisma";
import { isPendingUsername } from "@/lib/usernames";
import { NextRequest, NextResponse } from "next/server";

type FollowRouteProps = {
  params: Promise<{ userId: string }>;
};

async function getFollowTarget(userId: string, currentUserId: string) {
  if (userId === currentUserId) {
    return {
      target: null,
      response: NextResponse.json(
        { error: "You cannot follow yourself." },
        { status: 400 },
      ),
    };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true },
  });

  if (!target || isPendingUsername(target.username)) {
    return {
      target: null,
      response: NextResponse.json({ error: "User not found." }, { status: 404 }),
    };
  }

  return { target, response: null };
}

export async function POST(_request: NextRequest, { params }: FollowRouteProps) {
  const { dbUser, response } = await getMobileUser();

  if (!dbUser) {
    return response;
  }

  const { userId } = await params;
  const { target, response: targetResponse } = await getFollowTarget(
    userId,
    dbUser.id,
  );

  if (!target) {
    return targetResponse;
  }

  await prisma.follows.upsert({
    where: {
      followerId_followingId: {
        followerId: dbUser.id,
        followingId: target.id,
      },
    },
    update: {},
    create: {
      followerId: dbUser.id,
      followingId: target.id,
    },
  });

  return NextResponse.json({ isFollowing: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: FollowRouteProps,
) {
  const { dbUser, response } = await getMobileUser();

  if (!dbUser) {
    return response;
  }

  const { userId } = await params;
  await prisma.follows.deleteMany({
    where: {
      followerId: dbUser.id,
      followingId: userId,
    },
  });

  return NextResponse.json({ isFollowing: false });
}
