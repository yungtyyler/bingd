import { getMobileUser, isWatchStatus } from "@/app/api/mobile/_helpers";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type ShowRouteProps = {
  params: Promise<{ showId: string }>;
};

export async function PATCH(request: NextRequest, { params }: ShowRouteProps) {
  const { dbUser, response } = await getMobileUser();

  if (!dbUser) {
    return response;
  }

  const { showId } = await params;
  const body = (await request.json()) as { status?: unknown };

  if (!isWatchStatus(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  await prisma.userShow.update({
    where: {
      userId_showId: {
        userId: dbUser.id,
        showId,
      },
    },
    data: { status: body.status },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(_request: NextRequest, { params }: ShowRouteProps) {
  const { dbUser, response } = await getMobileUser();

  if (!dbUser) {
    return response;
  }

  const { showId } = await params;

  await prisma.userShow.delete({
    where: {
      userId_showId: {
        userId: dbUser.id,
        showId,
      },
    },
  });

  return NextResponse.json({ success: true });
}
