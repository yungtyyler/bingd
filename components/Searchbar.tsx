"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const Searchbar = ({ initialQuery }: { initialQuery: string }) => {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onSubmit(e: any) {
    e.preventDefault();

    const q = value.trim();
    const params = new URLSearchParams();

    if (q) params.set("q", q);

    router.push(`/search?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search TV shows..."
        className="w-full rounded-md border px-3 py-2"
      />
      <button className="rounded-md border px-4 py-2">Search</button>
    </form>
  );
};

export default Searchbar;
