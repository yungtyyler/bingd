import {
  getMobileUser,
  isWatchStatus,
  serializeLibraryEntry,
} from "@/app/api/mobile/_helpers";
import { WatchStatus } from "@/app/generated/prisma/enums";
import { addShow } from "@/actions/shows";
import prisma from "@/lib/prisma";
import { ShowSnippet } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { dbUser, response } = await getMobileUser();

  if (!dbUser) {
    return response;
  }

  const status = request.nextUrl.searchParams.get("status");
  const sort = request.nextUrl.searchParams.get("sort");
  const currentFilter = isWatchStatus(status) ? status : undefined;

  const entries = await prisma.userShow.findMany({
    where: {
      userId: dbUser.id,
      ...(currentFilter ? { status: currentFilter } : {}),
    },
    include: { show: true },
    orderBy:
      sort === "alpha" ? [{ show: { name: "asc" } }] : [{ updatedAt: "desc" }],
  });

  return NextResponse.json({ entries: entries.map(serializeLibraryEntry) });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<ShowSnippet>;

  if (
    typeof body.tvmazeId !== "number" ||
    typeof body.name !== "string" ||
    (body.status && !isWatchStatus(body.status))
  ) {
    return NextResponse.json({ error: "Invalid show." }, { status: 400 });
  }

  await addShow({
    tvmazeId: body.tvmazeId,
    name: body.name,
    imageUrl: body.imageUrl ?? null,
    status: body.status ?? WatchStatus.PLANNED,
  });

  return NextResponse.json({ success: true });
}
