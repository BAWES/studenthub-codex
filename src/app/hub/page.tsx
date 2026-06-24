import type { Route } from "next";
import Link from "next/link";
import { logoutAction } from "@/modules/auth/actions";
import { requireSession } from "@/modules/auth/session";
import { roles, type Role } from "@/modules/auth/types";
import { getUnifiedHub, parseHubScope } from "@/modules/hub/data";
import { HubShortcuts, type HubCommand } from "@/modules/hub/HubShortcuts";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HubPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; scope?: string; record?: string; required?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const scope = parseHubScope(params.scope);
  const requiredRole = parseRequiredRole(params.required);
  const data = await getUnifiedHub(session, { query: params.q, scope, record: params.record });
  const hubContext = hubContextHref(data.query, data.scope);
  const commands = buildCommands(data);
  const guide = buildRoleGuide(session.role, data);

  return (
    <main className="flex h-dvh">
      {/* Sidebar Rail */}
      <aside className="flex w-[236px] shrink-0 flex-col border-r border-border bg-card">
        <Link
          className="flex items-center gap-2 px-4 py-3 font-semibold text-foreground hover:text-primary"
          href="/app"
          aria-label="StudentHub command home"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            SH
          </span>
          <strong>StudentHub</strong>
        </Link>

        <Separator />

        <nav className="flex flex-col gap-0.5 p-2" aria-label="Workspace navigation">
          {data.navigation.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "w-full justify-start font-normal",
                (item.href === hubContext || item.href === "/app") && "bg-primary/10 text-primary hover:bg-primary/15"
              )}
              asChild
            >
              <Link href={item.href} key={item.href} title={`${item.label}: ${item.description}`}>
                <strong>{item.label}</strong>
                <span className="ml-2 text-xs text-muted-foreground">{item.description}</span>
              </Link>
            </Button>
          ))}
        </nav>

        <div className="mt-auto flex items-center justify-between border-t border-border px-4 py-3">
          <ThemeToggle />
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground">
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Desk */}
      <section className="flex flex-1 flex-col min-w-0">
        {/* Top Bar */}
        <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="uppercase text-xs tracking-wider">
              {session.role}
            </Badge>
            <div className="flex flex-col">
              <strong className="text-sm text-foreground">{session.name}</strong>
              <small className="text-xs text-muted-foreground">{session.email}</small>
            </div>
          </div>
          <form className="flex items-center gap-2" action={undefined}>
            <Input
              aria-label="Find records"
              data-command-search
              defaultValue={data.query}
              id="hub-search"
              name="q"
              placeholder="Search candidates, companies, requests, transfers, ID batches"
              className="w-80"
            />
            <input type="hidden" name="scope" value={data.scope} />
            <Button type="submit" variant="ghost" size="sm">
              Search
            </Button>
          </form>
          <HubShortcuts commands={commands} />
        </header>

        {/* Journey Home */}
        <section className="flex-1 overflow-y-auto p-6">
          {requiredRole && requiredRole !== session.role ? (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Access boundary</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>
                  You are signed in as <strong>{session.role}</strong>, not <strong>{requiredRole}</strong>. Use the
                  matching production credentials to enter that workspace. This keeps candidate, staff, company, and admin
                  data separated.
                </span>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/login">Switch account</Link>
                </Button>
              </AlertDescription>
            </Alert>
          ) : null}

          {/* Hero Section */}
          <Card className="mb-6 border-l-4 border-l-[#eb6651]">
            <CardContent className="flex items-start justify-between p-6">
              <div className="space-y-3">
                <span className="text-xs font-medium uppercase tracking-wider text-[#eb6651]">
                  Start here
                </span>
                <h1 className="text-2xl font-bold text-foreground">{guide.title}</h1>
                <p className="text-sm text-muted-foreground">{guide.description}</p>
                <div className="flex gap-2">
                  <Button asChild>
                    <Link href={guide.primary.href}>{guide.primary.label}</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={hubContext}>Open focused search</Link>
                  </Button>
                </div>
              </div>
              <aside className="w-64 rounded-lg bg-muted p-4 text-sm">
                <span className="text-xs font-medium text-muted-foreground">Signed in as {session.role}</span>
                <p className="mt-1 font-semibold text-foreground">{session.name}</p>
                <p className="mt-2 text-xs text-muted-foreground">{guide.guardrail}</p>
              </aside>
            </CardContent>
          </Card>

          {/* Journey Cards */}
          <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3" aria-label={`${session.role} workflows`}>
            {guide.journeys.map((journey) => (
              <Card key={journey.title}>
                <CardHeader>
                  <span className="text-xs font-medium text-[#eb6651]">{journey.kicker}</span>
                  <h3 className="font-semibold text-foreground">{journey.title}</h3>
                  <p className="text-sm text-muted-foreground">{journey.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ol className="space-y-2">
                    {journey.steps.map((step, index) => (
                      <li key={step} className="flex items-start gap-2 text-sm">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                          {index + 1}
                        </span>
                        <strong className="text-foreground">{step}</strong>
                      </li>
                    ))}
                  </ol>
                  <Button variant="ghost" className="px-0 text-[#eb6651] hover:text-[#d45441]" asChild>
                    <Link href={journey.href}>{journey.action} →</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* Workbench */}
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2" aria-label="Search and live queues">
            {/* Live Queues */}
            <Card>
              <CardHeader>
                <span className="text-xs font-medium text-muted-foreground">Live queues</span>
                <h3 className="font-semibold text-foreground">What needs attention</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {data.queues.map((queue) => {
                    const content = (
                      <div className="rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/50">
                        <span className="text-xs text-muted-foreground">{queue.label}</span>
                        <p className="text-2xl font-bold text-foreground">{queue.value.toLocaleString("en-US")}</p>
                        <small className="text-xs text-muted-foreground">{queue.note}</small>
                      </div>
                    );
                    return queue.href ? (
                      <Link className="block" href={queue.href as Route} key={queue.label}>
                        {content}
                      </Link>
                    ) : (
                      <div key={queue.label}>{content}</div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Search Results */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">{data.scope}</span>
                    <h3 className="font-semibold text-foreground">
                      {data.query ? `Search results for ${data.query}` : "Find a record"}
                    </h3>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <nav className="flex flex-wrap gap-1" aria-label="Search scopes">
                  {data.scopes.map((item) => {
                    const query = data.query ? `&q=${encodeURIComponent(data.query)}` : "";
                    return (
                      <Button
                        key={item.value}
                        variant={item.value === data.scope ? "default" : "outline"}
                        size="sm"
                        asChild
                      >
                        <Link href={`/app?scope=${item.value}${query}` as Route}>{item.label}</Link>
                      </Button>
                    );
                  })}
                </nav>
                <div className="space-y-2">
                  {data.results.slice(0, 6).map((result) => (
                    <Link
                      href={hubRecordHref(data.query, data.scope, result.id)}
                      key={result.id}
                      className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                    >
                      <Badge variant="secondary" className="shrink-0">
                        {result.type}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <strong className="block truncate text-sm text-foreground">{result.title}</strong>
                        <small className="text-xs text-muted-foreground">{result.meta}</small>
                      </div>
                    </Link>
                  ))}
                  {data.results.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      No matching records for this login and scope.
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            {/* Record Preview */}
            {data.preview ? <RecordPreview preview={data.preview} /> : null}
          </section>
        </section>
      </section>
    </main>
  );
}

function RecordPreview({ preview }: { preview: NonNullable<Awaited<ReturnType<typeof getUnifiedHub>>["preview"]> }) {
  return (
    <section className="lg:col-span-2" aria-label="Selected record preview">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <Badge variant="secondary" className="mb-2">
                {preview.type}
              </Badge>
              <h2 className="text-lg font-semibold text-foreground">{preview.title}</h2>
              <p className="text-sm text-muted-foreground">{preview.subtitle}</p>
              <small className="text-xs text-muted-foreground">{preview.meta}</small>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {preview.flags.length ? (
            <div className="flex flex-wrap gap-1">
              {preview.flags.map((flag) => (
                <Badge key={flag} variant="secondary">
                  {flag}
                </Badge>
              ))}
            </div>
          ) : null}

          {preview.actions.length ? (
            <div className="flex flex-wrap gap-2">
              {preview.actions.map((action) => (
                <Button key={`${action.label}-${action.href}`} variant="outline" size="sm" asChild>
                  <a href={action.href}>{action.label}</a>
                </Button>
              ))}
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {preview.facts.map((fact) => (
              <div key={fact.label} className="rounded-lg bg-muted p-2">
                <span className="text-xs text-muted-foreground">{fact.label}</span>
                <p className="font-semibold text-foreground">{fact.value}</p>
              </div>
            ))}
          </div>

          {preview.related.length ? (
            <div className="space-y-4 border-t border-border pt-4">
              {preview.related.map((section) => (
                <section key={section.title}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Related</span>
                    <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                  </div>
                  {section.rows.length ? (
                    <div className="space-y-1">
                      {section.rows.map((row) =>
                        row.href ? (
                          <Link
                            className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                            href={row.href}
                            key={row.id}
                          >
                            <strong className="text-foreground">{row.title}</strong>
                            <span className="text-xs text-muted-foreground">{row.subtitle}</span>
                            <small className="text-xs text-muted-foreground">{row.meta}</small>
                          </Link>
                        ) : (
                          <div
                            className="flex items-center justify-between rounded-md px-3 py-2 text-sm"
                            key={row.id}
                          >
                            <strong className="text-foreground">{row.title}</strong>
                            <span className="text-xs text-muted-foreground">{row.subtitle}</span>
                            <small className="text-xs text-muted-foreground">{row.meta}</small>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No related records visible to this login.</p>
                  )}
                </section>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}

function hubContextHref(query: string, scope: string) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  params.set("scope", scope);
  return `/app?${params.toString()}` as Route;
}

function hubRecordHref(query: string, scope: string, record: string) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  params.set("scope", scope);
  params.set("record", record);
  return `/app?${params.toString()}` as Route;
}

function parseRequiredRole(value: string | string[] | undefined): Role | null {
  const role = Array.isArray(value) ? value[0] : value;
  return role && roles.includes(role as Role) ? (role as Role) : null;
}

type HubData = Awaited<ReturnType<typeof getUnifiedHub>>;

type RoleJourney = {
  kicker: string;
  title: string;
  description: string;
  steps: string[];
  href: Route;
  action: string;
};

type RoleGuide = {
  title: string;
  description: string;
  guardrail: string;
  primary: { label: string; href: Route };
  journeys: RoleJourney[];
};

function buildRoleGuide(role: Role, data: HubData): RoleGuide {
  const queueValue = (label: string) => data.queues.find((queue) => queue.label.toLowerCase().includes(label))?.value ?? 0;
  const needsReview = queueValue("review");
  const incomplete = queueValue("incomplete");
  const requests = queueValue("request");
  const idReview = queueValue("id");
  const activeCandidates = data.system.find((item) => item.label === "Active candidates")?.value ?? 0;
  const transfers = data.system.find((item) => item.label === "Transfers")?.value ?? 0;

  const guides: Record<Role, RoleGuide> = {
    admin: {
      title: "Run StudentHub from clear workflows, not scattered tables.",
      description:
        "Pick the job you are trying to finish: approve candidates, operate hiring demand, clear employer accounts, or reconcile money. Search is still here, but it is no longer the whole product.",
      guardrail:
        "Admin sees system-wide records. Candidate, staff, and company accounts should still enter through their own credentials, not through an admin identity switcher.",
      primary: { label: "Start with candidate approvals", href: "/admin/candidates" as Route },
      journeys: [
        {
          kicker: `${needsReview.toLocaleString("en-US")} waiting`,
          title: "Candidate readiness",
          description: "Move a person from signup into a usable, job-ready profile.",
          steps: ["Review profile and documents", "Fix missing readiness data", "Approve or return for completion"],
          href: "/admin/candidates" as Route,
          action: "Open candidate queue"
        },
        {
          kicker: `${requests.toLocaleString("en-US")} requests`,
          title: "Hiring pipeline",
          description: "Go from employer demand to a shortlist that staff can act on.",
          steps: ["Open the request", "Review matched candidates", "Send shortlist and CV pack"],
          href: "/admin/requests" as Route,
          action: "Open requests"
        },
        {
          kicker: `${transfers.toLocaleString("en-US")} transfers`,
          title: "Finance and payouts",
          description: "Track time, candidate pay, employer charges, and invoice-ready transfer records.",
          steps: ["Review transfer batch", "Check candidate payouts", "Prepare employer invoice PDF"],
          href: "/admin/transfers" as Route,
          action: "Open finance"
        },
        {
          kicker: `${idReview.toLocaleString("en-US")} ID batches`,
          title: "Compliance",
          description: "Keep identity and civil ID review separate from day-to-day placement work.",
          steps: ["Review pending ID batches", "Resolve document status", "Return clean candidates to the pipeline"],
          href: "/app?scope=compliance" as Route,
          action: "Open compliance"
        }
      ]
    },
    staff: {
      title: "Work your placements from request to shortlist to candidate follow-up.",
      description:
        "This workspace should feel like a daily operating desk: assigned demand first, candidate readiness second, then communication and CV/PDF actions from the record.",
      guardrail: "Staff only sees assigned requests and candidates connected to their staff account.",
      primary: { label: "Open my requests", href: "/staff/requests" as Route },
      journeys: [
        {
          kicker: "Demand",
          title: "Fill a position",
          description: "Start with the employer request, then work candidates against that specific need.",
          steps: ["Open assigned request", "Review matching candidates", "Send employer shortlist"],
          href: "/staff/requests" as Route,
          action: "Open request desk"
        },
        {
          kicker: `${incomplete.toLocaleString("en-US")} incomplete`,
          title: "Prepare candidates",
          description: "Make profiles usable before they are sent to employers.",
          steps: ["Find incomplete profile", "Check work history and notes", "Export/share CV when ready"],
          href: "/staff/candidates?filter=incomplete" as Route,
          action: "Open candidate desk"
        },
        {
          kicker: "Follow-up",
          title: "Candidate communication",
          description: "Use the candidate record as the action surface for calls, email, notes, and placement history.",
          steps: ["Open candidate", "Review notes and assignments", "Contact or update status"],
          href: "/staff/candidates" as Route,
          action: "Find candidates"
        }
      ]
    },
    candidate: {
      title: "Build your profile, get matched, track work, and understand pay.",
      description:
        "A candidate should not land in an admin database. The path is profile readiness, invitations, work logs, then payment visibility.",
      guardrail: "Candidate login only exposes the signed-in candidate profile, invitations, and work history.",
      primary: { label: "Continue my profile", href: "/candidate" as Route },
      journeys: [
        {
          kicker: "Profile",
          title: "Become job-ready",
          description: "Finish the details employers and staff need before sending you to a role.",
          steps: ["Check personal profile", "Complete missing fields", "Confirm documents"],
          href: "/candidate" as Route,
          action: "Open my profile"
        },
        {
          kicker: "Jobs",
          title: "Review invitations",
          description: "See the roles and requests sent to your account.",
          steps: ["Open invitation", "Review company and role", "Respond or follow up"],
          href: "/candidate/invitations" as Route,
          action: "Open invitations"
        },
        {
          kicker: "Work",
          title: "Track hours and pay",
          description: "Check imported shifts, timer records, and work history connected to payment.",
          steps: ["Open work logs", "Review shift history", "Confirm payment context"],
          href: "/candidate/work-logs" as Route,
          action: "Open work logs"
        }
      ]
    },
    company: {
      title: "Request staff, review candidates, and keep hiring paperwork together.",
      description:
        "Company users should start from hiring demand, not from a mixed database. Requests become the home for shortlists, CVs, status, and invoice context.",
      guardrail: "Company login only exposes linked companies and requests for that company contact.",
      primary: { label: "Open hiring requests", href: "/company/requests" as Route },
      journeys: [
        {
          kicker: "Hiring",
          title: "Request candidates",
          description: "Create and manage demand by company, position, seats, and status.",
          steps: ["Open request", "Review proposed candidates", "Confirm next step with staff"],
          href: "/company/requests" as Route,
          action: "Open requests"
        },
        {
          kicker: "Account",
          title: "Company profile",
          description: "Keep employer identity, contacts, stores, and hiring access clean.",
          steps: ["Review company details", "Check linked locations", "Confirm hiring approval"],
          href: "/company/companies" as Route,
          action: "Open company profile"
        }
      ]
    },
    inspector: {
      title: "Clear identity review without mixing it into placement work.",
      description: "Inspector accounts should move through civil ID batches, candidate lists, and document status quickly.",
      guardrail: "Inspector login only exposes ID review queues.",
      primary: { label: "Open ID requests", href: "/inspector/id-requests" as Route },
      journeys: [
        {
          kicker: `${idReview.toLocaleString("en-US")} pending`,
          title: "Civil ID review",
          description: "Work each imported batch from candidate list to resolved document status.",
          steps: ["Open pending batch", "Review candidates", "Mark review outcome"],
          href: "/inspector/id-requests" as Route,
          action: "Open ID queue"
        }
      ]
    }
  };

  if (role === "admin" && activeCandidates) {
    guides.admin.journeys[0] = {
      ...guides.admin.journeys[0],
      description: `${activeCandidates.toLocaleString("en-US")} active candidates exist, but the useful path starts by clearing what blocks placement.`
    };
  }

  return guides[role];
}

function buildCommands(data: Awaited<ReturnType<typeof getUnifiedHub>>): HubCommand[] {
  const commands: HubCommand[] = [];

  for (const item of data.navigation) {
    const shortcut = item.href === "/app" ? "G H" : item.label.toLowerCase().includes("request") ? "G R" : item.label.toLowerCase().includes("candidate") || item.label.toLowerCase().includes("company") ? "G C" : undefined;
    commands.push({
      id: `nav-${item.href}`,
      title: item.label,
      subtitle: item.description,
      section: "Navigation",
      href: item.href,
      shortcut
    });
  }

  for (const scope of data.scopes) {
    const params = new URLSearchParams();
    params.set("scope", scope.value);
    if (data.query) params.set("q", data.query);
    commands.push({
      id: `scope-${scope.value}`,
      title: `Search ${scope.label}`,
      subtitle: `Limit the workspace to ${scope.label.toLowerCase()}`,
      section: "Search scopes",
      href: `/app?${params.toString()}`
    });
  }

  for (const queue of data.queues) {
    if (!queue.href) continue;
    commands.push({
      id: `queue-${queue.label}`,
      title: queue.label,
      subtitle: queue.note,
      section: "Priority queues",
      href: queue.href
    });
  }

  for (const result of data.results) {
    commands.push({
      id: `result-${result.id}`,
      title: result.title,
      subtitle: `${result.type} · ${result.subtitle}`,
      section: "Visible records",
      href: hubRecordHref(data.query, data.scope, result.id)
    });
  }

  if (data.preview) {
    for (const action of data.preview.actions) {
      commands.push({
        id: `preview-${data.preview.id}-${action.label}`,
        title: action.label,
        subtitle: data.preview.title,
        section: "Selected record",
        href: action.href
      });
    }
  }

  commands.push(
    {
      id: "shortcut-command",
      title: "Open command menu",
      subtitle: "Universal action search",
      section: "Shortcuts",
      href: "/app",
      shortcut: "Cmd/Ctrl K"
    },
    {
      id: "shortcut-search",
      title: "Focus workspace search",
      subtitle: "Search records visible to this account",
      section: "Shortcuts",
      href: "/app",
      shortcut: "/"
    }
  );

  return commands;
}
