import Link from "next/link";
import { redirect } from "next/navigation";
import { UserRound, Search, Building2, Shield, ClipboardCheck } from "lucide-react";
import { getSession } from "@/modules/auth/session";
import { LoginForm } from "@/modules/auth/LoginForm";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";

export const dynamic = "force-dynamic";

const roles = [
  { icon: UserRound, label: "Students", color: "sh-info", desc: "Profile, jobs, hours, pay" },
  { icon: Search, label: "Staff", color: "sh-success", desc: "Requests, candidates, CVs, time" },
  { icon: Building2, label: "Companies", color: "sh-warning", desc: "Requests, candidates, invoices" },
  { icon: Shield, label: "Admin", color: "sh-error", desc: "Finance, approvals, migration" },
  { icon: ClipboardCheck, label: "Inspectors", color: "sh-info", desc: "ID review, document queues" }
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
    <main className="min-h-svh relative overflow-hidden bg-[var(--paper)] dark:bg-[#090d14]">
      {/* ── Animated gradient background ── */}
      <div className="shLoginGradient" aria-hidden="true" />

      {/* ── Glass navbar ── */}
      <nav className="relative z-20 mx-auto w-[min(1160px,calc(100%_-_28px))] sticky top-3 shGlassBase shGlassRadiusLg min-h-[56px] flex items-center justify-between gap-3.5 p-2">
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
                    <Icon className="size-5" aria-hidden="true" />
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
          </section>
        </div>

        {/* ── Bottom: Role detail cards as glass panels ── */}
        <section
          className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5"
          aria-label="Workspace roles overview"
        >
          {roles.map(({ icon: Icon, label, desc }) => (
            <article
              key={label}
              className="shGlassBase shGlassRadiusMd p-3.5 grid gap-1.5"
            >
              <Icon className="size-4 text-[var(--sh-info)] shrink-0" aria-hidden="true" />
              <span className="text-[var(--muted)] text-[11px] font-black uppercase">{label}</span>
              <strong className="text-[13px]">{desc}</strong>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
