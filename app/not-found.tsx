import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-black px-6 py-16 text-white">
      <section className="w-full max-w-md rounded-lg border border-surface-border bg-surface-card p-6 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-brand-primary/30 bg-brand-primary/10">
          <Search className="h-6 w-6 text-brand-primary" aria-hidden="true" />
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight">
          Page Not Found
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-400">
          This page does not exist, or the link you opened no longer points to
          an active bingd screen.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/dashboard"
            className="flex min-h-10 items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-brand-primary-hover"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Go Home
          </Link>

          <Link
            href="/search"
            className="flex min-h-10 items-center justify-center gap-2 rounded-lg border border-surface-border bg-surface-base px-4 py-2 text-sm font-bold text-white transition-colors hover:border-brand-primary/50"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Search Shows
          </Link>
        </div>
      </section>
    </main>
  );
}
