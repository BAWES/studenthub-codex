export default function CandidateApplicationDetailLoading() {
  return (
    <div className="block">
      <section className="overflow-x-hidden grid content-start gap-3.5 p-3.5">
        <section className="sticky top-2.5 z-20 flex items-center justify-between gap-3 min-h-14 px-4 mb-1 rounded-lg bg-card border border-border">
          <div>
            <div className="h-3 w-24 mb-2 rounded bg-white/5 animate-pulse" />
            <div className="h-7 w-48 rounded bg-white/5 animate-pulse" />
          </div>
        </section>
        <div className="p-6 space-y-4">
          <div className="h-6 w-40 rounded bg-white/5 animate-pulse" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-4 w-24 rounded bg-white/5 animate-pulse" />
                <div className="h-4 w-48 rounded bg-white/5 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
