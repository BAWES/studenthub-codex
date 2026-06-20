import Link from "next/link";
import { redirect } from "next/navigation";
import { UserRound, Search, Building2, Shield, ClipboardCheck } from "lucide-react";
import { getSession } from "@/modules/auth/session";
import { LoginForm } from "@/modules/auth/LoginForm";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
        aria-label="StudentHub login navigation"
      >
        <Link
          className="inline-flex items-center gap-2.5 text-foreground px-2 no-underline"
          href="/"
        >
          <span className="size-9 inline-flex items-center justify-center rounded-lg bg-foreground text-card font-black">
            SH
          </span>
          <strong>StudentHub</strong>
        </Link>
        <ThemeToggle />
      </nav>

      {/* Intro */}
      <Card className="overflow-hidden border-border bg-gradient-to-br from-blue-50/80 dark:from-blue-950/20 to-card">
        <CardContent className="p-8 lg:p-12">
          <p className="text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wide">One StudentHub login</p>
          <h1 className="mt-0 max-w-[760px] text-[clamp(44px,6.4vw,92px)] leading-[0.94] max-sm:text-[40px]">
            Sign in once. We&rsquo;ll open the right workspace.
          </h1>
          <p className="text-muted-foreground max-w-[620px] leading-relaxed">
            No more guessing whether you are entering as admin, staff, candidate, company, or inspector. Your production
            credentials decide what you can see and do.
          </p>
          <div className="flex flex-wrap gap-2 mt-5">
            {["Production-compatible credentials", "Server-side account detection", "Capability-scoped workspaces"].map(
              (item) => (
                <Badge
                  key={item}
                  variant="secondary"
                  className="text-xs font-black uppercase px-3 py-1.5"
                >
                  {item}
                </Badge>
              )
            )}
          </div>
          <Link href="/" className="inline-block mt-4 text-sm no-underline text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400">
            Back to landing
          </Link>
        </CardContent>
      </Card>

      {/* Login panel */}
      <Card
        className="self-start shadow-xl border-border"
        aria-label="StudentHub sign in"
      >
        {params.error === "expired" ? (
          <p className="text-destructive font-bold m-0 p-4 pb-0">That verified account choice expired. Sign in again to continue.</p>
        ) : null}
        {params.error === "account" ? (
          <p className="text-destructive font-bold m-0 p-4 pb-0">Choose a verified account to continue.</p>
        ) : null}
        <LoginForm />
      </Card>

      {/* Role notes - spans full width */}
      <section className="col-span-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5" aria-label="Account detection notes">
        {roleNotes.map(({ icon: Icon, label, detail }) => (
          <Card key={label}>
            <CardContent className="grid gap-1.5 p-3.5">
              <Icon className="size-4 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />
              <span className="text-muted-foreground text-xs font-extrabold uppercase">{label}</span>
              <strong className="text-sm text-foreground">{detail}</strong>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
