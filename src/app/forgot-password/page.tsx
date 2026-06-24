import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/session";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage() {
  const session = await getSession();
  if (session) redirect("/app");

  return (
    <main className="min-h-[100svh] grid grid-cols-[1fr_minmax(400px,520px)] bg-background max-md:grid-cols-1 max-md:grid-rows-[auto_1fr]">
      {/* ── Brand side ──────────────────────────────────────────── */}
      <div className="relative grid content-center gap-4 px-[clamp(32px,5vw,64px)] py-[clamp(32px,5vw,64px)] overflow-hidden max-md:p-5 max-md:pt-5 max-md:pb-2 max-md:min-h-auto">
        <div className="shLoginGradient" aria-hidden="true" />

        <div className="relative z-[1] animate-[shLoginBrandFadeIn_600ms_var(--sh-easing)_both] max-md:flex max-md:items-center max-md:gap-4 max-md:flex-wrap">
          <div className="inline-flex items-center gap-[10px] mb-3 max-md:mb-0">
            <span className="size-[44px] inline-flex items-center justify-center rounded-xl bg-foreground text-background text-lg font-black max-md:size-[36px] max-md:text-sm">
              SH
            </span>
            <strong className="text-xl font-bold text-foreground max-md:hidden">
              StudentHub
            </strong>
          </div>

          <h1 className="m-0 text-[clamp(40px,5vw,72px)] leading-[0.92] font-extrabold tracking-[-0.03em] text-foreground max-md:text-[clamp(24px,6vw,32px)]">
            Forgot your password?<br />
            <span className="bg-gradient-to-br from-foreground to-coral bg-clip-text text-transparent">
              Don&apos;t worry — it happens to the best of us.
            </span>
          </h1>

          <p className="max-w-[480px] text-[clamp(15px,1.4vw,18px)] leading-relaxed text-muted-foreground mt-3">
            Enter the email address associated with your account and we&apos;ll
            send you a link to reset your password.
          </p>

          <div className="flex flex-wrap gap-2 mt-[18px] max-md:hidden">
            {["Encrypted tokens", "One-time use", "15 min expiry"].map(
              (item) => (
                <span
                  key={item}
                  className="min-h-[32px] inline-flex items-center px-3 rounded-full text-[11px] font-black uppercase tracking-[0.03em] bg-[#fef1ef] border border-coral/20 text-coral"
                >
                  {item}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── Form side ────────────────────────────────────────────── */}
      <div className="grid content-center p-6 bg-card border-l border-border max-md:border-l-0 max-md:p-3">
        <div className="w-full max-w-[420px] mx-auto">
          <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden animate-[shLoginFormIn_400ms_var(--sh-easing)_both] [animation-delay:60ms]">
            <div className="grid gap-1 px-7 pt-7 pb-3 max-md:px-5 max-md:pt-5 max-md:pb-2">
              <strong className="text-2xl font-bold leading-[1.15] text-foreground max-md:text-xl">
                Reset your password
              </strong>
              <p className="m-0 text-sm leading-[1.45] text-muted-foreground">
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
