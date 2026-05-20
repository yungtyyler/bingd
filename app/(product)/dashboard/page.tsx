import Link from "next/link";
import Image from "next/image";
import { ensureDbUser } from "@/lib/ensure-user";
import prisma from "@/lib/prisma";
import StatusSelect from "@/components/StatusSelect";
import EmptyState from "@/components/EmptyState";
import { WatchStatus } from "@/app/generated/prisma/enums";
import { Calendar, MonitorPlay } from "lucide-react";

const DashboardPage = async () => {
  const dbUser = await ensureDbUser();

  const [activeShows, upcomingShows] = await Promise.all([
    prisma.userShow.findMany({
      where: {
        userId: dbUser.id,
        status: WatchStatus.WATCHING,
      },
      include: { show: true },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),

    prisma.userShow.findMany({
      where: {
        userId: dbUser.id,
        show: {
          nextEpisodeDate: {
            gte: new Date(),
          },
        },
      },
      include: { show: true },
      orderBy: {
        show: { nextEpisodeDate: "asc" },
      },
      take: 4,
    }),
  ]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <header>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Welcome back, {dbUser.firstName || "Friend"}
        </h1>
        <p className="text-gray-400 mt-1">Here is your TV command center.</p>
      </header>

      {upcomingShows.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4 border-b border-surface-border pb-2">
            <Calendar className="w-4 h-4 text-brand-primary" />
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Upcoming Premieres
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {upcomingShows.map((entry) => {
              const formattedDate = entry.show?.nextEpisodeDate
                ? new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }).format(entry.show.nextEpisodeDate)
                : "Soon";

              return (
                <Link href={`/shows/${entry.show?.tvmazeId}`} key={entry.id}>
                  <div className="group border border-brand-primary/20 bg-brand-primary/5 rounded-xl p-4 flex items-center gap-4 shadow-[0_0_15px_rgba(34,197,94,0.05)] hover:border-brand-primary/50 hover:bg-brand-primary/10 transition-all cursor-pointer">
                    <div className="relative w-16 h-24 bg-black rounded-md overflow-hidden ring-1 ring-white/10 shrink-0">
                      {entry.show?.imageUrl ? (
                        <Image
                          src={entry.show.imageUrl}
                          alt={entry.show.name}
                          fill
                          sizes="64px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-surface-base" />
                      )}
                    </div>

                    <div className="flex flex-col justify-center overflow-hidden">
                      <p className="text-brand-primary font-bold text-sm tracking-tight mb-1">
                        {formattedDate}
                      </p>
                      <h3 className="font-extrabold text-white truncate text-lg group-hover:text-brand-primary transition-colors">
                        {entry.show?.name}
                      </h3>
                      {entry.show?.network && (
                        <p className="text-xs text-gray-400 font-medium mt-1 truncate">
                          on {entry.show.network}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {activeShows.length === 0 && upcomingShows.length === 0 ? (
        <EmptyState firstName={dbUser.firstName} />
      ) : activeShows.length > 0 ? (
        <section>
          <div className="flex items-center gap-2 mb-4 border-b border-surface-border pb-2">
            <MonitorPlay className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Continue Watching
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {activeShows.map((entry) => (
              <div
                key={entry.id}
                className="border border-surface-border bg-surface-card rounded-lg p-3 flex flex-col gap-2 shadow-sm hover:border-brand-primary/50 transition-colors"
              >
                <Link
                  href={`/shows/${entry.show?.tvmazeId}`}
                  className="group cursor-pointer flex flex-col gap-2"
                >
                  <div className="relative aspect-2/3 w-full bg-black rounded-md overflow-hidden ring-1 ring-white/5 group-hover:ring-brand-primary/50 transition-all">
                    {entry.show?.status === "Ended" && (
                      <div className="absolute top-2 right-2 z-10 bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-bold text-gray-300 uppercase tracking-wider px-2 py-1 rounded shadow-lg">
                        Ended
                      </div>
                    )}

                    {entry.show?.imageUrl ? (
                      <Image
                        src={entry.show.imageUrl}
                        alt={entry.show.name}
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
                    {entry.show?.name}
                  </h3>
                </Link>

                <div className="mt-auto pt-1">
                  <StatusSelect
                    showId={entry.showId}
                    initialStatus={entry.status}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default DashboardPage;
