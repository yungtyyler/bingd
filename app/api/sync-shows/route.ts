import prisma from "@/lib/prisma";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const shows = await prisma.show.findMany();
    let updatedCount = 0;

    for (const show of shows) {
      await new Promise((resolve) => setTimeout(resolve, 250));

      const res = await fetch(`https://api.tvmaze.com/shows/${show.tvmazeId}`);
      if (!res.ok) continue;

      const tvmazeData = await res.json();

      const networkName =
        tvmazeData.network?.name || tvmazeData.webChannel?.name || null;
      let nextEpisodeDate: Date | null = null;
      let nextEpisodeTvmazeId: number | null = null;
      let nextEpisodeName: string | null = null;
      let nextEpisodeSeason: number | null = null;
      let nextEpisodeNumber: number | null = null;

      if (tvmazeData._links?.nextepisode?.href) {
        const nextEpRes = await fetch(tvmazeData._links.nextepisode.href);
        if (nextEpRes.ok) {
          const nextEpData = await nextEpRes.json();
          nextEpisodeDate = nextEpData.airstamp
            ? new Date(nextEpData.airstamp)
            : null;
          nextEpisodeTvmazeId = nextEpData.id ?? null;
          nextEpisodeName = nextEpData.name ?? null;
          nextEpisodeSeason = nextEpData.season ?? null;
          nextEpisodeNumber = nextEpData.number ?? null;
        }
      }

      await prisma.show.update({
        where: { id: show.id },
        data: {
          status: tvmazeData.status || null,
          network: networkName,
          nextEpisodeDate,
          nextEpisodeTvmazeId,
          nextEpisodeName,
          nextEpisodeSeason,
          nextEpisodeNumber,
        },
      });

      updatedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${updatedCount} shows.`,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { success: false, error: "Sync failed" },
      { status: 500 },
    );
  }
}
