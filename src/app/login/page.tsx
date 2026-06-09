import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/session";
import { LoginForm } from "@/modules/auth/LoginForm";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";

export const dynamic = "force-dynamic";

const roles = [
  {
    icon: ({ className }: { className?: string }) => (
      <svg className={className} aria-hidden={true} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    label: "Candidate",
    color: "sh-info",
    desc: "Find work, track hours, get paid",
  },
  {
    icon: ({ className }: { className?: string }) => (
      <svg className={className} aria-hidden={true} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    label: "Company",
    color: "sh-success",
    desc: "Hire staff, manage stores, approve timesheets",
  },
  {
    icon: ({ className }: { className?: string }) => (
      <svg className={className} aria-hidden={true} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    label: "Inspector",
    color: "sh-warning",
    desc: "Monitor compliance and audit records",
  },
];

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/app");
  const params = await searchParams;

  return (
    <main className="min-h-svh relative grid place-items-center overflow-hidden bg-[var(--paper)] dark:bg-[#090d14]">
      {/* ── Animated gradient background ── */}
      <div className="shLoginGradient" aria-hidden="true" />

      {/* ── Top nav bar ── */}
      <nav className="absolute top-3 left-3 right-3 z-20 mx-auto max-w-[1200px] shGlassBase shGlassRadiusLg min-h-[56px] flex items-center justify-between gap-3.5 p-2">
        <Link
          className="inline-flex items-center gap-2.5 text-[var(--ink)] px-2 no-underline"
          href="/"
        >
          <span className="size-9 inline-flex items-center justify-center rounded-lg bg-[var(--ink)] text-[var(--surface)] font-black text-sm">
            SH
          </span>
          <strong className="text-sm">StudentHub</strong>
        </Link>
        <ThemeToggle />
      </nav>

      {/* ── Main content ── */}
      <div className="relative z-10 mx-auto w-[min(1160px,calc(100%_-_28px))] pt-[clamp(24px,5vh,64px)] pb-[42px]">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(380px,480px)] gap-8 lg:gap-12 items-start">

          {/* ── Left: Brand panel with floating role icons ── */}
          <section className="flex flex-col gap-6 pt-2 lg:pt-10">
            <span className="shHeroEyebrow">
              One StudentHub login
            </span>

            <h1 className="shHeroTitle">
              Sign in once.<br />
              <span className="shHeroHighlight">We&rsquo;ll open the right workspace.</span>
            </h1>

            <p className="shHeroBody">
              Your production credentials decide what you can see and do. One account, one workspace.
            </p>

            {/* ── Floating role icons panel ── */}
            <div className="shLoginRolePanel" aria-label="Workspace roles">
              {roles.map(({ icon: Icon, label, color, desc }) => (
                <div key={label} className="shLoginRoleItem">
                  <span className="shLoginRoleIcon" style={{ color: `var(--${color})` }}>
                    <Icon className="size-5" aria-hidden={true} />
                  </span>
                  <div className="shLoginRoleText">
                    <strong>{label}</strong>
                    <span className="text-[var(--muted)] text-[13px]">{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Right: Elevated glass login card ── */}
          <section
            className="shGlassElevated shGlassRadiusXl overflow-hidden shLoginCard"
            aria-label="StudentHub sign in"
          >
            {params.error === "expired" ? (
              <p className="text-[var(--destructive)] font-bold m-0 p-4 pb-0 text-sm">
                That verified account choice expired. Sign in again to continue.
              </p>
            ) : null}
            {params.error === "account" ? (
              <p className="text-[var(--destructive)] font-bold m-0 p-4 pb-0 text-sm">
                Choose a verified account to continue.
              </p>
            ) : null}
            <LoginForm />
            <div className="text-center pb-6">
              <p className="text-[13px] text-[var(--muted)] m-0">
                No account?{" "}
                <a href="/signup" className="text-[var(--sh-info)] font-semibold no-underline hover:underline">
                  Create one
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
