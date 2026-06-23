export default function CandidateDetailLoading() {
  return (
    <div className="block">
      <section className="overflow-x-hidden grid content-start gap-3.5 p-3.5">
        <section className="sticky top-2.5 z-20 flex items-center justify-between gap-3 min-h-14 px-4 mb-1 rounded-lg bg-card border border-border">
          <div>
            <div className="h-3 w-24 mb-2 rounded bg-white/5 animate-pulse" />
            <div className="h-7 w-48 rounded bg-white/5 animate-pulse" />
          </div>
          <div className="flex gap-3">
            <div className="h-3 w-20 rounded bg-white/5 animate-pulse" />
            <div className="h-3 w-20 rounded bg-white/5 animate-pulse" />
          </div>
        </section>
        <div className="rounded-lg border border-border bg-muted p-5">
          <div className="h-5 w-40 mb-4 rounded bg-white/5 animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 w-24 rounded bg-white/5 animate-pulse" />
                <div className="h-3 w-32 rounded bg-white/5 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {[1, 2].map((col) => (
            <div key={col} className="rounded-lg border border-border bg-muted p-5">
              <div className="h-5 w-32 mb-4 rounded bg-white/5 animate-pulse" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-3 w-20 rounded bg-white/5 animate-pulse" />
                    <div className="h-3 w-28 rounded bg-white/5 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
