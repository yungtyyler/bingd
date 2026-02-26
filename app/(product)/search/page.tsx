import { searchShows } from "@/actions/shows";
import AddShowButton from "@/components/AddShowButton";
import Searchbar from "@/components/Searchbar";
import { ensureDbUser } from "@/lib/ensure-user";
import Image from "next/image";
import Link from "next/link";

const SearchPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) => {
  await ensureDbUser();
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const results = query.length >= 2 ? await searchShows(query) : [];

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Search</h1>

      <Searchbar initialQuery={query} />

      {query.length < 2 ? (
        <p className="text-sm opacity-70">
          Type at least 2 characters to search.
        </p>
      ) : results.length === 0 ? (
        <p className="text-sm opacity-70">No results.</p>
      ) : (
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {results.map((r) => (
            <li
              key={r.tvmazeId}
              className="rounded-lg border p-3 flex flex-col gap-2"
            >
              <Link
                href={`/shows/${r.tvmazeId}`}
                className="group cursor-pointer flex flex-col gap-2"
              >
                <div className="relative w-full aspect-2/3 rounded-md overflow-hidden bg-gray-100">
                  {r.imageUrl ? (
                    <Image
                      src={r.imageUrl}
                      alt={r.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-xs text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                <div className="font-medium truncate group-hover:text-blue-600 transition-colors">
                  {r.name}
                </div>
              </Link>

              <AddShowButton show={r} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default SearchPage;
