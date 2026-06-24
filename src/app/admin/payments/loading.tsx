export default function Loading() {
  return (
    <div className="p-6 space-y-6" aria-hidden="true">
      <div className="space-y-2">
        <div className="h-4 w-16 rounded bg-white/5 animate-pulse" />
        <div className="h-8 w-32 rounded bg-white/5 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
      <div className="h-16 rounded-xl bg-white/5 animate-pulse" />
      <div className="rounded-xl bg-white/5 animate-pulse overflow-hidden">
        <div className="h-10 bg-white/5" />
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={`h-12 border-t border-white/5 ${i === 0 ? 'opacity-100' : i === 1 ? 'opacity-90' : i === 2 ? 'opacity-80' : i === 3 ? 'opacity-70' : i === 4 ? 'opacity-60' : i === 5 ? 'opacity-50' : i === 6 ? 'opacity-40' : i === 7 ? 'opacity-30' : i === 8 ? 'opacity-20' : 'opacity-10'}`} />
        ))}
      </div>
    </div>
  );
}
