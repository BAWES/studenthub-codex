"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import type { SessionUser } from "@/modules/auth/types";
import { logoutAction } from "@/modules/auth/actions";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";
import Link from "next/link";
import { WorkspaceOSContext } from "./WorkspaceOSContext";
import { WorkspaceMobileNavigation, WorkspaceNavigation } from "./WorkspaceNavigation";
import { navForRole } from "./navigation";
import type { NavItem } from "./navigation";
import { searchCandidatesForPalette, type CandidatePaletteResult } from "./searchPalette";
import { PageTransition } from "./PageTransition";
import { RaycastCommandPalette } from "./RaycastCommandPalette";

// ── Command types ─────────────────────────────────────────────

export type OSCommand = {
  id: string;
  title: string;
  subtitle: string;
  section: string;
  href: string;
  shortcut?: string;
};

const builtinShortcuts = [
  { keys: "⌘K", label: "Open command menu" },
  { keys: "/", label: "Focus workspace search" },
  { keys: "G H", label: "Go to command workspace" },
  { keys: "Esc", label: "Close menu or clear focus" },
];

// ── Keyboard shortcut chords per role ──────────────────────────

function roleChords(role: string): { keys: string; label: string }[] {
  const base = builtinShortcuts;
  if (role === "admin") {
    return [
      ...base,
      { keys: "G C", label: "Go to candidates" },
      { keys: "G R", label: "Go to requests" },
      { keys: "G T", label: "Go to transfers" },
      { keys: "G O", label: "Go to companies" },
    ];
  }
  if (role === "staff") {
    return [
      ...base,
      { keys: "G R", label: "Go to requests" },
      { keys: "G C", label: "Go to candidates" },
      { keys: "G I", label: "Go to interviews" },
    ];
  }
  if (role === "candidate") {
    return [
      ...base,
      { keys: "G I", label: "Go to invitations" },
      { keys: "G W", label: "Go to work logs" },
    ];
  }
  return base;
}

// ── Admin entity page catalog ──────────────────────────────────

type AdminPageEntry = {
  id: string;
  title: string;
  subtitle: string;
  section: string;
  href: string;
  shortcut?: string;
};

