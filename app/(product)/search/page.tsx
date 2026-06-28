/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import Link from "next/link";
import { ensureDbUser } from "@/lib/ensure-user";
import prisma from "@/lib/prisma";
import { searchShows } from "@/actions/shows";
import FollowButton from "@/components/FollowButton";
import Searchbar from "@/components/Searchbar";
import StatusSelect from "@/components/StatusSelect";
import AddShowButton from "@/components/AddShowButton";
import { WatchStatus } from "@/app/generated/prisma/enums";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const dbUser = await ensureDbUser();

  let shows: any[] = [];
  let users: any[] = [];
  let followingIds = new Set<string>();
  const userShowsMap = new Map<
    number,
    { status: WatchStatus; internalShowId: string }
  >();

  if (q) {
    const [fetchedShows, fetchedUsers] = await Promise.all([
      searchShows(q),
      prisma.user.findMany({
        where: {
          id: { not: dbUser.id },
          OR: [
            { username: { contains: q, mode: "insensitive" } },
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
    ]);

    shows = fetchedShows;
    users = fetchedUsers;

    if (shows.length > 0) {
      const tvmazeIds = shows.map((s) => s.tvmazeId);

      const trackedShows = await prisma.userShow.findMany({
        where: {
          userId: dbUser.id,
          show: {
            tvmazeId: { in: tvmazeIds },
          },
        },
        include: {
          show: true,
        },
      });

      trackedShows.forEach((userShow) => {
        if (userShow.show?.tvmazeId) {
          userShowsMap.set(userShow.show.tvmazeId, {
            status: userShow.status,
            internalShowId: userShow.showId,
          });
        }
      });
    }

    if (users.length > 0) {
      const follows = await prisma.follows.findMany({
        where: {
          followerId: dbUser.id,
          followingId: { in: users.map((u) => u.id) },
        },
      });
      followingIds = new Set(follows.map((f) => f.followingId));
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12 sm:p-8">
      <header>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Search
        </h1>
        <p className="text-gray-400 mt-1">
          {q
            ? `Showing results for "${q}"`
            : "Find shows to watch and friends to follow."}
        </p>
      </header>

      <div className="max-w-2xl">
        <Searchbar variant="page" />
      </div>

      {!q && (
        <div className="text-center p-12 border border-surface-border rounded-xl">
          <p className="text-gray-500">
            Use the search bar in the header to get started.
          </p>
        </div>
      )}

      {q && (
        <div className="space-y-12">
          {/* --- SECTION 1: PEOPLE --- */}
          {users.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-surface-border pb-2">
                People
              </h2>
              <div className="flex flex-col gap-4 max-w-3xl">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-surface-card border border-surface-border rounded-xl hover:border-brand-primary/30 transition-colors"
                  >
                    <Link
                      href={`/u/${user.username}`}
                      className="flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-full bg-surface-base border border-surface-border flex items-center justify-center overflow-hidden relative">
                        {user.profileImageUrl ? (
                          <Image
                            src={user.profileImageUrl}
                            alt={user.username}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="font-bold text-gray-400 uppercase">
                            {user.firstName?.charAt(0) || "U"}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-white hover:text-brand-primary transition-colors">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          @{user.username}
                        </p>
                      </div>
                    </Link>

                    <FollowButton
                      targetUserId={user.id}
                      initialIsFollowing={followingIds.has(user.id)}
                      username={user.username}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* --- SECTION 2: SHOWS --- */}
          {shows.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-surface-border pb-2">
                Shows
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {shows.map((show) => {
                  const trackedData = userShowsMap.get(Number(show.tvmazeId));
                  const isTracked = !!trackedData;

                  return (
                    <div
                      key={show.tvmazeId}
                      className="border border-surface-border bg-surface-card rounded-lg p-3 flex flex-col gap-2 shadow-sm relative"
                    >
                      <Link
                        href={`/shows/${show.tvmazeId}`}
                        className="group cursor-pointer flex flex-col gap-2"
                      >
                        <div className="relative aspect-2/3 w-full bg-black rounded-md overflow-hidden ring-1 ring-white/5 group-hover:ring-brand-primary/50 transition-all">
                          {show.imageUrl ? (
                            <Image
                              src={show.imageUrl}
                              alt={show.name}
                              fill
                              sizes="(max-width: 768px) 50vw, 25vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full text-xs text-gray-600 bg-surface-base">
                              No Image
                            </div>
                          )}
                        </div>
                        <h3 className="font-bold tracking-tight text-white truncate group-hover:text-brand-primary transition-colors">
                          {show.name}
                        </h3>
                      </Link>

                      {/* CONDITIONAL SHOW CONTROLS */}
                      <div className="mt-auto pt-1 z-10 relative">
                        {isTracked ? (
                          <StatusSelect
                            showId={trackedData.internalShowId}
                            initialStatus={trackedData.status}
                          />
                        ) : (
                          <AddShowButton show={show} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {users.length === 0 && shows.length === 0 && (
            <div className="text-center p-12 border border-surface-border rounded-xl">
              <p className="text-gray-500">
                We couldn&apos;t find anyone or anything matching that search.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
