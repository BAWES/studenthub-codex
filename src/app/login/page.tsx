import Link from "next/link";
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
    <main className="min-h-svh flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] flex flex-col gap-6">
        {/* Brand */}
        <div className="flex flex-col items-center gap-2">
          <span className="size-10 inline-flex items-center justify-center rounded-xl bg-foreground text-card font-black text-lg">
            SH
          </span>
          <strong className="text-xl text-foreground">StudentHub</strong>
        </div>

        {/* Login card */}
        <Card className="border-border shadow-xl" aria-label="StudentHub sign in">
          <CardContent className="p-6">
            {params.error === "expired" ? (
              <p className="text-destructive font-bold text-sm mb-4 pb-2 border-b border-border">
                That verified account choice expired. Sign in again to continue.
              </p>
            ) : null}
            {params.error === "account" ? (
              <p className="text-destructive font-bold text-sm mb-4 pb-2 border-b border-border">
                Choose a verified account to continue.
              </p>
            ) : null}
            <LoginForm />
          </CardContent>
        </Card>

        {/* Footer link */}
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/" className="text-muted-foreground hover:text-[#eb6651] no-underline transition-colors">
            Back to landing
          </Link>
        </p>
      </div>
    </main>
  );
}
