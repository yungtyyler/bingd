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

  const showSnippet: ShowSnippet = {
    tvmazeId: tvmazeData.id,
    name: tvmazeData.name,
    imageUrl: tvmazeData.image?.medium ?? tvmazeData.image?.original ?? null,
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 mt-4">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
          <div className="relative aspect-2/3 w-full bg-black rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
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
              <div className="flex items-center justify-center w-full h-full text-sm text-gray-600 bg-surface-base">
                No Image Available
              </div>
            )}
          </div>
        </div>

        <div className="w-full md:w-2/3 space-y-6 pt-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            {tvmazeData.name}
          </h1>

          {tvmazeData.genres && tvmazeData.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tvmazeData.genres.map((genre: string) => (
                <span
                  key={genre}
                  className="px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-surface-border text-gray-300 rounded-full"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          <div
            className="text-gray-400 leading-relaxed text-lg"
            dangerouslySetInnerHTML={{
              __html: tvmazeData.summary || "No description available.",
            }}
          />

          <div className="mt-8 max-w-md bg-surface-card border border-surface-border rounded-xl p-5 shadow-lg">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
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
      </div>
    </div>
  );
};

export default ShowPage;
