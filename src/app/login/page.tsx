import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/session";
import { roleDefaultRoute } from "@/modules/auth/types";
import { LoginForm } from "@/modules/auth/LoginForm";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    <main className="min-h-svh grid place-items-center bg-background">
      <div className="w-full max-w-[420px] p-6">
        {/* ── Brand ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-2.5 mb-8">
          <span className="w-9 h-9 inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-black">
            SH
          </span>
          <strong className="text-lg font-bold text-foreground">
            StudentHub
          </strong>
        </div>

        {/* ── Sign-in card ───────────────────────────────────────── */}
        <Card>
          <CardContent className="pt-6">
            {params.error === "expired" ? (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  That session expired. Sign in again to continue.
                </AlertDescription>
              </Alert>
            ) : null}
            {params.error === "account" ? (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  Choose a verified account to continue.
                </AlertDescription>
              </Alert>
            ) : null}

            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
