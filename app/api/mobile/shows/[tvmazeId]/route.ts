import {
  getMobileUser,
  serializeLibraryEntry,
} from "@/app/api/mobile/_helpers";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type ShowRouteProps = {
  params: Promise<{ tvmazeId: string }>;
};

type TVMazeShow = {
  id: number;
  name: string;
  summary?: string | null;
  genres?: string[];
  status?: string | null;
  premiered?: string | null;
  network?: { name?: string | null } | null;
  webChannel?: { name?: string | null } | null;
  image?: { medium?: string | null; original?: string | null } | null;
  _links?: {
    nextepisode?: { href?: string | null };
  };
};

type TVMazeEpisode = {
  name?: string | null;
  season?: number | null;
  number?: number | null;
  airstamp?: string | null;
};

function stripHtml(value?: string | null) {
  return value?.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() || "";
}

export async function GET(_request: NextRequest, { params }: ShowRouteProps) {
  const { dbUser, response } = await getMobileUser();

  if (!dbUser) {
    return response;
  }

  const { tvmazeId: rawTvmazeId } = await params;
  const tvmazeId = Number.parseInt(rawTvmazeId, 10);

  if (Number.isNaN(tvmazeId)) {
    return NextResponse.json({ error: "Invalid show." }, { status: 400 });
  }

  const tvmazeResponse = await fetch(`https://api.tvmaze.com/shows/${tvmazeId}`, {
    next: { revalidate: 3600 },
  });

  if (!tvmazeResponse.ok) {
    return NextResponse.json({ error: "Show not found." }, { status: 404 });
  }

  const tvmazeData = (await tvmazeResponse.json()) as TVMazeShow;
  const networkName = tvmazeData.network?.name || tvmazeData.webChannel?.name || null;
  let nextEpisode: TVMazeEpisode | null = null;

  if (tvmazeData._links?.nextepisode?.href) {
    const episodeResponse = await fetch(tvmazeData._links.nextepisode.href, {
      next: { revalidate: 3600 },
    });

    if (episodeResponse.ok) {
      nextEpisode = (await episodeResponse.json()) as TVMazeEpisode;
    }
  }

  const dbShow = await prisma.show.findUnique({
    where: { tvmazeId },
  });
  const userShow = dbShow
    ? await prisma.userShow.findUnique({
        where: {
          userId_showId: {
            userId: dbUser.id,
            showId: dbShow.id,
          },
        },
        include: { show: true },
      })
    : null;

  return NextResponse.json({
    show: {
      tvmazeId: tvmazeData.id,
      name: tvmazeData.name,
      summary: stripHtml(tvmazeData.summary),
      imageUrl: tvmazeData.image?.original || tvmazeData.image?.medium || null,
      status: tvmazeData.status || null,
      network: networkName,
      premiered: tvmazeData.premiered || null,
      genres: tvmazeData.genres || [],
      nextEpisodeDate: nextEpisode?.airstamp || dbShow?.nextEpisodeDate?.toISOString() || null,
      nextEpisodeName: nextEpisode?.name || dbShow?.nextEpisodeName || null,
      nextEpisodeSeason: nextEpisode?.season || dbShow?.nextEpisodeSeason || null,
      nextEpisodeNumber: nextEpisode?.number || dbShow?.nextEpisodeNumber || null,
      libraryEntry: userShow ? serializeLibraryEntry(userShow) : null,
    },
  });
}
