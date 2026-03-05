import Link from "next/link";
import Image from "next/image";
import { ensureDbUser } from "@/lib/ensure-user";
import prisma from "@/lib/prisma";
import StatusSelect from "@/components/StatusSelect";
import EmptyState from "@/components/EmptyState";
import { WatchStatus } from "@/app/generated/prisma/client";

const DashboardPage = async () => {
  const dbUser = await ensureDbUser();

  const activeShows = await prisma.userShow.findMany({
    where: {
      userId: dbUser.id,
      status: WatchStatus.WATCHING,
    },
    include: { show: true },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Welcome back, {dbUser.firstName || "Friend"}
        </h1>
        <p className="text-gray-400 mt-1">
          Here is what you are currently watching.
        </p>
      </header>

      {activeShows.length === 0 ? (
        <div className="mt-4">
          <EmptyState firstName={dbUser.firstName} />
        </div>
      ) : (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-surface-border pb-2">
            Continue Watching
          </h2>

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
      )}
    </div>
  );
};

export default DashboardPage;
