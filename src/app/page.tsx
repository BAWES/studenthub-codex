import Link from "next/link";
import type { Route } from "next";
import { UserRound, Briefcase, Building2, Shield, ClipboardCheck } from "lucide-react";
import { getSession } from "@/modules/auth/session";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const portals = [
  {
    id: "candidate",
    icon: UserRound,
    label: "Students & candidates",
    title: "Build profile, find jobs, track hours, see pay",
    description: "A mobile-first work app for profile readiness, invitations, shifts, documents, and payment visibility.",
  },
  {
    id: "staff",
    icon: Briefcase,
    label: "Staff operations",
    title: "Match people, send CVs, manage work",
    description: "A focused operating desk for requests, candidate search, shortlists, CV/PDF exports, time, pay, and ID workflows.",
  },
  {
    id: "company",
    icon: Building2,
    label: "Companies",
    title: "Request workers, review candidates, receive invoices",
    description: "A clean employer workspace for hiring demand, candidate review, stores, approvals, and invoice history.",
  },
  {
    id: "admin",
    icon: Shield,
    label: "Admin",
    title: "Run approvals, finance, payroll, migration",
    description: "The command layer for system-wide operations, compliance, transfers, invoicing, and production-data validation.",
  },
  {
    id: "inspector",
    icon: ClipboardCheck,
    label: "Inspectors",
    title: "Review civil ID and document queues",
    description: "A dedicated compliance workspace for ID batches and document decisions without mixing placement work.",
  },
];

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
        <Badge variant="secondary" className="uppercase text-xs tracking-wide">
          Next-generation StudentHub
        </Badge>
        <h1 className="text-[clamp(44px,6.4vw,92px)] font-bold leading-[0.94] tracking-tight max-w-3xl max-sm:text-[40px]">
          One modern platform, purpose-built portals.
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          A single recruitment platform for candidates, staff, companies, inspectors, and admins. One login opens the right workspace, while shared modules keep search, documents, payments, and reporting unified.
        </p>
        <div className="flex flex-wrap items-center gap-3.5 mt-2">
          <Button size="lg" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <div className="flex flex-wrap gap-2" aria-label="Platform features">
            <Badge variant="outline" className="text-xs uppercase tracking-wide">Role-specific workspaces</Badge>
            <Badge variant="outline" className="text-xs uppercase tracking-wide">Shared search and documents</Badge>
            <Badge variant="outline" className="text-xs uppercase tracking-wide">Production-data migration path</Badge>
          </div>
        </div>
      </section>

      <section
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 max-sm:gap-2"
        aria-label="StudentHub portals"
      >
        {portals.map((portal) => {
          const Icon = portal.icon;
          return (
            <Link
              key={portal.id}
              href="/login"
              className="group no-underline"
            >
              <Card className="h-full transition-all duration-150 group-hover:-translate-y-0.5 group-hover:shadow-md">
                <CardContent className="flex flex-col gap-2 p-4">
                  <Icon className="size-5 text-primary shrink-0" />
                  <span className="text-xs font-bold text-primary uppercase tracking-wide">{portal.label}</span>
                  <strong className="text-sm">{portal.title}</strong>
                  <p className="text-xs text-muted-foreground leading-relaxed">{portal.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
