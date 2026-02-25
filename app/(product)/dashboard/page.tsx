import { getDashboardShows } from "@/actions/shows";
import { ensureDbUser } from "@/lib/ensure-user";
import Image from "next/image";
import Link from "next/link";

const DashboardPage = async () => {
  const dbUser = await ensureDbUser();
  const shows = await getDashboardShows(dbUser.id);

  return (
    <main className="p-6 md:p-10 space-y-8 max-w-6xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-gray-500 text-sm">
          Here is what is up next on your watch list.
        </p>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">Currently Watching</h2>

        {shows.length === 0 ? (
          <div className="bg-gray-50 border border-dashed rounded-xl p-8 text-center space-y-3">
            <p className="text-gray-500">
              You aren&apos;t watching anything right now.
            </p>
            <Link
              href="/library"
              className="inline-block bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
            >
              Browse your Library
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shows.map((show) => {
              // Extract TVMaze status safely
              const apiStatus = show.tvmazeData?.status;
              const isEnded = apiStatus === "Ended";
              const network =
                show.tvmazeData?.network?.name ||
                show.tvmazeData?.webChannel?.name;

              return (
                <div
                  key={show.id}
                  className="flex gap-4 p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Thumbnail */}
                  <div className="w-24 h-36 shrink-0 bg-gray-100 rounded-lg overflow-hidden relative">
                    {show.show?.imageUrl ? (
                      <Image
                        width={96}
                        height={144}
                        src={show.show?.imageUrl ?? ""}
                        alt={show.show?.name ?? ""}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-col flex-1 py-1">
                    <h3 className="font-bold text-lg leading-tight line-clamp-2 mb-1 text-black">
                      {show.show?.name}
                    </h3>

                    {network && (
                      <p className="text-xs text-gray-500 font-medium mb-3">
                        {network}
                      </p>
                    )}

                    <div className="mt-auto space-y-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          isEnded
                            ? "bg-red-50 text-red-700"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        {apiStatus || "Unknown Status"}
                      </span>

                      {/* Add "Log Episode" button here later... */}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default DashboardPage;
