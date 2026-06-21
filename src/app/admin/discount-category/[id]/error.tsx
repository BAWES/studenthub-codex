"use client";

export default function AdminDiscountCategoryDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
      <h2 className="text-lg font-semibold text-destructive">Failed to load discount category</h2>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <button
        onClick={() => reset()}
        className="text-sm underline text-primary hover:text-primary/80"
      >
        Try again
      </button>
    </div>
  );
}