function adminEntityPages(): AdminPageEntry[] {
  return [
    // Financial
    { id: "admin-financial-transfers", title: "Transfers", subtitle: "Financial transfers and payouts", section: "Financial", href: "/admin/transfers" },
    { id: "admin-financial-bank", title: "Bank Accounts", subtitle: "Bank account records", section: "Financial", href: "/admin/bank" },
    { id: "admin-financial-invoices", title: "Invoices", subtitle: "Client invoices and billing", section: "Financial", href: "/admin/invoices" },
    { id: "admin-financial-payments", title: "Payments", subtitle: "Payment records", section: "Financial", href: "/admin/payments" },
    { id: "admin-financial-salary", title: "Salary", subtitle: "Salary configuration", section: "Financial", href: "/admin/salary" },
    { id: "admin-financial-salary-scales", title: "Salary Scales", subtitle: "Salary grade scales", section: "Financial", href: "/admin/salary-scales" },
    { id: "admin-financial-expense", title: "Expenses", subtitle: "Expense tracking", section: "Financial", href: "/admin/expense" },
    { id: "admin-financial-currency", title: "Currencies", subtitle: "Currency records", section: "Financial", href: "/admin/currency" },

    // People
    { id: "admin-people-candidates", title: "Candidates", subtitle: "Candidate profiles and matching", section: "People", href: "/admin/candidates" },
    { id: "admin-people-employees", title: "Employees", subtitle: "Employee records", section: "People", href: "/admin/employees" },
    { id: "admin-people-fulltimer", title: "Full-timers", subtitle: "Full-time employee records", section: "People", href: "/admin/fulltimer" },
    { id: "admin-people-attendance", title: "Attendance", subtitle: "Attendance records", section: "People", href: "/admin/attendance" },
    { id: "admin-people-candidate-education", title: "Candidate Education", subtitle: "Education records linked to candidates", section: "People", href: "/admin/candidate-education" },

    // Settings & Configuration
    { id: "admin-settings-general", title: "Settings", subtitle: "General system settings", section: "Settings", href: "/admin/setting" },
    { id: "admin-settings-company-settings", title: "Company Settings", subtitle: "Company-level configuration", section: "Settings", href: "/admin/company-settings" },
    { id: "admin-settings-departments", title: "Departments", subtitle: "Company department records", section: "Settings", href: "/admin/departments" },
    { id: "admin-settings-designations", title: "Designations", subtitle: "Job designations and titles", section: "Settings", href: "/admin/designations" },
    { id: "admin-settings-discount-category", title: "Discount Categories", subtitle: "Discount category configuration", section: "Settings", href: "/admin/discount-category" },
    { id: "admin-settings-permissions", title: "Permissions", subtitle: "System permission configuration", section: "Settings", href: "/admin/permissions" },
    { id: "admin-settings-permission-sections", title: "Permission Sections", subtitle: "Permission grouping sections", section: "Settings", href: "/admin/permission-sections" },
    { id: "admin-settings-agents", title: "Agents", subtitle: "AI agent management", section: "Settings", href: "/admin/agents" },

    // Data & Reference
    { id: "admin-data-country", title: "Countries", subtitle: "Country records", section: "Data", href: "/admin/country" },
    { id: "admin-data-degree", title: "Degrees", subtitle: "Degree type records", section: "Data", href: "/admin/degree" },
    { id: "admin-data-degree-group", title: "Degree Groups", subtitle: "Degree grouping categories", section: "Data", href: "/admin/degree-group" },
    { id: "admin-data-major", title: "Majors", subtitle: "Fields of study", section: "Data", href: "/admin/major" },
    { id: "admin-data-university", title: "Universities", subtitle: "University records", section: "Data", href: "/admin/university" },
    { id: "admin-data-tags", title: "Tags", subtitle: "System tag management", section: "Data", href: "/admin/tags" },
    { id: "admin-data-documents", title: "Documents", subtitle: "Document records", section: "Data", href: "/admin/documents" },

    // Requests & Tickets
    { id: "admin-requests-main", title: "Requests", subtitle: "Hiring requests and fulfillment", section: "Requests", href: "/admin/requests" },
    { id: "admin-requests-company", title: "Company Requests", subtitle: "Company-initiated requests", section: "Requests", href: "/admin/company-requests" },
    { id: "admin-requests-user", title: "User Requests", subtitle: "User-submitted requests", section: "Requests", href: "/admin/user-requests" },
    { id: "admin-requests-candidate-account", title: "Candidate Account Requests", subtitle: "New candidate account approvals", section: "Requests", href: "/admin/candidate-account-requests" },
    { id: "admin-requests-tickets", title: "Tickets", subtitle: "Support ticket management", section: "Requests", href: "/admin/tickets" },

    // Compliance & Contracts
    { id: "admin-compliance-contracts", title: "Contracts", subtitle: "Client and staff contracts", section: "Compliance", href: "/admin/contracts" },
    { id: "admin-compliance-compliance", title: "Compliance", subtitle: "Compliance records", section: "Compliance", href: "/admin/compliance" },

    // System & Infrastructure
    { id: "admin-system-webhooks", title: "Webhooks", subtitle: "Webhook configuration", section: "System", href: "/admin/webhooks" },
    { id: "admin-system-cron-log", title: "Cron Log", subtitle: "Scheduled job execution log", section: "System", href: "/admin/cron-log" },
    { id: "admin-system-aws", title: "AWS Config", subtitle: "AWS service configuration", section: "System", href: "/admin/aws" },
    { id: "admin-system-jira", title: "Jira Integration", subtitle: "Jira issue tracker sync", section: "System", href: "/admin/jira" },
    { id: "admin-system-xero", title: "Xero Integration", subtitle: "Xero accounting sync", section: "System", href: "/admin/xero" },
    { id: "admin-system-email-campaign", title: "Email Campaigns", subtitle: "Email campaign management", section: "System", href: "/admin/email-campaign" },
    { id: "admin-system-mail-log", title: "Mail Log", subtitle: "Email send history", section: "System", href: "/admin/mail-log" },

    // Events & Reports
    { id: "admin-events-events", title: "Events", subtitle: "Event records", section: "Events", href: "/admin/events" },
    { id: "admin-events-event", title: "Event", subtitle: "Event configuration", section: "Events", href: "/admin/event" },
    { id: "admin-reports-reports", title: "Reports", subtitle: "System reports and analytics", section: "Events", href: "/admin/reports" },
    { id: "admin-events-evaluations", title: "Evaluations", subtitle: "Evaluation records", section: "Events", href: "/admin/evaluations" },
    { id: "admin-events-daily-standup", title: "Daily Standup", subtitle: "Daily team standup records", section: "Events", href: "/admin/daily-standup" },

    // Tracking
    { id: "admin-tracking-stores", title: "Stores", subtitle: "Store records", section: "Tracking", href: "/admin/stores" },
    { id: "admin-tracking-story", title: "Stories", subtitle: "Consultancy engagement stories", section: "Tracking", href: "/admin/story" },
    { id: "admin-tracking-note", title: "Notes", subtitle: "System notes", section: "Tracking", href: "/admin/note" },
    { id: "admin-tracking-blocked-ips", title: "Blocked IPs", subtitle: "Blocked IP address management", section: "Tracking", href: "/admin/blocked-ips" },
    { id: "admin-tracking-companies", title: "Companies", subtitle: "Client company profiles", section: "Tracking", href: "/admin/companies" },
    { id: "admin-tracking-requests", title: "Candidate Requests", subtitle: "Candidate request tracking", section: "Tracking", href: "/admin/candidate-account-requests" },
  ];
}

