import Link from "next/link";
import type { Route } from "next";
import { getSession } from "@/modules/auth/session";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PortalCards from "./PortalCards";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSession();

  if (session) {
    return (
      <main className="flex min-h-svh items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground">You are signed in.</p>
            <Button asChild>
              <Link href="/workspace">Go to workspace</Link>
            </Button>
          </CardContent>
        </Card>
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

      <section className="relative min-h-[min(560px,calc(100svh_-_96px))] flex flex-col items-start justify-center gap-6 border border-border rounded-lg bg-card p-[clamp(22px,5vw,76px)] max-lg:min-h-auto max-lg:p-7">
        <h1 className="text-[clamp(44px,6.4vw,92px)] font-bold leading-[0.94] tracking-tight max-w-3xl max-sm:text-[40px]">
          Staff-matched placements, streamlined.
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          StudentHub connects staff recruiters with qualified candidates — from profile readiness to timesheets
          and payments. One platform, one placement cycle, complete visibility.
        </p>
        <div className="flex flex-wrap items-center gap-3.5 mt-2">
          <Button size="lg" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <div className="flex flex-wrap gap-2" aria-label="Placement features">
            <Badge variant="outline" className="text-xs uppercase tracking-wide">Staff-recruited matching</Badge>
            <Badge variant="outline" className="text-xs uppercase tracking-wide">End-to-end workflows</Badge>
            <Badge variant="outline" className="text-xs uppercase tracking-wide">Real-time pay and compliance</Badge>
          </div>
        </div>
      </section>

      <PortalCards />
    </main>
  );
}
