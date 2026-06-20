export default function AdminDegreeLoading() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "var(--border)", borderTopColor: "var(--sh-primary)" }}
        />
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Loading degrees…
        </p>
      </div>
    </div>
  );
}