// ── Build commands from nav items ──────────────────────────────

function buildOSCommands(navItems: NavItem[], role: string): OSCommand[] {
  const chordByHref: Record<string, string> = {};
  chordByHref[`/${role}`] = "G H";
  if (role === "admin") {
    chordByHref[`/${role}/candidates`] = "G C";
    chordByHref[`/${role}/requests`] = "G R";
    chordByHref[`/${role}/transfers`] = "G T";
    chordByHref[`/${role}/companies`] = "G O";
    chordByHref[`/${role}/employees`] = "G E";
    chordByHref[`/${role}/invoices`] = "G I";
    chordByHref[`/${role}/bank`] = "G B";
    chordByHref[`/${role}/setting`] = "G S";
    chordByHref[`/${role}/contracts`] = "G N";
    chordByHref[`/${role}/country`] = "G U";
    chordByHref[`/${role}/university`] = "G V";
    chordByHref[`/${role}/degree`] = "G D";
    chordByHref[`/${role}/major`] = "G M";
    chordByHref[`/${role}/tickets`] = "G X";
    chordByHref[`/${role}/events`] = "G W";
    chordByHref[`/${role}/payments`] = "G P";
    chordByHref[`/${role}/salary-scales`] = "G L";
    chordByHref[`/${role}/tags`] = "G A";
    chordByHref[`/${role}/webhooks`] = "G K";
    chordByHref[`/${role}/reports`] = "G F";
  } else if (role === "staff") {
    chordByHref[`/${role}/requests`] = "G R";
    chordByHref[`/${role}/candidates`] = "G C";
    chordByHref[`/${role}/interviews`] = "G I";
  } else if (role === "candidate") {
    chordByHref[`/${role}/invitations`] = "G I";
    chordByHref[`/${role}/work-logs`] = "G W";
  }

  const shortcutFor = (href: string) => chordByHref[href];

  const nav = navItems.map((item) => ({
    id: `nav-${item.href}`,
    title: item.label,
    subtitle: item.href,
    section: "Navigation",
    href: item.href,
    shortcut: shortcutFor(item.href),
  }));

  const scopes: OSCommand[] = [];
  if (role === "admin" || role === "staff") {
    scopes.push(
      { id: "scope-candidates", title: "Candidates", subtitle: "Search and manage student candidates", section: "Quick Scopes", href: `/${role}/candidates`, shortcut: shortcutFor(`/${role}/candidates`) },
      { id: "scope-requests", title: "Requests", subtitle: "Hiring requests and fulfillment", section: "Quick Scopes", href: `/${role}/requests`, shortcut: shortcutFor(`/${role}/requests`) },
    );
  }
  if (role === "admin") {
    scopes.push(
      { id: "scope-companies", title: "Companies", subtitle: "Client company profiles", section: "Quick Scopes", href: "/admin/companies", shortcut: shortcutFor("/admin/companies") },
      { id: "scope-transfers", title: "Transfers", subtitle: "Financial transfers and payouts", section: "Quick Scopes", href: "/admin/transfers", shortcut: shortcutFor("/admin/transfers") },
    );
  }
  if (role === "candidate") {
    scopes.push(
      { id: "scope-invitations", title: "Invitations", subtitle: "Your open invitations", section: "Quick Scopes", href: "/candidate/invitations", shortcut: shortcutFor("/candidate/invitations") },
      { id: "scope-work-logs", title: "Work Logs", subtitle: "Track your work activities", section: "Quick Scopes", href: "/candidate/work-logs", shortcut: shortcutFor("/candidate/work-logs") },
    );
  }

  // Add admin entity page catalog when role is admin
  const entityCommands: OSCommand[] = role === "admin"
    ? adminEntityPages().map((entry) => ({
        ...entry,
        shortcut: shortcutFor(entry.href),
      }))
    : [];

  return [...nav, ...scopes, ...entityCommands];
}

