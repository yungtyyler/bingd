export default function LibraryLoading() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse sm:p-8">
      {/* Header & Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-32 bg-surface-border rounded"></div>
        <div className="h-9 w-24 bg-surface-border rounded-md"></div>
      </div>

      {/* Tabs and Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-surface-border pb-4">
        <div className="flex gap-2 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-9 w-20 bg-surface-border rounded-full shrink-0"
            ></div>
          ))}
        </div>
        <div className="h-6 w-32 bg-surface-border rounded hidden sm:block"></div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-4">
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
    </div>
  );
}
