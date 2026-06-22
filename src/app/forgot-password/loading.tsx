export default function ForgotPasswordLoading() {
  return (
    <main className="min-h-svh grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(400px,520px)] bg-background max-lg:grid-rows-[auto_minmax(0,1fr)]">
      {/* ── Brand side skeleton ─────────────────────────────────────── */}
      <div className="relative grid content-center gap-4 p-[clamp(32px,5vw,64px)] overflow-hidden max-md:p-5 max-md:pt-5 max-md:pb-2">
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-sh-coral/10"
          aria-hidden="true"
        />

        <div className="relative z-[1]">
          {/* Logo area */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="size-11 rounded-xl bg-muted animate-pulse max-md:size-9" />
            <div className="h-6 w-28 rounded bg-muted animate-pulse max-md:hidden" />
          </div>

          {/* Heading */}
          <div className="space-y-2 mb-3">
            <div className="h-[clamp(40px,5vw,72px)] w-[80%] rounded bg-muted animate-pulse" />
            <div className="h-[clamp(24px,3vw,40px)] w-[65%] rounded bg-muted animate-pulse" />
          </div>

          {/* Description */}
          <div className="space-y-1.5 mt-3">
            <div className="h-4 w-full max-w-[480px] rounded bg-muted animate-pulse" />
            <div className="h-4 w-[70%] max-w-[360px] rounded bg-muted animate-pulse" />
          </div>

          {/* Badge pills */}
          <div className="flex gap-2 mt-[18px] max-md:hidden">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[26px] w-[120px] rounded-full bg-muted animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Form side skeleton ──────────────────────────────────────── */}
      <div className="grid content-center p-6 bg-card border-l border-border max-md:border-l-0 max-md:p-3">
        <div className="w-full max-w-[420px] mx-auto">
          <div className="rounded-lg bg-card border border-border shadow-sm overflow-hidden">
            <div className="grid gap-1 px-7 pt-7 pb-3 max-md:px-5 max-md:pt-5 max-md:pb-2">
              <div className="h-7 w-44 rounded bg-muted animate-pulse" />
              <div className="h-4 w-56 rounded bg-muted animate-pulse mt-1" />
            </div>

            <div className="px-7 pb-7 grid gap-4 max-md:px-5 max-md:pb-5">
              {/* Label */}
              <div className="grid gap-2">
                <div className="h-4 w-12 rounded bg-muted animate-pulse" />
                <div className="h-[50px] rounded-lg bg-muted animate-pulse" />
              </div>

              {/* Button */}
              <div className="h-[52px] w-full rounded-lg bg-muted animate-pulse" />

              {/* Back link */}
              <div className="h-4 w-28 rounded bg-muted animate-pulse mx-auto mt-2" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
