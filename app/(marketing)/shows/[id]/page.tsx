import AddShowButton from "@/components/AddShowButton";
import DeleteShowButton from "@/components/DeleteShowButton";
import StatusSelect from "@/components/StatusSelect";
import { WatchStatus } from "@/app/generated/prisma/enums";
import { ensureDbUser } from "@/lib/ensure-user";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";
import { isPendingUsername } from "@/lib/usernames";
import prisma from "@/lib/prisma";
import { ShowSnippet } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

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
};

type ShowPageProps = {
  params: Promise<{ id: string }>;
};

function stripHtml(value?: string | null) {
  return value?.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() || "";
}

async function getTVMazeShow(tvmazeId: number) {
  const res = await fetch(`https://api.tvmaze.com/shows/${tvmazeId}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) return null;

  return (await res.json()) as TVMazeShow;
}

export async function generateMetadata({
  params,
}: ShowPageProps): Promise<Metadata> {
  const { id } = await params;
  const tvmazeId = parseInt(id, 10);

  if (isNaN(tvmazeId)) {
    return createPageMetadata({
      title: "Show Not Found",
      path: `/shows/${id}`,
      noIndex: true,
    });
  }

  const tvmazeData = await getTVMazeShow(tvmazeId);

  if (!tvmazeData) {
    return createPageMetadata({
      title: "Show Not Found",
      path: `/shows/${id}`,
      noIndex: true,
    });
  }

  const summary = stripHtml(tvmazeData.summary);
  const description =
    summary ||
    `Track ${tvmazeData.name}, add it to your watchlist, and get notified when new episodes are coming up.`;

  return createPageMetadata({
    title: `${tvmazeData.name} TV show tracker`,
    description: description.slice(0, 160),
    path: `/shows/${tvmazeData.id}`,
    image: tvmazeData.image?.original || tvmazeData.image?.medium || undefined,
  });
}

const ShowPage = async ({ params }: ShowPageProps) => {
  const { id } = await params;
  const tvmazeId = parseInt(id, 10);

  if (isNaN(tvmazeId)) return notFound();

  const tvmazeData = await getTVMazeShow(tvmazeId);

  if (!tvmazeData) return notFound();

  const { userId } = await auth();
  const dbUser = userId ? await ensureDbUser() : null;

  const dbShow = await prisma.show.findUnique({
    where: { tvmazeId },
  });

  const userShow =
    dbUser && dbShow && !isPendingUsername(dbUser.username)
      ? await prisma.userShow.findUnique({
          where: {
            userId_showId: {
              userId: dbUser.id,
              showId: dbShow.id,
            },
          },
        })
      : null;

  const showSnippet: ShowSnippet = {
    tvmazeId: tvmazeData.id,
    name: tvmazeData.name,
    imageUrl: tvmazeData.image?.medium ?? tvmazeData.image?.original ?? null,
    status: userShow?.status as WatchStatus | undefined,
  };
  const summary = stripHtml(tvmazeData.summary);
  const networkName = tvmazeData.network?.name || tvmazeData.webChannel?.name;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: tvmazeData.name,
    url: absoluteUrl(`/shows/${tvmazeData.id}`),
    description: summary || undefined,
    image: tvmazeData.image?.original || tvmazeData.image?.medium || undefined,
    genre: tvmazeData.genres,
    datePublished: tvmazeData.premiered || undefined,
  };

  return (
    <div className="mx-auto mt-4 max-w-5xl p-6 md:p-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="w-full md:w-1/3">
          <div className="relative aspect-2/3 w-full overflow-hidden rounded-xl bg-black shadow-[0_0_30px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
            {showSnippet.imageUrl ? (
              <Image
                priority
                src={showSnippet.imageUrl}
                alt={showSnippet.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-surface-base text-sm text-gray-600">
                No Image Available
              </div>
            )}
          </div>
        </div>

        <div className="w-full space-y-6 pt-4 md:w-2/3">
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              {tvmazeData.name}
            </h1>
            {(networkName || tvmazeData.status) && (
              <p className="text-sm font-medium text-gray-500">
                {[networkName, tvmazeData.status].filter(Boolean).join(" • ")}
              </p>
            )}
          </div>

          {tvmazeData.genres && tvmazeData.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tvmazeData.genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full bg-surface-border px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-300"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          <div
            className="text-lg leading-relaxed text-gray-400"
            dangerouslySetInnerHTML={{
              __html: tvmazeData.summary || "No description available.",
            }}
          />

          <div className="mt-8 max-w-md rounded-xl border border-surface-border bg-surface-card p-5 shadow-lg">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-500">
              Your Library
            </h2>
            {dbUser && isPendingUsername(dbUser.username) ? (
              <Link
                href="/onboarding/username"
                className="flex min-h-10 w-full items-center justify-center rounded-md bg-brand-primary px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-brand-primary-hover"
              >
                Choose a username to save this show
              </Link>
            ) : userShow && dbShow ? (
              <div className="space-y-4">
                <StatusSelect
                  initialStatus={userShow.status}
                  showId={dbShow.id}
                />
                <DeleteShowButton
                  showId={dbShow.id}
                  showName={tvmazeData.name}
                />
              </div>
            ) : dbUser ? (
              <AddShowButton show={showSnippet} />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <SignUpButton mode="modal">
                  <button className="min-h-10 rounded-md bg-brand-primary px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-brand-primary-hover">
                    Add to Library
                  </button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button className="min-h-10 rounded-md border border-surface-border bg-surface-base px-4 py-2 text-sm font-bold text-white transition-colors hover:border-brand-primary/50">
                    Sign In
                  </button>
                </SignInButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowPage;
