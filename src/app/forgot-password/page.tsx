import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/session";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage() {
  const session = await getSession();
  if (session) redirect("/app");

  return (
    <main className="min-h-svh grid lg:grid-cols-2">
      {/* ── Brand side ──────────────────────────────────────────── */}
      <div className="relative hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-12">
        <div className="max-w-sm text-center space-y-6">
          <div className="inline-flex items-center gap-2.5 rounded-xl bg-primary/10 px-5 py-3">
            <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-black">
              SH
            </span>
            <strong className="text-lg font-bold text-foreground">
              StudentHub
            </strong>
          </div>

          <h1 className="text-2xl font-bold text-foreground leading-tight">
            Forgot your password?
            <span className="block text-muted-foreground font-normal text-base mt-2">
              Don&apos;t worry — it happens to the best of us.
            </span>
          </h1>

          <p className="text-sm text-muted-foreground">
            Enter the email address associated with your account and we&apos;ll
            send you a link to reset your password.
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {["Encrypted tokens", "One-time use", "15 min expiry"].map(
              (item) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {item}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── Form side ────────────────────────────────────────────── */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[420px]">
          <Card>
            <CardHeader className="space-y-1 pb-2">
              <CardTitle>Reset your password</CardTitle>
              <CardDescription>
                We&apos;ll send a reset link to your email.
              </CardDescription>
            </CardHeader>
            <CardContent className="!pt-0">
              <ForgotPasswordForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
