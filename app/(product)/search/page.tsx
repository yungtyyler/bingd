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
            <li key={r.tvmazeId} className="rounded-lg border p-3">
              <Link
                href={`/shows/${r.tvmazeId}`}
                className="group cursor-pointer"
              >
                {r.imageUrl ? (
                  <Image
                    priority
                    width={200}
                    height={400}
                    src={r.imageUrl}
                    alt={r.name}
                    className="w-full rounded-md mb-2"
                  />
                ) : (
                  <div className="w-full aspect-2/3 rounded-md bg-black/10 mb-2" />
                )}
                <div className="font-medium">{r.name}</div>
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
