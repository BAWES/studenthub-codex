export default function EmployerApplicationDetailLoading() {
  return (
    <div className="shell shellEmbedded">
      <section className="min-w-0 overflow-x-hidden grid content-start gap-3.5 p-3.5">
        <section className="topbar">
          <div>
            <div className="h-3 w-32 mb-2 rounded bg-white/5 animate-pulse" />
            <div className="h-7 w-56 rounded bg-white/5 animate-pulse" />
          </div>
        </section>
        <div className="max-w-3xl space-y-6 mt-8">
          <div className="rounded-xl border p-6 space-y-4" style={{ borderColor: "var(--border)" }}>
            <div className="h-5 w-40 rounded bg-white/5 animate-pulse" />
            <div className="h-4 w-full rounded bg-white/5 animate-pulse" />
            <div className="h-4 w-3/4 rounded bg-white/5 animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-white/5 animate-pulse" />
            <div className="h-4 w-2/3 rounded bg-white/5 animate-pulse" />
          </div>
          <div className="rounded-xl border p-6 space-y-4" style={{ borderColor: "var(--border)" }}>
            <div className="h-5 w-28 rounded bg-white/5 animate-pulse" />
            <div className="h-4 w-full rounded bg-white/5 animate-pulse" />
            <div className="h-4 w-full rounded bg-white/5 animate-pulse" />
            <div className="h-4 w-3/4 rounded bg-white/5 animate-pulse" />
          </div>
        </div>
      </section>
    </div>
  );
}
