import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/session";
import { roleDefaultRoute } from "@/modules/auth/types";
import { LoginForm } from "@/modules/auth/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) redirect(roleDefaultRoute(session.role));
  const params = await searchParams;

  return (
    <main className="min-h-svh grid place-items-center bg-background p-4">
      <div className="w-full max-w-[420px]">
        {/* ── Brand ──────────────────────────────────────────── */}
        <div className="flex items-center gap-2.5 mb-8">
          <span className="w-9 h-9 inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-black">
            SH
          </span>
          <strong className="text-lg font-bold text-foreground">
            StudentHub
          </strong>
        </div>

        {/* ── Sign-in card ───────────────────────────────────── */}
        <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            {params.error === "expired" ? (
              <div className="mb-4 rounded-md bg-destructive/10 px-3.5 py-2.5 text-sm font-medium text-destructive">
                That session expired. Sign in again to continue.
              </div>
            ) : null}
            {params.error === "account" ? (
              <div className="mb-4 rounded-md bg-destructive/10 px-3.5 py-2.5 text-sm font-medium text-destructive">
                Choose a verified account to continue.
              </div>
            ) : null}

            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
