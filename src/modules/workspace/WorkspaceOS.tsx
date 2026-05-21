"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
  { keys: "Esc", label: "Close menu or clear focus" }
];

function roleChords(role: string): { keys: string; label: string }[] {
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

// ── WorkspaceOS Component ──────────────────────────────────────

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

  const filtered = useMemo(() => {
    const q = cmdQuery.trim().toLowerCase();
    if (!q) return commands.slice(0, 18);
    return commands
      .filter((c) =>
        [c.title, c.subtitle, c.section, c.shortcut].filter(Boolean).join(" ").toLowerCase().includes(q)
      )
      .slice(0, 18);
  }, [commands, cmdQuery]);

  const grouped = useMemo(() => {
    const g = new Map<string, OSCommand[]>();
    for (const c of filtered) {
      g.set(c.section, [...(g.get(c.section) ?? []), c]);
    }
    return [...g.entries()];
  }, [filtered]);

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

      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdOpen(true);
        setCmdIndex(0);
        setCmdQuery("");
        window.setTimeout(() => cmdInputRef.current?.focus(), 0);
        return;
      }
      if (!typing && e.key === "?") {
        e.preventDefault();
        setCmdOpen(true);
        setCmdIndex(0);
        setCmdQuery("shortcut");
        window.setTimeout(() => cmdInputRef.current?.focus(), 0);
        return;
      }

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

      if (!typing && e.key === "/") {
        const input = document.querySelector<HTMLInputElement>("[data-command-search]");
        if (input) {
          e.preventDefault();
          input.focus();
          input.select();
        }
        return;
      }

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

  useEffect(() => { setCmdIndex(0); }, [cmdQuery]);

  const chords = useMemo(() => roleChords(session.role), [session.role]);

  return (
    <WorkspaceOSContext.Provider value={{ embedded: true, session }}>
      <main className="grid grid-cols-[224px_minmax(0,1fr)] min-h-svh bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--blue)_10%,transparent),transparent_32rem),var(--paper)] text-[var(--ink)] max-md:block">
        {/* ── Sidebar Rail ─────────────────────────────────── */}
        <aside className="sticky top-0 h-svh grid grid-rows-[auto_minmax(0,1fr)_auto] justify-items-stretch gap-2.5 border-r border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] py-3 px-2.5 max-md:hidden">
          <Link className="w-full min-h-11 flex items-center gap-2.5 border border-[var(--line)] rounded-lg bg-[var(--ink)] text-[var(--surface)] px-3 font-black no-underline" href="/app" aria-label="StudentHub app">
            <span className="w-[30px] h-[30px] inline-flex items-center justify-center rounded-md bg-[rgba(255,255,255,0.14)]">SH</span>
            <strong>StudentHub</strong>
          </Link>
          <WorkspaceNavigation items={navItems} role={session.role} />
          <div className="grid gap-2">
            <button
              className="min-h-[42px] rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] text-[var(--ink)] text-[13px] font-black cursor-pointer hover:border-[var(--blue)] hover:text-[var(--blue)]"
              type="button"
              onClick={() => { setCmdOpen(true); }}
            >
              <span className="text-[11px] text-[var(--muted)] font-bold uppercase">⌘K</span>
            </button>
            <ThemeToggle />
            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full min-h-10 border border-[var(--line)] rounded-lg bg-[var(--surface-soft)] text-[var(--ink)] text-[13px] font-black cursor-pointer hover:border-[var(--blue)] hover:text-[var(--blue)]"
              >
                Sign out
              </button>
            </form>
          </div>
        </aside>

        {/* ── Content Stage ───────────────────────────────── */}
        <section className="min-w-0 grid grid-rows-[auto_minmax(0,1fr)] min-h-svh">
          {children}
        </section>

        {/* ── Mobile Tab Bar ──────────────────────────────── */}
        <WorkspaceMobileNavigation items={navItems} role={session.role} />
      </main>

      {/* ── Command Palette Overlay ───────────────────────── */}
      {cmdOpen ? (
        <div className="fixed inset-0 z-50 grid justify-items-center p-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Command menu">
          <button
            className="absolute inset-0 bg-[rgba(0,0,0,0.48)] backdrop-blur-[6px]"
            aria-label="Close"
            type="button"
            onClick={() => setCmdOpen(false)}
          />
          <section className="relative z-10 w-full max-w-[640px] grid rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_28px_100px_rgba(16,24,40,0.32)] overflow-hidden">
            <div className="flex items-center min-h-[48px] border-b border-[var(--line)] bg-[var(--surface-soft)] px-3 gap-2">
              <span className="text-[var(--muted)] text-xs font-bold">⌘</span>
              <input
                ref={cmdInputRef}
                autoFocus
                className="flex-1 min-w-0 h-10 border-0 bg-transparent text-[var(--ink)] text-sm px-1 font-inherit focus:outline-none"
                placeholder="Jump to a view, search records, or run an action..."
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
              />
              <kbd className="text-[var(--muted)] text-[11px] font-bold bg-[var(--surface)] border border-[var(--line)] rounded px-1.5">Esc</kbd>
            </div>
            <div className="max-h-[420px] overflow-y-auto p-2 grid gap-1">
              {grouped.length ? (
                grouped.map(([section, items]) => (
                  <div key={section}>
                    <h3 className="text-[var(--muted)] text-[11px] font-extrabold uppercase px-2 py-1.5">{section}</h3>
                    {items.map((cmd) => {
                      const idx = filtered.findIndex((f) => f.id === cmd.id);
                      return (
                        <button
                          className={`w-full min-h-[48px] grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2.5 py-1.5 text-left border cursor-pointer ${
                            idx === cmdIndex
                              ? "border-[var(--blue)] bg-[#eef5ff]"
                              : "border-transparent hover:bg-[var(--surface-soft)]"
                          }`}
                          key={cmd.id}
                          type="button"
                          onMouseEnter={() => setCmdIndex(idx)}
                          onClick={() => visit(cmd.href)}
                        >
                          <span className="grid gap-0.5">
                            <strong className="text-sm text-[var(--ink)]">{cmd.title}</strong>
                            <small className="text-xs text-[var(--muted)] overflow-hidden text-ellipsis whitespace-nowrap">{cmd.subtitle}</small>
                          </span>
                          {cmd.shortcut ? <kbd className="text-[11px] font-mono font-bold text-[var(--muted)] bg-[var(--surface-soft)] border border-[var(--line)] rounded px-1.5 py-0.5">{cmd.shortcut}</kbd> : null}
                        </button>
                      );
                    })}
                  </div>
                ))
              ) : (
                <div className="grid gap-1.5 py-8 px-3 justify-items-center text-center">
                  <strong className="text-[var(--ink)]">No command found</strong>
                  <span className="text-[var(--muted)] text-sm">Try a view, record name, scope, or shortcut.</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1 px-3 py-2.5 border-t border-[var(--line)]">
              {chords.map((row) => (
                <div key={row.keys} className="flex items-center justify-between px-2 py-1.5 rounded-md">
                  <kbd className="font-mono text-[11px] font-bold bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded px-1.5 py-px">{row.keys}</kbd>
                  <span className="text-[var(--muted)] text-xs">{row.label}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </WorkspaceOSContext.Provider>
  );
}
