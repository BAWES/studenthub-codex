import Link from "next/link";
import type { Route } from "next";
import { getSession } from "@/modules/auth/session";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSession();

  if (session) {
    return (
      <main className="flex min-h-svh items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">You are signed in.</p>
          <Button asChild>
            <Link href="/workspace">Go to workspace</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-svh w-[min(1320px,calc(100%_-_28px))] mx-auto grid content-start gap-4 pt-[18px] pb-[42px] max-sm:w-[min(calc(100%_-_20px),720px)]">
      <nav
        className="sticky top-3 z-20 min-h-[62px] flex items-center justify-between gap-3.5 border border-border rounded-lg bg-card p-2 shadow-sm max-sm:static max-sm:flex-col max-sm:items-stretch"
        aria-label="StudentHub navigation"
      >
        <Link
          className="inline-flex items-center gap-2.5 text-foreground px-2 no-underline min-h-11"
          href="/"
        >
          <span className="size-9 inline-flex items-center justify-center rounded-lg bg-foreground text-background font-bold">
            SH
          </span>
          <strong>StudentHub</strong>
        </Link>
        <div className="flex items-center gap-3.5 max-sm:flex-col max-sm:items-stretch">
          <Button variant="outline" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <ThemeToggle />
        </div>
      </nav>

      <section className="flex flex-col items-center justify-center min-h-[60svh] text-center gap-6 px-4">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight max-w-2xl">
          StudentHub
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl">
          Recruitment operations platform.
        </p>
        <Button size="lg" asChild>
          <Link href="/login">Sign in to get started</Link>
        </Button>
      </section>
    </main>
  );
}
