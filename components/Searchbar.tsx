"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

const Searchbar = ({ initialQuery }: { initialQuery: string }) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);

    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }

    replace(`${pathname}?${params.toString()}`);
  }, 150);

  return (
    <div className="relative flex flex-1 shrink-0 w-full mb-6">
      <label htmlFor="search" className="sr-only">
        Search for a TV show
      </label>
      <input
        id="search"
        type="text"
        defaultValue={initialQuery}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search for a TV show (e.g. Severance, The Last of Us)..."
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
      />
    </div>
  );
};

export default Searchbar;
