export default function CompanyAccountDetailLoading() {
  return (
<<<<<<< Updated upstream
    <div className="min-h-screen p-6">
      <section className="space-y-6">
        <section className="flex items-center justify-between gap-4">
=======
    <div className="shell shellEmbedded">
      <section className="min-w-0 overflow-x-hidden grid content-start gap-3.5 p-3.5">
        <section className="topbar">
>>>>>>> Stashed changes
          <div>
            <div className="h-3 w-24 mb-2 rounded bg-white/5 animate-pulse" />
            <div className="h-7 w-48 rounded bg-white/5 animate-pulse" />
          </div>
          <div className="flex gap-3">
            <div className="h-3 w-20 rounded bg-white/5 animate-pulse" />
            <div className="h-3 w-20 rounded bg-white/5 animate-pulse" />
          </div>
        </section>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
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
            <div key={col} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
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
