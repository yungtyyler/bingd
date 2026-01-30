import Searchbar from "@/components/Searchbar";
import { ensureDbUser } from "@/lib/ensure-user";

type TVMazeSearchItem = {
  show: {
    tvmazeId: number;
    name: string;
    image: { medium?: string; original?: string } | null;
  };
};

const SearchPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) => {
  await ensureDbUser();
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const results = query.length >= 2 ? await fetchShows(query) : [];

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

              {/* Phase 1: Add button comes later (server action) */}
              <form action="/app/search" className="mt-2">
                <input type="hidden" name="q" value={query} />
              </form>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

async function fetchShows(query: string) {
  const res = await fetch(
    `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    throw new Error("There was an issue fetching shows.");
  }

  const data = (await res.json()) as TVMazeSearchItem[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((item: any) => {
    return {
      tvmazeId: item.show.id,
      name: item.show.name,
      imageUrl: item.show.image?.medium ?? item.show.image?.original ?? null,
    };
  });
}

export default SearchPage;
