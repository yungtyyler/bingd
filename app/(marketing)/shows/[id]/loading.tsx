export default function ShowDetailLoading() {
  return (
    <div className="mx-auto mt-4 max-w-5xl animate-pulse p-6 md:p-10">
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="w-full md:w-1/3">
          <div className="aspect-2/3 w-full rounded-xl bg-surface-border shadow-lg" />
        </div>

        <div className="w-full space-y-6 pt-4 md:w-2/3">
          <div className="h-10 w-3/4 rounded bg-surface-border" />

          <div className="flex gap-3">
            <div className="h-6 w-16 rounded-full bg-surface-border" />
            <div className="h-6 w-20 rounded-full bg-surface-border" />
            <div className="h-6 w-24 rounded-full bg-surface-border" />
          </div>

          <div className="mt-8 space-y-3">
            <div className="h-4 w-full rounded bg-surface-border" />
            <div className="h-4 w-full rounded bg-surface-border" />
            <div className="h-4 w-5/6 rounded bg-surface-border" />
            <div className="h-4 w-4/5 rounded bg-surface-border" />
          </div>

          <div className="mt-8 h-32 w-full max-w-md rounded-xl border border-surface-border bg-surface-card" />
        </div>
      </div>
    </div>
  );
}

