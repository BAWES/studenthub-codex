import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="min-h-svh grid place-items-center bg-[var(--paper)] p-4 sm:p-8">
      <div className="w-full max-w-[480px] rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_18px_50px_rgba(16,24,40,0.08)] p-8 sm:p-10 text-center grid gap-5">
        {/* Coral 404 icon circle */}
        <div className="mx-auto size-16 rounded-full flex items-center justify-center bg-[#eb6651]">
          <span className="text-white text-2xl font-black tracking-[-0.03em]">404</span>
        </div>

        {/* Heading */}
        <div className="grid gap-2">
          <h1 className="text-[var(--ink)] text-2xl font-bold tracking-[-0.02em] m-0">
            Page not found
          </h1>
          <p className="text-[var(--muted)] text-[15px] leading-relaxed m-0 max-w-[380px] mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg text-sm font-semibold text-white no-underline transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] bg-[#eb6651] hover:bg-[#d45441]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Back to homepage
        </Link>

        {/* Footer */}
        <div className="flex items-center justify-center gap-3 text-[12px] text-[#a09d98]">
          <span className="font-mono">Error 404</span>
          <span aria-hidden="true">·</span>
          <span suppressHydrationWarning className="font-mono">
            {getCurrentTime()}
          </span>
        </div>
      </div>
    </main>
  );
}

function getCurrentTime(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
