export default function ShowDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 animate-pulse mt-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column: Big Poster */}
        <div className="w-full md:w-1/3">
          <div className="aspect-2/3 w-full bg-surface-border rounded-xl shadow-lg"></div>
        </div>

        {/* Right Column: Details */}
        <div className="w-full md:w-2/3 space-y-6 pt-4">
          <div className="h-10 w-3/4 bg-surface-border rounded"></div>

          {/* Genre Badges */}
          <div className="flex gap-3">
            <div className="h-6 w-16 bg-surface-border rounded-full"></div>
            <div className="h-6 w-20 bg-surface-border rounded-full"></div>
            <div className="h-6 w-24 bg-surface-border rounded-full"></div>
          </div>

          {/* Summary Paragraph */}
          <div className="space-y-3 mt-8">
            <div className="h-4 w-full bg-surface-border rounded"></div>
            <div className="h-4 w-full bg-surface-border rounded"></div>
            <div className="h-4 w-5/6 bg-surface-border rounded"></div>
            <div className="h-4 w-4/5 bg-surface-border rounded"></div>
          </div>

          {/* Library Management Box */}
          <div className="h-32 w-full max-w-md bg-surface-card border border-surface-border rounded-xl mt-8"></div>
        </div>
      </div>
    </div>
  );
}
