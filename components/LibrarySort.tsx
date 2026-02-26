"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const LibrarySort = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { replace } = useRouter();

  const currentSort = searchParams.get("sort") || "recent";

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams);

    params.set("sort", e.target.value);
    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm font-medium text-gray-500">
        Sort:
      </label>
      <select
        id="sort"
        value={currentSort}
        onChange={handleSortChange}
        className="text-sm border-none bg-transparent py-1 pl-1 pr-6 text-gray-700 font-medium focus:ring-0 cursor-pointer"
      >
        <option value="recent">Recently Updated</option>
        <option value="alpha">Alphabetical (A-Z)</option>
      </select>
    </div>
  );
};

export default LibrarySort;
