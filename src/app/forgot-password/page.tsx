import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/session";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage() {
  const session = await getSession();
  if (session) redirect("/app");

  return (
    <main className="min-h-svh grid lg:grid-cols-[1fr_minmax(400px,520px)] bg-background max-md:grid-cols-1 max-md:grid-rows-[auto_1fr]">
      {/* ── Brand side ──────────────────────────────────────────── */}
      <div className="relative grid content-center gap-4 px-8 lg:px-16 py-12 overflow-hidden max-md:p-5 max-md:pt-5 max-md:pb-2 max-md:min-h-auto">
        <div
          className="absolute inset-0 animate-[shLoginDrift_14s_ease-in-out_infinite_alternate]"
          style={{
            background: [
              "radial-gradient(ellipse 90% 70% at 0% 100%, color-mix(in srgb, #eb6651 18%, transparent) 0%, transparent 70%)",
              "radial-gradient(ellipse 80% 60% at 70% 0%, color-mix(in srgb, #eb6651 12%, transparent) 0%, transparent 60%)",
              "radial-gradient(ellipse 60% 50% at 100% 80%, color-mix(in srgb, var(--ring) 8%, transparent) 0%, transparent 60%)",
            ].join(","),
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 animate-[shLoginBrandFadeIn_600ms_var(--sh-easing)_both] max-md:flex max-md:items-center max-md:gap-4 max-md:flex-wrap">
          <div className="inline-flex items-center gap-2.5 mb-3 max-md:mb-0">
            <span className="size-11 inline-flex items-center justify-center rounded-xl bg-foreground text-background text-lg font-black max-md:size-9 max-md:text-sm">
              SH
            </span>
            <strong className="text-xl font-bold text-foreground max-md:hidden">
              StudentHub
            </strong>
          </div>

          <h1 className="m-0 text-4xl lg:text-6xl xl:text-7xl leading-none font-extrabold tracking-tight text-foreground max-md:text-2xl max-md:leading-tight">
            Forgot your password?<br />
            <span className="bg-gradient-to-br from-foreground to-[#eb6651] bg-clip-text text-transparent">
              Don&apos;t worry — it happens to the best of us.
            </span>
          </h1>

          <p className="max-w-[480px] text-base lg:text-lg leading-relaxed text-muted-foreground mt-3">
            Enter the email address associated with your account and we&apos;ll
            send you a link to reset your password.
          </p>

          <div className="flex flex-wrap gap-2 mt-[18px] max-md:hidden">
            {["Encrypted tokens", "One-time use", "15 min expiry"].map(
              (item) => (
                <Badge
                  key={item}
                  variant="outline"
                  className="text-[11px] font-black uppercase tracking-wider border-[#eb6651]/20 text-[#eb6651] bg-[#fef1ef]"
                >
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
          <Card className="overflow-hidden shadow-sm animate-[shLoginFormIn_400ms_var(--sh-easing)_both] [animation-delay:60ms]">
            <CardHeader className="px-7 pt-7 pb-3 max-md:px-5 max-md:pt-5 max-md:pb-2">
              <CardTitle className="text-2xl max-md:text-xl">Reset your password</CardTitle>
              <CardDescription>
                We&apos;ll send a reset link to your email.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ForgotPasswordForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
