export default function SearchLoading() {
  return (
    <main className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-24 bg-surface-border rounded"></div>

      {/* Searchbar Skeleton */}
      <div className="h-12 w-full bg-surface-border rounded-lg mb-6"></div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="border border-surface-border bg-surface-card rounded-lg p-3 flex flex-col gap-2"
          >
            <div className="aspect-2/3 w-full bg-surface-border rounded-md"></div>
            <div className="h-5 w-3/4 bg-surface-border rounded mt-1"></div>
            <div className="h-8 w-full bg-surface-border rounded mt-auto"></div>
          </div>
        ))}
      </div>
    </main>
  );
}
