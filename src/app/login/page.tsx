import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/session";
import { LoginForm } from "@/modules/auth/LoginForm";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/app");
  const params = await searchParams;

  return (
    <main className="min-h-svh flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-[420px] border-border shadow-xl">
        <CardContent className="p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <span className="size-11 inline-flex items-center justify-center rounded-xl bg-foreground text-card font-black text-lg">
              SH
            </span>
          </div>

          {params.error === "expired" ? (
            <p className="text-destructive font-bold text-sm mb-4 text-center">
              That verified account choice expired. Sign in again to continue.
            </p>
          ) : null}
          {params.error === "account" ? (
            <p className="text-destructive font-bold text-sm mb-4 text-center">
              Choose a verified account to continue.
            </p>
          ) : null}

          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
