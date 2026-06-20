export default function EmployerJobDetailLoading() {
  return (
    <div className="shell shellEmbedded">
      <section className="min-w-0 overflow-x-hidden grid content-start gap-3.5 p-3.5">
        <section className="topbar">
          <div>
            <div className="h-3 w-24 mb-2 rounded bg-white/5 animate-pulse" />
            <div className="h-7 w-48 rounded bg-white/5 animate-pulse" />
          </div>
        </section>
        <div className="space-y-4">
          <div className="h-10 w-full rounded-lg bg-white/5 animate-pulse" />
          <div className="h-64 w-full rounded-xl bg-white/5 animate-pulse" />
        </div>
      </section>
    </div>
  );
}
