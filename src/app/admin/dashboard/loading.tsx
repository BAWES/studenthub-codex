export default function AdminDashboardLoading() {
  return (
    <div className="p-6 space-y-6" aria-hidden="true">
      <div className="space-y-2">
        <div className="h-4 w-16 rounded bg-white/5 animate-pulse" />
        <div className="h-8 w-48 rounded bg-white/5 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-white/5 animate-pulse h-64" />
        <div className="rounded-xl bg-white/5 animate-pulse h-64" />
      </div>
    </div>
  );
}
