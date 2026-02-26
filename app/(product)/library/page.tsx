import StatusSelect from "@/components/StatusSelect";
import LibraryTabs from "@/components/LibraryTabs";
import { ensureDbUser } from "@/lib/ensure-user";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { WatchStatus } from "@/app/generated/prisma/enums";

const LibraryPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) => {
  const dbUser = await ensureDbUser();
  const { status } = await searchParams;

  const validStatuses = Object.values(WatchStatus);
  const currentFilter = validStatuses.includes(status as WatchStatus)
    ? (status as WatchStatus)
    : undefined;

  const shows = await prisma.userShow.findMany({
    where: {
      userId: dbUser.id,
      ...(currentFilter ? { status: currentFilter } : {}),
    },
    include: { show: true },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Library</h1>
        <Link
          href="/search"
          className="bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded text-white text-sm font-medium"
        >
          + Add Show
        </Link>
      </div>

      <LibraryTabs currentFilter={currentFilter} />

      {shows.length === 0 ? (
        <p className="text-gray-500">
          No shows tracked yet. Go search for some!
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {shows.map((entry) => (
            <div
              key={entry.id}
              className="border rounded-lg p-3 flex flex-col gap-2 shadow-sm"
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

                <h3 className="font-semibold truncate group-hover:text-blue-600 transition-colors">
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