// ── Convert candidate search results to OSCommand items ─────────

function candidateResultsToCommands(
  results: CandidatePaletteResult[],
  role: string,
): OSCommand[] {
  return results.map((c) => ({
    id: `candidate-${c.id}`,
    title: c.name,
    subtitle: c.email || c.uid,
    section: "Candidates",
    href: `/${role}/candidates/${c.id}`,
  }));
}

// ── Group commands by section ──────────────────────────────────

function groupBySection(commands: OSCommand[]): [string, OSCommand[]][] {
  const map = new Map<string, OSCommand[]>();
  for (const cmd of commands) {
    const list = map.get(cmd.section);
    if (list) {
      list.push(cmd);
    } else {
      map.set(cmd.section, [cmd]);
    }
  }
  return Array.from(map.entries());
}

// ── WorkspaceOS Component ──────────────────────────────────────

export function WorkspaceOS({
  session,
  children,
}: {
  session: SessionUser;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const navItems = useMemo(() => navForRole(session.role), [session.role]);

  // ── Command palette state ────────────────────────────────────
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [cmdIndex, setCmdIndex] = useState(0);
  const cmdInputRef = useRef<HTMLInputElement>(null);
  const [cmdCandidates, setCmdCandidates] = useState<CandidatePaletteResult[]>([]);
  const seqRef = useRef("");

  const commands = useMemo(() => buildOSCommands(navItems, session.role), [navItems, session.role]);

  // Candidate commands: async search results converted to OSCommand[]
  const candidateCommands = useMemo(
    () => candidateResultsToCommands(cmdCandidates, session.role),
    [cmdCandidates, session.role],
  );

  // All flat commands for keyboard index tracking
  const allFlatCommands = useMemo(
    () => [...commands, ...candidateCommands],
    [commands, candidateCommands],
  );

  // Grouped commands by section (includes candidates when present)
  const groupedCommands = useMemo((): [string, OSCommand[]][] => {
    const base = groupBySection(commands);
    if (candidateCommands.length > 0) {
      base.push(["Candidates", candidateCommands]);
    }
    return base;
  }, [commands, candidateCommands]);

  // Reset index when flat list changes (candidates arrive/leave)
  useEffect(() => {
    setCmdIndex(0);
  }, [allFlatCommands.length]);

  // Debounced candidate search for CMD+K
  useEffect(() => {
    if (!cmdOpen || !cmdQuery || cmdQuery.length < 2) {
      setCmdCandidates([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const results = await searchCandidatesForPalette(cmdQuery);
        setCmdCandidates(results);
      } catch { setCmdCandidates([]); }
    }, 200);
    return () => clearTimeout(timer);
  }, [cmdQuery, cmdOpen]);

  const visit = useCallback(
    (href: string) => {
      setCmdOpen(false);
      router.push(href as Route);
    },
    [router],
  );

  // ── Global keyboard handler ──────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      const typing = el?.tagName === "INPUT" || el?.tagName === "TEXTAREA" || el?.isContentEditable === true;

      // Cmd+K or ? → open command palette
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdOpen(true);
        return;
      }
      if (!typing && e.key === "?") {
        e.preventDefault();
        setCmdOpen(true);
        return;
      }

      // ── Palette keyboard navigation ──────────────────────────
      if (cmdOpen) {
        if (e.key === "Escape") {
          e.preventDefault();
          setCmdOpen(false);
          return;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setCmdIndex((prev) => (prev + 1) % Math.max(allFlatCommands.length, 1));
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setCmdIndex((prev) => (prev - 1 + allFlatCommands.length) % Math.max(allFlatCommands.length, 1));
          return;
        }
        if (e.key === "Enter") {
          e.preventDefault();
          const cmd = allFlatCommands[cmdIndex];
          if (cmd) {
            visit(cmd.href);
          }
          return;
        }
      }

      // G then key chord navigation
      if (!typing && e.key.toLowerCase() === "g") {
        seqRef.current = "g";
        window.setTimeout(() => { seqRef.current = ""; }, 900);
        return;
      }
      if (!typing && seqRef.current === "g") {
        const key = e.key.toLowerCase();
        const match = commands.find((c) => c.shortcut?.toLowerCase() === `g ${key}`);
        if (match) {
          e.preventDefault();
          seqRef.current = "";
          visit(match.href);
        }
        return;
      }

      // / → focus search
      if (!typing && e.key === "/") {
        const input = document.querySelector<HTMLInputElement>("[data-command-search]");
        if (input) {
          e.preventDefault();
          input.focus();
          input.select();
        }
        return;
      }

      // j/k navigation on rows (when not in input)
      if (!typing && !cmdOpen && (e.key === "j" || e.key === "k")) {
        const rows = document.querySelectorAll("[data-os-navigable]");
        if (!rows.length) return;
        const current = document.activeElement;
        const idx = Array.from(rows).indexOf(current as Element);
        const next = e.key === "j" ? idx + 1 : idx - 1;
        const target = rows[Math.max(0, Math.min(next, rows.length - 1))] as HTMLElement | undefined;
        if (target) {
          e.preventDefault();
          target.focus();
          target.scrollIntoView({ block: "nearest" });
        }
        return;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cmdOpen, commands, visit, allFlatCommands, cmdIndex]);

  const chords = useMemo(() => roleChords(session.role), [session.role]);

  return (
    <WorkspaceOSContext.Provider value={{ embedded: true, session }}>
      <main className="flex min-h-screen">
        {/* ── Sidebar Rail ─────────────────────────────────── */}
        <aside className="flex w-[236px] shrink-0 flex-col border-r border-border bg-card">
          <Link
            className="flex items-center gap-2 border-b border-border px-5 py-4 font-semibold text-foreground"
            href="/app"
            aria-label="StudentHub app"
          >
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              SH
            </span>
            <strong className="text-sm">StudentHub</strong>
          </Link>
          <WorkspaceNavigation items={navItems} role={session.role} />
          <div className="mt-auto flex items-center gap-2 border-t border-border px-4 py-3">
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <span>⌘K</span>
            </button>
            <ThemeToggle />
            <form className="ml-auto" action={logoutAction}>
              <button
                type="submit"
                className="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Sign out
              </button>
            </form>
          </div>
        </aside>

        {/* ── Content Stage ───────────────────────────────── */}
        <section className="flex flex-1 flex-col overflow-auto">
          <PageTransition>{children}</PageTransition>
        </section>

        {/* ── Mobile Tab Bar ──────────────────────────────── */}
        <WorkspaceMobileNavigation items={navItems} role={session.role} />
      </main>

      {/* ── Raycast Command Palette ───────────────────────── */}
      <RaycastCommandPalette
        open={cmdOpen}
        query={cmdQuery}
        onQueryChange={setCmdQuery}
        index={cmdIndex}
        onIndexChange={setCmdIndex}
        grouped={groupedCommands}
        flatCommands={allFlatCommands}
        onVisit={visit}
        onClose={() => setCmdOpen(false)}
        inputRef={cmdInputRef}
        role={session.role}
      />
    </WorkspaceOSContext.Provider>
  );
}
