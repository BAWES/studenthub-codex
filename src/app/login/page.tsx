import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/session";
import { roleDefaultRoute } from "@/modules/auth/types";
import { LoginForm } from "@/modules/auth/LoginForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

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
    <main className="min-h-svh flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-[420px] grid gap-8">
        {/* ── Brand ────────────────────────────────────────────────── */}
        <div className="grid justify-items-center gap-3 text-center">
          <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-white text-lg font-black bg-[#eb6651]">
            SH
          </span>
          <strong className="text-xl font-bold text-foreground">
            StudentHub
          </strong>
        </div>

        {/* ── Sign-in card ─────────────────────────────────────────── */}
        <Card>
          <CardHeader className="text-center pb-2">
            <CardTitle>Sign in to StudentHub</CardTitle>
            <CardDescription>
              Use your account credentials to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {params.error === "expired" ? (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-md text-[13px] font-semibold mb-4 bg-destructive/10 text-destructive border border-destructive/20">
                That verified account choice expired. Sign in again to continue.
              </div>
            ) : null}
            {params.error === "account" ? (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-md text-[13px] font-semibold mb-4 bg-destructive/10 text-destructive border border-destructive/20">
                Choose a verified account to continue.
              </div>
            ) : null}

            <LoginForm />
          </CardContent>
        </Card>

        {/* ── Feature badges ───────────────────────────────────────── */}
        <div className="flex flex-wrap justify-center gap-2">
          {["Account credentials", "Automatic role detection", "Scoped workspaces"].map(
            (item) => (
              <span
                key={item}
                className="inline-flex items-center px-3 h-7 rounded-full text-[11px] font-black uppercase tracking-[0.03em] bg-[#fef1ef] text-[#eb6651] border border-[#eb6651]/20"
              >
                {item}
              </span>
            )
          )}
        </div>
      </div>
    </main>
  );
}
