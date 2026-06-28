export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse sm:p-8">
      <div className="mb-8">
        <div className="h-10 w-64 bg-surface-border rounded mb-3"></div>
        <div className="h-5 w-48 bg-surface-border rounded"></div>
      </div>

      <div className="h-5 w-40 bg-surface-border rounded mb-4"></div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
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
    </div>
  );
}
