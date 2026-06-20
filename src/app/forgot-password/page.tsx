import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/session";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage() {
  const session = await getSession();
  if (session) redirect("/app");

  return (
    <main className="min-h-svh grid grid-cols-[minmax(0,1fr)_minmax(400px,520px)] bg-[var(--paper)] max-[900px]:grid-cols-1 max-[900px]:grid-rows-[auto_minmax(0,1fr)]">
      {/* ── Brand side ──────────────────────────────────────────── */}
      <div className="relative grid content-center gap-4 p-[clamp(32px,5vw,64px)] overflow-hidden">
        <div className="absolute inset-0 shLoginGradient" aria-hidden="true" />

        <div className="relative z-1 animate-[shLoginBrandFadeIn_600ms_var(--sh-easing)_both]">
          <div className="inline-flex items-center gap-[10px] mb-3">
            <span className="w-11 h-11 inline-flex items-center justify-center rounded-xl bg-[#1f73b7] text-white text-lg font-black">
              SH
            </span>
            <strong className="text-xl font-bold text-[var(--ink)]">
              StudentHub
            </strong>
          </div>

          <h1 className="m-0 text-[clamp(40px,5vw,72px)] leading-[0.92] font-extrabold tracking-[-0.03em] text-[var(--ink)]">
            Forgot your password?<br />
            <span className="bg-gradient-to-r from-[var(--ink)] to-[var(--sh-coral)] bg-clip-text text-transparent">
              Don&apos;t worry — it happens to the best of us.
            </span>
          </h1>

          <p className="max-w-[480px] text-[clamp(15px,1.4vw,18px)] leading-[1.5] text-[var(--muted)] mt-3">
            Enter the email address associated with your account and we&apos;ll
            send you a link to reset your password.
          </p>

          <div className="flex flex-wrap gap-2 mt-[18px]">
            {["Encrypted tokens", "One-time use", "15 min expiry"].map(
              (item) => (
                <span
                  key={item}
                  className="min-h-8 inline-flex items-center px-3 rounded-full text-[11px] font-black uppercase tracking-[0.03em] bg-[var(--sh-coral-light)] border border-[color-mix(in_srgb,var(--sh-coral)_20%,transparent)] text-[var(--sh-coral)]"
                >
                  {item}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── Form side ────────────────────────────────────────────── */}
      <div className="grid content-center p-6 bg-[var(--surface)] border-l border-[var(--line)] max-[900px]:border-l-0 max-[900px]:p-4">
        <div className="w-full max-w-[420px] mx-auto">
          <div className="rounded-[var(--sh-radius-xl)] bg-[var(--surface)] border border-[var(--line)] shadow-[var(--shadow-sm)] overflow-hidden animate-[shLoginFormIn_400ms_var(--sh-easing)_both] [animation-delay:60ms]">
            <div className="grid gap-1 px-7 pt-7 pb-3 animate-[shLoginFormIn_500ms_var(--sh-easing)_both] [animation-delay:80ms]">
              <strong className="text-2xl font-bold leading-[1.15] text-[var(--ink)]">
                Reset your password
              </strong>
              <p className="m-0 text-sm leading-[1.45] text-[var(--muted)]">
                We&apos;ll send a reset link to your email.
              </p>
            </div>

            <ForgotPasswordForm />
          </div>
        </div>
      </div>
    </main>
  );
}
