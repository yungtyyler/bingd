import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata = { title: "Offline | bingd" };

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-black px-6 py-16 text-white">
      <section className="w-full max-w-md rounded-lg border border-surface-border bg-surface-card p-6 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-brand-primary/30 bg-brand-primary/10">
          <WifiOff className="h-6 w-6 text-brand-primary" aria-hidden="true" />
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight">
          You are offline
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-400">
          bingd needs a connection to refresh shows, sync your library, and
          load new activity.
        </p>

        <Link
          href="/dashboard"
          className="mt-6 flex min-h-10 items-center justify-center rounded-lg bg-brand-primary px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-brand-primary-hover"
        >
          Try Again
        </Link>
      </section>
    </main>
  );
}
