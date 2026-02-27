import StatusSelect from "@/components/StatusSelect";
import LibraryTabs from "@/components/LibraryTabs";
import LibrarySort from "@/components/LibrarySort";
import { ensureDbUser } from "@/lib/ensure-user";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { WatchStatus } from "@/app/generated/prisma/enums";

const LibraryPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; sort?: string }>;
}) => {
  const dbUser = await ensureDbUser();
  const { status, sort } = await searchParams;

  const validStatuses = Object.values(WatchStatus);
  const currentFilter = validStatuses.includes(status as WatchStatus)
    ? (status as WatchStatus)
    : undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderByClause: any = [{ updatedAt: "desc" }];

  if (sort === "alpha") {
    orderByClause = [{ show: { name: "asc" } }];
  }

  const shows = await prisma.userShow.findMany({
    where: {
      userId: dbUser.id,
      ...(currentFilter ? { status: currentFilter } : {}),
    },
    include: { show: true },
    orderBy: orderByClause,
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Library</h1>
        <Link
          href="/search"
          className="bg-brand-primary hover:bg-brand-primary-hover transition-colors px-4 py-2 rounded text-white text-sm font-medium"
        >
          + Add Show
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b pb-4">
        <LibraryTabs currentFilter={currentFilter} />
        <LibrarySort />
      </div>

      {shows.length === 0 ? (
        <p className="text-gray-500">
          No shows tracked yet. Go search for some!
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {shows.map((entry) => (
            <div
              key={entry.id}
              className="border border-surface-border bg-surface-card rounded-lg p-3 flex flex-col gap-2 shadow-sm hover:border-brand-primary/50 transition-colors"
            >
              <Link
                href={`/shows/${entry.show?.tvmazeId}`}
                className="group cursor-pointer flex flex-col gap-2"
              >
                <div className="relative aspect-2/3 w-full bg-gray-100 rounded-md overflow-hidden">
                  {entry.show?.imageUrl ? (
                    <Image
                      src={entry.show.imageUrl}
                      alt={entry.show.name}
                      fill // FILL replaces width/height
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-xs text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                <h3 className="font-semibold truncate group-hover:text-brand-primary-hover transition-colors">
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
      )}
    </div>
  );
};

export default LibraryPage;
