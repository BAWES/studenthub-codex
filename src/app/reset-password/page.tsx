import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/session";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/app");

  const params = await searchParams;
  const token = params.token ?? "";

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
            Set a new password<br />
            <span className="bg-gradient-to-r from-[var(--ink)] to-[var(--sh-coral)] bg-clip-text text-transparent">
              Choose something you haven&apos;t used before.
            </span>
          </h1>

          <p className="max-w-[480px] text-[clamp(15px,1.4vw,18px)] leading-[1.5] text-[var(--muted)] mt-3">
            Your new password must be at least 8 characters with an uppercase
            letter and a number or special character.
          </p>

          <div className="flex flex-wrap gap-2 mt-[18px]">
            {["Encrypted", "One-time link", "Expires in 15 min"].map(
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
                Set new password
              </strong>
              <p className="m-0 text-sm leading-[1.45] text-[var(--muted)]">
                Create a strong password for your account.
              </p>
            </div>

            <ResetPasswordForm token={token} />
          </div>
        </div>
      </div>
    </main>
  );
}
