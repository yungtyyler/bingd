import { searchShows } from "@/actions/shows";
import AddShowButton from "@/components/AddShowButton";
import Searchbar from "@/components/Searchbar";
import { ensureDbUser } from "@/lib/ensure-user";

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
              {r.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.imageUrl}
                  alt={r.name}
                  className="w-full rounded-md mb-2"
                />
              ) : (
                <div className="w-full aspect-2/3 rounded-md bg-black/10 mb-2" />
              )}
              <div className="font-medium">{r.name}</div>
              <AddShowButton show={r} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default SearchPage;
