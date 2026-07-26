"use client";

import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-black px-6 py-16 text-white">
      <section className="w-full max-w-md rounded-lg border border-surface-border bg-surface-card p-6 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
          <AlertTriangle className="h-6 w-6 text-red-400" aria-hidden="true" />
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight">
          Something went sideways.
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-400">
          bingd hit a temporary error. Try again, or head back home and reopen
          the page.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={reset}
            className="flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-brand-primary-hover"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try Again
          </button>

          <Link
            href="/dashboard"
            className="flex min-h-10 items-center justify-center gap-2 rounded-lg border border-surface-border bg-surface-base px-4 py-2 text-sm font-bold text-white transition-colors hover:border-brand-primary/50"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Go Home
          </Link>
        </div>
      </section>
    </main>
  );
}
