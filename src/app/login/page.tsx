import { LoginForm } from "@/modules/auth/LoginForm";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Link } from "next-view-transitions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-svh flex flex-col items-center justify-center p-4 gap-4">
      {/* Top nav */}
      <nav
        className="w-full max-w-[420px] sticky top-3 z-20 min-h-[52px] flex items-center justify-between border border-border/80 rounded-lg bg-card/92 p-2 shadow-sm"
        aria-label="StudentHub login navigation"
      >
        <Link
          className="inline-flex items-center gap-2.5 text-foreground px-2 no-underline"
          href="/"
        >
          <span className="size-8 inline-flex items-center justify-center rounded-lg bg-foreground text-card font-black text-sm">
            SH
          </span>
          <strong className="text-sm">StudentHub</strong>
        </Link>
        <ThemeToggle />
      </nav>

      {/* Login panel */}
      <Card
        className="w-full max-w-[420px] border-border shadow-sm"
        aria-label="StudentHub sign in"
      >
        <div className="p-6">
          <h1 className="text-xl font-semibold mb-1">Sign in</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Enter your credentials to continue.
          </p>

          {params.error === "expired" ? (
            <p className="text-destructive text-sm font-medium mb-4">That verified account choice expired. Sign in again to continue.</p>
          ) : null}
          {params.error === "account" ? (
            <p className="text-destructive text-sm font-medium mb-4">Choose a verified account to continue.</p>
          ) : null}

          <LoginForm />
        </div>
      </Card>
    </main>
  );
}
