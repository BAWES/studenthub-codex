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
            Set a new password
            <span className="block text-muted-foreground font-normal text-base mt-2">
              Choose something you haven&apos;t used before.
            </span>
          </h1>

          <p className="text-sm text-muted-foreground">
            Your new password must be at least 8 characters with an uppercase
            letter and a number or special character.
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {["Encrypted", "One-time link", "Expires in 15 min"].map(
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
          <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm">
            <div className="p-6 space-y-1">
              <strong className="text-base font-semibold text-foreground block">
                Set new password
              </strong>
              <p className="text-sm text-muted-foreground">
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
