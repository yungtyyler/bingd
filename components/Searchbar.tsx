"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";

interface SearchbarProps {
  variant?: "header" | "page";
}

const Searchbar = ({ variant = "page" }: SearchbarProps) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { push, replace } = useRouter();

  const [searchTerm, setSearchTerm] = useState(
    variant === "page" ? searchParams.get("q")?.toString() || "" : "",
  );

  useEffect(() => {
    if (variant === "page") {
      const urlQuery = searchParams.get("q")?.toString() || "";

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchTerm((prev) => {
        if (prev !== urlQuery) return urlQuery;
        return prev;
      });
    }
  }, [searchParams, variant]);

  const handleDebouncedSearch = useDebouncedCallback((term: string) => {
    if (variant !== "page") return;

    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 150);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);

    if (variant === "page") {
      handleDebouncedSearch(val);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (variant === "header" && searchTerm.trim()) {
      push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex flex-1 shrink-0 w-full"
    >
      <label htmlFor={`search-${variant}`} className="sr-only">
        Search for shows or people
      </label>
      <input
        id={`search-${variant}`}
        type="text"
        value={searchTerm}
        onChange={handleChange}
        placeholder="Search shows or people..."
        className="w-full h-10 rounded-full bg-surface-base border border-surface-border px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all shadow-sm"
      />
    </form>
  );
};

export default Searchbar;
