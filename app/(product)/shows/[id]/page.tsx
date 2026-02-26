import AddShowButton from "@/components/AddShowButton";
import DeleteShowButton from "@/components/DeleteShowButton";
import StatusSelect from "@/components/StatusSelect";
import { ensureDbUser } from "@/lib/ensure-user";
import prisma from "@/lib/prisma";
import { ShowSnippet } from "@/types";
import Image from "next/image";
import { notFound } from "next/navigation";

const ShowPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const tvmazeId = parseInt(id, 10);

  if (isNaN(tvmazeId)) return notFound();

  const dbUser = ensureDbUser();

  const res = await fetch(`https://api.tvmaze.com/shows/${tvmazeId}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) return notFound();
  const tvmazeData = await res.json();

  const dbShow = await prisma.show.findUnique({
    where: { tvmazeId },
  });

  let userShow = null;
  if (dbShow) {
    userShow = await prisma.userShow.findUnique({
      where: {
        userId_showId: {
          userId: (await dbUser).id,
          showId: dbShow.id,
        },
      },
    });
  }

  const network = tvmazeData.network?.name;
  const webChannel = tvmazeData.webChannel?.name;
  const whereToWatch = webChannel || network || "Platform Unknown";

  const showSnippet: ShowSnippet = {
    tvmazeId: tvmazeData.id,
    name: tvmazeData.name,
    imageUrl: tvmazeData.image?.medium ?? tvmazeData.image?.original ?? null,
  };

  return (
    <main className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column: Poster & Actions */}
        <div className="w-full md:w-1/3 shrink-0 space-y-4">
          <div className="aspect-2/3 w-full bg-gray-100 rounded-xl overflow-hidden shadow-md">
            {tvmazeData.image?.original ? (
              <Image
                width={600}
                height={900}
                src={tvmazeData.image.original}
                alt={tvmazeData.name}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No Image
              </div>
            )}
          </div>

          {/* Library Management Box */}
          <div className="bg-gray-50 border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Your Library
            </h3>
            {userShow ? (
              <div className="space-y-4">
                <StatusSelect
                  initialStatus={userShow.status}
                  showId={dbShow!.id}
                />

                <DeleteShowButton
                  showId={dbShow!.id}
                  showName={tvmazeData.name}
                />
              </div>
            ) : (
              <AddShowButton show={showSnippet} />
            )}
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              {tvmazeData.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 font-medium">
              <span
                className={`px-2 py-1 rounded border ${
                  tvmazeData.status === "Ended"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-green-50 text-green-700 border-green-200"
                }`}
              >
                {tvmazeData.status}
              </span>
              <span>• {whereToWatch}</span>
              {tvmazeData.premiered && (
                <span>• Premiered {tvmazeData.premiered.substring(0, 4)}</span>
              )}
            </div>
          </div>

          {/* Genres */}
          {tvmazeData.genres?.length > 0 && (
            <div className="flex gap-2">
              {tvmazeData.genres.map((genre: string) => (
                <span
                  key={genre}
                  className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-600"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Synopsis */}
          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-semibold mb-2">Synopsis</h2>
            <div
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html:
                  tvmazeData.summary || "<p>No description available.</p>",
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default ShowPage;
