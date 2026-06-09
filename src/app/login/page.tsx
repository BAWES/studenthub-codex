import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/session";
import { LoginForm } from "@/modules/auth/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
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

      {/* ── Floating ambient orbs ── */}
      <div className="shOrb shOrbA" aria-hidden="true" />
      <div className="shOrb shOrbB" aria-hidden="true" />
      <div className="shOrb shOrbC" aria-hidden="true" />

      {/* ── Centered glass login card ── */}
      <div className="relative z-10 mx-auto w-full max-w-[420px] px-5">
        <section
          className="shGlassElevated shGlassRadiusXl overflow-hidden shLoginCard"
          aria-label="StudentHub sign in"
        >
          {/* ── Brand mark ── */}
          <div className="flex justify-center pt-10 pb-2">
            <span className="size-12 inline-flex items-center justify-center rounded-xl bg-[var(--ink)] text-[var(--paper)] font-black text-lg shadow-lg">
              SH
            </span>
          </div>

          {params.error === "expired" ? (
            <p className="text-[var(--destructive)] font-bold m-0 px-6 pt-0 pb-0 text-sm text-center">
              That verified account choice expired. Sign in again to continue.
            </p>
          ) : null}
          {params.error === "account" ? (
            <p className="text-[var(--destructive)] font-bold m-0 px-6 pt-0 pb-0 text-sm text-center">
              Choose a verified account to continue.
            </p>
          ) : null}

          <LoginForm />

          <div className="text-center pb-10">
            <p className="text-[13px] text-[var(--muted)] m-0">
              No account?{" "}
              <a
                href="/signup"
                className="text-[var(--sh-info)] font-semibold no-underline hover:underline transition-all duration-200"
              >
                Create one
              </a>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
