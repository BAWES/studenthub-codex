"use client";

import { useEffect, useMemo, useRef, useState, useCallback, useId } from "react";
import { useRouter, usePathname } from "next/navigation";
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
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";

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

// ── Build commands from nav items ──────────────────────────────

function buildOSCommands(navItems: NavItem[], role: string): OSCommand[] {
  const chordByHref: Record<string, string> = {};
  chordByHref[`/${role}`] = "G H";
  if (role === "admin") {
    chordByHref[`/${role}/candidates`] = "G C";
    chordByHref[`/${role}/requests`] = "G R";
    chordByHref[`/${role}/transfers`] = "G T";
    chordByHref[`/${role}/companies`] = "G O";
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

  return [...nav, ...scopes];
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
  const pathname = usePathname();
  const navItems = useMemo(() => navForRole(session.role), [session.role]);
  const commandDialogId = useId();

  // ── Command palette state ────────────────────────────────────
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [cmdCandidates, setCmdCandidates] = useState<CandidatePaletteResult[]>([]);
  const seqRef = useRef("");

  const commands = useMemo(() => buildOSCommands(navItems, session.role), [navItems, session.role]);

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
  }, [cmdOpen, commands, visit]);

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

      {/* ── Command Palette (shadcn CommandDialog) ────────── */}
      <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
        <CommandInput
          placeholder="Jump to a view, search records, or run an action..."
          data-command-search
          value={cmdQuery}
          onValueChange={setCmdQuery}
        />
        <CommandList>
          <CommandEmpty>
            <div className="flex flex-col items-center gap-1 py-6">
              <strong className="text-sm text-muted-foreground">No command found</strong>
              <span className="text-xs text-muted-foreground/70">
                Try a view, record name, scope, or shortcut.
              </span>
            </div>
          </CommandEmpty>
          {/* Group by section using cmdk's built-in grouping */}
          <CommandGroup heading="Navigation">
            {commands
              .filter((c) => c.section === "Navigation")
              .map((cmd) => (
                <CommandItem
                  key={cmd.id}
                  value={`${cmd.title} ${cmd.subtitle}`}
                  onSelect={() => visit(cmd.href)}
                >
                  <span className="flex flex-col">
                    <strong className="text-sm">{cmd.title}</strong>
                    <small className="text-xs text-muted-foreground">{cmd.subtitle}</small>
                  </span>
                  {cmd.shortcut && <CommandShortcut>{cmd.shortcut}</CommandShortcut>}
                </CommandItem>
              ))}
          </CommandGroup>
          <CommandGroup heading="Quick Scopes">
            {commands
              .filter((c) => c.section === "Quick Scopes")
              .map((cmd) => (
                <CommandItem
                  key={cmd.id}
                  value={`${cmd.title} ${cmd.subtitle}`}
                  onSelect={() => visit(cmd.href)}
                >
                  <span className="flex flex-col">
                    <strong className="text-sm">{cmd.title}</strong>
                    <small className="text-xs text-muted-foreground">{cmd.subtitle}</small>
                  </span>
                  {cmd.shortcut && <CommandShortcut>{cmd.shortcut}</CommandShortcut>}
                </CommandItem>
              ))}
          </CommandGroup>
          {cmdCandidates.length > 0 && (
            <CommandGroup heading="Candidates">
              {cmdCandidates.map((c) => (
                <CommandItem
                  key={c.id}
                  value={`candidate-${c.name}`}
                  onSelect={() => visit(`/${session.role}/candidates/${c.id}`)}
                >
                  <span className="flex flex-col">
                    <strong className="text-sm">{c.name}</strong>
                    <small className="text-xs text-muted-foreground">{c.email || c.uid}</small>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>

        {/* ── Shortcut footer ─────────────────────────────── */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 border-t border-border px-4 py-3 text-xs text-muted-foreground">
          {chords.map((row) => (
            <div key={row.keys} className="flex items-center gap-2">
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-foreground">
                {row.keys}
              </kbd>
              <span>{row.label}</span>
            </div>
          ))}
        </div>
      </CommandDialog>
    </WorkspaceOSContext.Provider>
  );
}
