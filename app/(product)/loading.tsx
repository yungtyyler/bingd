const AppLoading = () => {
  return (
    <main className="p-6 md:p-10 space-y-8 max-w-6xl mx-auto w-full animate-pulse">
      {/* Header Placeholder */}
      <div className="space-y-3">
        <div className="h-8 bg-gray-200 rounded-md w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded-md w-1/3"></div>
      </div>

      {/* Grid Placeholder (Mimics your Library/Search cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 pt-4">
        {/* Generate 10 blank cards */}
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            {/* Image Box */}
            <div className="aspect-2/3 w-full bg-gray-200 rounded-xl"></div>
            {/* Title Line */}
            <div className="h-4 bg-gray-200 rounded w-3/4 mt-2"></div>
            {/* Subtitle/Status Line */}
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default AppLoading;
