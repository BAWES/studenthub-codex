import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/session";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage() {
  const session = await getSession();
  if (session) redirect("/app");

  return (
    <main className="min-h-svh grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(400px,520px)] bg-background max-lg:grid-rows-[auto_minmax(0,1fr)]">
      {/* ── Brand side ──────────────────────────────────────────── */}
      <div className="relative grid content-center gap-4 p-[clamp(32px,5vw,64px)] overflow-hidden max-md:p-5 max-md:pt-5 max-md:pb-2">
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-[#eb6651]/10"
          aria-hidden="true"
        />

        <div className="relative z-[1] max-md:flex max-md:items-center max-md:gap-4 max-md:flex-wrap">
          <div className="inline-flex items-center gap-2.5 mb-3 max-md:mb-0">
            <span className="size-11 inline-flex items-center justify-center rounded-xl bg-foreground text-card text-lg font-black max-md:size-9 max-md:text-sm">
              SH
            </span>
            <strong className="text-xl font-bold text-foreground max-md:hidden">
              StudentHub
            </strong>
          </div>

          <h1 className="m-0 text-[clamp(40px,5vw,72px)] leading-[0.92] font-extrabold tracking-[-0.03em] text-foreground max-md:text-[clamp(24px,6vw,32px)]">
            Forgot your password?<br />
            <span className="bg-gradient-to-br from-foreground to-[#eb6651] bg-clip-text text-transparent">
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
                <Badge key={item} variant="outline" className="text-[#eb6651] text-[11px] font-black uppercase px-3 py-1.5">
                  {item}
                </Badge>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── Form side ────────────────────────────────────────────── */}
      <div className="grid content-center p-6 bg-card border-l border-border max-md:border-l-0 max-md:p-3">
        <div className="w-full max-w-[420px] mx-auto">
          <div className="rounded-lg bg-card border border-border shadow-sm overflow-hidden">
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
