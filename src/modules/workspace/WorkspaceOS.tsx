"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { Route } from "next";
import type { SessionUser } from "@/modules/auth/types";
import { logoutAction } from "@/modules/auth/actions";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { WorkspaceOSContext } from "./WorkspaceOSContext";
import { WorkspaceMobileNavigation, WorkspaceNavigation } from "./WorkspaceNavigation";
import { navForRole } from "./navigation";
import type { NavItem } from "./navigation";
import { Separator } from "@/components/ui/separator";
import { PageTransition } from "./PageTransition";
import { RaycastCommandPalette } from "./RaycastCommandPalette";
import { TabBar } from "./TabBar";
import { TabProvider } from "./TabContext";
import { searchCandidatesForPalette } from "./searchPalette";
import type { CandidatePaletteResult } from "./searchPalette";

// ── Command item shape ──────────────────────────────────────────────

export interface OSCommand {
  id: string;
  title: string;
  subtitle: string;
  section: string;
  href: string;
  shortcut?: string;
}

// ── Keyboard shortcut chords per role ────────────────────────────────

function roleChords(role: string): { keys: string; label: string }[] {
  const builtinShortcuts = [
    { keys: "⌘K", label: "Open command menu" },
    { keys: "/", label: "Focus workspace search" },
    { keys: "G H", label: "Go to command workspace" },
    { keys: "Esc", label: "Close menu or clear focus" }
  ];
  const base = builtinShortcuts;
  if (role === "admin") {
    return [
      ...base,
      { keys: "G C", label: "Go to candidates" },
      { keys: "G R", label: "Go to requests" },
      { keys: "G T", label: "Go to transfers" },
      { keys: "G O", label: "Go to companies" }
    ];
  }
  if (role === "staff") {
    return [
      ...base,
      { keys: "G R", label: "Go to requests" },
      { keys: "G C", label: "Go to candidates" },
      { keys: "G I", label: "Go to interviews" }
    ];
  }
  if (role === "candidate") {
    return [
      ...base,
      { keys: "G I", label: "Go to invitations" },
      { keys: "G W", label: "Go to work logs" }
    ];
  }
  return base;
}

// ── Build commands from nav items ────────────────────────────────────

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
    shortcut: shortcutFor(item.href)
  }));

  const scopes: OSCommand[] = [];
  if (role === "admin" || role === "staff") {
    scopes.push(
      { id: "scope-candidates", title: "Candidates", subtitle: "Search and manage student candidates", section: "Quick Scopes", href: `/${role}/candidates`, shortcut: shortcutFor(`/${role}/candidates`) },
      { id: "scope-requests", title: "Requests", subtitle: "Hiring requests and fulfillment", section: "Quick Scopes", href: `/${role}/requests`, shortcut: shortcutFor(`/${role}/requests`) }
    );
  }
  if (role === "admin") {
    scopes.push(
      { id: "scope-companies", title: "Companies", subtitle: "Client company profiles", section: "Quick Scopes", href: "/admin/companies", shortcut: shortcutFor("/admin/companies") },
      { id: "scope-transfers", title: "Transfers", subtitle: "Financial transfers and payouts", section: "Quick Scopes", href: "/admin/transfers", shortcut: shortcutFor("/admin/transfers") }
    );
  }
  if (role === "candidate") {
    scopes.push(
      { id: "scope-invitations", title: "Invitations", subtitle: "Your open invitations", section: "Quick Scopes", href: "/candidate/invitations", shortcut: shortcutFor("/candidate/invitations") },
      { id: "scope-work-logs", title: "Work Logs", subtitle: "Track your work activities", section: "Quick Scopes", href: "/candidate/work-logs", shortcut: shortcutFor("/candidate/work-logs") }
    );
  }

  return [...nav, ...scopes];
}

// ── WorkspaceOS Component ──────────────────────────────────────────────

