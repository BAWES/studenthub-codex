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
    <main className="min-h-svh flex items-center justify-center p-4 bg-gradient-to-br from-blue/5 via-coral/5 to-blue/8">
      <Card className="w-full max-w-[420px] border-border shadow-lg">
        <CardContent className="p-0">
          {params.error === "expired" ? (
            <p className="text-destructive font-medium text-sm m-0 p-4 pb-0">That verified account choice expired. Sign in again to continue.</p>
          ) : null}
          {params.error === "account" ? (
            <p className="text-destructive font-medium text-sm m-0 p-4 pb-0">Choose a verified account to continue.</p>
          ) : null}
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
