import Link from "next/link";
import { Tv } from "lucide-react";

export default function EmptyState({
  firstName,
}: {
  firstName?: string | null;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-surface-card border border-surface-border rounded-2xl shadow-sm mt-8">
      <div className="p-4 bg-black rounded-full border border-surface-border mb-6">
        <Tv className="w-10 h-10 text-brand-primary" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-3">
        {firstName
          ? `Welcome to bingd, ${firstName}!`
          : "Your library is empty."}
      </h2>

      <p className="text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
        It&apos;s time to start building your ultimate watchlist. Search for
        your favorite shows to track your progress and never forget what episode
        you were on.
      </p>

      <Link href="/search">
        <button className="px-6 py-3 text-sm font-bold text-black bg-brand-primary rounded-full hover:bg-brand-primary-hover hover:scale-105 transition-all shadow-[0_0_15px_rgba(34,197,94,0.2)]">
          Search for a Show
        </button>
      </Link>
    </div>
  );
}