export function WorkspaceOS({
  session,
  children
}: {
  session: SessionUser;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const navItems = useMemo(() => navForRole(session.role), [session.role]);

  // ── Command palette state ────────────────────────────────────
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [cmdIndex, setCmdIndex] = useState(0);
  const cmdInputRef = useRef<HTMLInputElement | null>(null);
  const seqRef = useRef("");

  const commands = useMemo(() => buildOSCommands(navItems, session.role), [navItems, session.role]);

  // ── Candidate search (Typesense, inline in palette) ────────────────
  const [cmdCandidates, setCmdCandidates] = useState<CandidatePaletteResult[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = cmdQuery.trim();
    if (q.length < 2) {
      setCmdCandidates([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const results = await searchCandidatesForPalette(q);
      setCmdCandidates(results);
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [cmdQuery]);

  // Flatten command palette items: nav commands + candidate results
  const allPaletteItems = useMemo(() => {
    const items = [...commands];
    for (const c of cmdCandidates) {
      items.push({
        id: `candidate-${c.id}`,
        title: c.name,
        subtitle: `${c.email} · ${c.uid}`,
        section: "Candidates",
        href: `/${session.role}/candidates/${c.id}`,
      });
    }
    return items;
  }, [commands, cmdCandidates, session.role]);

  const filtered = useMemo(() => {
    const q = cmdQuery.trim().toLowerCase();
    if (!q) return allPaletteItems.slice(0, 18);
    return allPaletteItems
      .filter((c) =>
        [c.title, c.subtitle, c.section, c.shortcut].filter(Boolean).join(" ").toLowerCase().includes(q)
      )
      .slice(0, 18);
  }, [allPaletteItems, cmdQuery]);

  const grouped = useMemo((): [string, OSCommand[]][] => {
    const groups = new Map<string, OSCommand[]>();
    const list = cmdQuery.trim() ? filtered : allPaletteItems;
    for (const cmd of list) {
      const key = cmd.section || "Other";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(cmd);
    }
    return Array.from(groups.entries());
  }, [allPaletteItems, filtered, cmdQuery]);

  const visit = useCallback(
    (href: string) => {
      setCmdOpen(false);
      setCmdQuery("");
      router.push(href as Route);
    },
    [router]
  );

  // ── Global keyboard handler ──────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      const typing = el?.tagName === "INPUT" || el?.tagName === "TEXTAREA" || el?.isContentEditable === true;

      // Cmd+K → open command palette
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdOpen(true);
        setCmdIndex(0);
        setCmdQuery("");
        return;
      }
      if (!typing && e.key === "?") {
        e.preventDefault();
        setCmdOpen(true);
        setCmdIndex(0);
        setCmdQuery("shortcut");
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

      // Command palette open → arrow keys / enter / esc
      if (cmdOpen) {
        if (e.key === "Escape") {
          e.preventDefault();
          setCmdOpen(false);
          setCmdQuery("");
          return;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setCmdIndex((i) => Math.min(i + 1, filtered.length - 1));
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setCmdIndex((i) => Math.max(i - 1, 0));
          return;
        }
        if (e.key === "Enter" && filtered[cmdIndex]) {
          e.preventDefault();
          visit(filtered[cmdIndex].href);
          return;
        }
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
  }, [cmdOpen, cmdIndex, filtered, commands, visit]);

  // Reset active index when query changes
  useEffect(() => { setCmdIndex(0); }, [cmdQuery]);

  const chords = useMemo(() => roleChords(session.role), [session.role]);

  return (
    <WorkspaceOSContext.Provider value={{ embedded: true, session }}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-foreground focus:shadow-lg focus:outline-none"
      >
        Skip to content
      </a>
      <TabProvider role={session.role}>
      <main id="main-content" className="shell">
        {/* ── Sidebar Rail ─────────────────────────────────── */}
        <aside className="workspaceRail" aria-label="Workspace sidebar">
          <Link className="workspaceMark" href="/app" aria-label="StudentHub app">
            <span>SH</span>
            <strong>StudentHub</strong>
          </Link>
          <WorkspaceNavigation items={navItems} role={session.role} />
          <Separator className="workspaceRailDivider" />
          <div className="workspaceRailFooter">
            <button className="commandLauncher" type="button" aria-label="Open command menu" onClick={() => { setCmdOpen(true); }}>
              <span>⌘K</span>
            </button>
            <ThemeToggle />
            <form action={logoutAction}>
              <button type="submit" aria-label="Sign out">
                <LogOut size={18} strokeWidth={1.5} aria-hidden="true" />
                <span>Sign out</span>
              </button>
            </form>
          </div>
        </aside>

        {/* ── Content Stage ───────────────────────────────── */}
        <section className="workspaceStage">
          <TabBar role={session.role} />
          <PageTransition>{children}</PageTransition>
        </section>

        {/* ── Mobile Tab Bar ──────────────────────────────── */}
        <WorkspaceMobileNavigation items={navItems} role={session.role} />
      </main>
      </TabProvider>

      {/* ── Command Palette (Raycast-style) ──────────────────── */}
      <RaycastCommandPalette
        open={cmdOpen}
        query={cmdQuery}
        onQueryChange={setCmdQuery}
        index={cmdIndex}
        onIndexChange={setCmdIndex}
        grouped={grouped}
        flatCommands={filtered}
        onVisit={visit}
        onClose={() => { setCmdOpen(false); setCmdQuery(""); }}
        inputRef={cmdInputRef}
        role={session.role}
      />
    </WorkspaceOSContext.Provider>
  );
}
