import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/session";
import { roleDefaultRoute } from "@/modules/auth/types";
import { LoginForm } from "@/modules/auth/LoginForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
      <div className="w-full max-w-[400px] grid gap-6">
        {/* ── Brand ────────────────────────────────────────────────── */}
        <div className="grid justify-items-center gap-2 text-center">
          <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-white text-lg font-black bg-primary">
            SH
          </span>
        </div>
        <Card>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg">Sign in</CardTitle>
          </CardHeader>
          <CardContent>
            {params.error === "expired" ? (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-md text-[13px] font-semibold mb-4 bg-destructive/10 text-destructive border border-destructive/20">
                That verified account choice expired. Sign in again to continue.
              </div>
            ) : null}

            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
