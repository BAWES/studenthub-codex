export default function Loading() {
  return (
    <div className="p-6 space-y-6" aria-hidden="true">
      <div className="space-y-2">
        <div className="h-4 w-16 rounded bg-muted animate-pulse" />
        <div className="h-8 w-32 rounded bg-muted animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
      <div className="h-16 rounded-xl bg-muted animate-pulse" />
      <div className="rounded-xl bg-muted animate-pulse overflow-hidden">
        <div className="h-10 bg-muted" />
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-12 border-t border-border"
            style={{ opacity: 1 - i * 0.08 }} />
        ))}
      </div>
    </div>
  );
}
