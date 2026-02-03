import { ensureDbUser } from "@/lib/ensure-user";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

const LibraryPage = async () => {
  const dbUser = await ensureDbUser();

  const shows = await prisma.userShow.findMany({
    where: { userId: dbUser.id },
    include: { show: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Library</h1>
        <Link
          href="/search"
          className="bg-blue-600 px-4 py-2 rounded text-white text-sm"
        >
          + Add Show
        </Link>
      </header>

      {shows.length === 0 ? (
        <p className="text-gray-500">
          No shows tracked yet. Go search for some!
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {shows.map((entry) => (
            <div
              key={entry.id}
              className="border rounded-lg p-4 flex flex-col gap-2"
            >
              <div className="relative aspect-2/3 w-full bg-gray-100 mb-2 rounded overflow-hidden">
                {entry.show?.imageUrl ? (
                  <Image
                    src={entry.show.imageUrl}
                    alt={entry.show.name}
                    className="object-cover w-full h-full"
                    width={200}
                    height={400}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              <h3 className="font-semibold truncate">{entry.show?.name}</h3>

              <div className="text-xs uppercase tracking-wider font-bold text-gray-500">
                {entry.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
