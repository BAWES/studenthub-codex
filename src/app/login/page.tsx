import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/session";
import { LoginForm } from "@/modules/auth/LoginForm";

export const dynamic = "force-dynamic";

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

      {/* ── Back link (subtle, top-left) ── */}
      <Link
        href="/"
        className="fixed top-4 left-4 z-20 inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--ink)] text-xs font-medium no-underline transition-colors duration-200"
      >
        <span className="size-7 inline-flex items-center justify-center rounded-md bg-[var(--ink)] text-[var(--paper)] font-black text-[10px]">
          SH
        </span>
        Back to StudentHub
      </Link>

      {/* ── Centered glass card ── */}
      <section
        className="relative z-10 w-full max-w-[420px] mx-auto px-4"
        aria-label="StudentHub sign in"
      >
        {/* Brand mark */}
        <div className="flex justify-center mb-8">
          <span className="size-12 inline-flex items-center justify-center rounded-xl bg-[var(--ink)] text-[var(--paper)] font-black text-sm shadow-[0_8px_24px_rgba(16,24,40,0.12)]">
            SH
          </span>
        </div>

        {/* Error messages */}
        {params.error === "expired" ? (
          <p className="text-[var(--destructive)] font-bold m-0 p-4 pb-0 text-sm text-center">
            That verified account choice expired. Sign in again to continue.
          </p>
        ) : null}
        {params.error === "account" ? (
          <p className="text-[var(--destructive)] font-bold m-0 p-4 pb-0 text-sm text-center">
            Choose a verified account to continue.
          </p>
        ) : null}

        {/* Login form */}
        <LoginForm />

        {/* Sign-up link */}
        <p className="text-center text-[var(--muted)] text-[13px] pb-7 sm:pb-9 m-0">
          No account?{" "}
          <Link href="/signup" className="text-[var(--sh-info)] font-semibold no-underline hover:underline">
            Sign up
          </Link>
        </p>
      </section>
    </main>
  );
}
