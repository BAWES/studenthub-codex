"use client";

export default function AdminSalaryListError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="text-sm text-destructive">
        Failed to load salaries: {error.message}
      </div>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-lg px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  );
}
