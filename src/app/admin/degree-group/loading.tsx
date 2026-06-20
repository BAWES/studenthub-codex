export default function AdminDegreeGroupLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--sh-primary)]" />
        <p className="text-sm" style={{ color: "var(--muted)" }}>Loading degree groups...</p>
      </div>
    </div>
  );
}
