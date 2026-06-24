"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { OSCommand } from "./WorkspaceOS";
import {
  UserRound,
  Briefcase,
  Building2,
  Shield,
  ClipboardCheck,
  Search,
  ArrowUpRight,
} from "lucide-react";

// ── Props ────────────────────────────────────────────────────────

interface RaycastCommandPaletteProps {
  open: boolean;
  query: string;
  onQueryChange: (q: string) => void;
  index: number;
  onIndexChange: (i: number) => void;
  grouped: [string, OSCommand[]][];
  flatCommands: OSCommand[];
  onVisit: (href: string) => void;
  onClose: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  role: string;
}

// ── Icon mapping ─────────────────────────────────────────────────

const roleIcons: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  candidate: UserRound,
  staff: Briefcase,
  company: Building2,
  admin: Shield,
  inspector: ClipboardCheck,
};

function routeIcon(href: string): React.ComponentType<{ className?: string; size?: number }> {
  const segments = href.split("/").filter(Boolean);
  const role = segments[0] || "";
  return roleIcons[role] ?? Search;
}

// ── Fuzzy match: find substring in order, case-insensitive ──────

interface MatchSpan {
  text: string;
  matched: boolean;
}

function fuzzyHighlight(text: string, query: string): MatchSpan[] {
  if (!query) return [{ text, matched: false }];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const spans: MatchSpan[] = [];
  let qi = 0;
  let last = 0;

  for (let ti = 0; ti < lowerText.length && qi < lowerQuery.length; ti++) {
    if (lowerText[ti] === lowerQuery[qi]) {
      if (ti > last) {
        spans.push({ text: text.slice(last, ti), matched: false });
      }
      spans.push({ text: text[ti], matched: true });
      last = ti + 1;
      qi++;
    }
  }
  if (last < text.length) {
    spans.push({ text: text.slice(last), matched: false });
  }
  return spans;
}

// ── Recent items (localStorage) ──────────────────────────────────

const RECENT_KEY = "sh-recent-commands";
const MAX_RECENT = 5;

function getRecent(): OSCommand[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function addRecent(cmd: OSCommand) {
  try {
    const list: OSCommand[] = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    const filtered = list.filter((c) => c.id !== cmd.id);
    filtered.unshift({ ...cmd, section: "Recent" });
    localStorage.setItem(RECENT_KEY, JSON.stringify(filtered.slice(0, MAX_RECENT)));
  } catch {
    // ignore
  }
}

// ── Component ────────────────────────────────────────────────────

export function RaycastCommandPalette({
  open,
  query,
  onQueryChange,
  index,
  onIndexChange,
  grouped,
  flatCommands,
  onVisit,
  onClose,
  inputRef,
  role,
}: RaycastCommandPaletteProps) {
  const [recent, setRecent] = useState<OSCommand[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Load recent items on mount
  useEffect(() => {
    setRecent(getRecent());
    // small delay for entrance animation
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, [open]);

  // Reset re-initialization when open changes
  useEffect(() => {
    if (open) {
      setRecent(getRecent());
      setMounted(true);
    } else {
      setMounted(false);
    }
  }, [open]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current || !open) return;
    const active = listRef.current.querySelector("[data-active=true]") as HTMLElement | null;
    if (active) {
      active.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [index, open]);

  // Combine recent + groups for display
  const displayGroups = useMemo(() => {
    const groups: [string, OSCommand[]][] = [];
    if (!query && recent.length > 0) {
      groups.push(["Recent", recent]);
    }
    // Add all other groups, but if there's a recent section already, deduplicate
    for (const [section, items] of grouped) {
      if (section === "Recent") continue; // skip if we already added recent
      if (!query && recent.length > 0) {
        // Deduplicate: don't show items already in recent
        const recentIds = new Set(recent.map((c) => c.id));
        const filtered = items.filter((c) => !recentIds.has(c.id));
        if (filtered.length > 0) groups.push([section, filtered]);
      } else {
        groups.push([section, items]);
      }
    }
    return groups;
  }, [grouped, recent, query]);

  // Scroll to top when query changes
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [query]);

  const handleVisit = useCallback(
    (cmd: OSCommand) => {
      addRecent(cmd);
      onVisit(cmd.href);
    },
    [onVisit]
  );

  if (!open) return null;

  const hasResults = displayGroups.some(([, items]) => items.length > 0);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center pt-[15vh] transition-opacity duration-200 ${mounted ? "opacity-100" : "opacity-0"}`}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <button
        className="fixed inset-0 bg-black/50"
        aria-label="Close"
        type="button"
        onClick={onClose}
      />
      <div className="w-[640px] max-w-[90vw] rounded-lg border bg-popover shadow-xl overflow-hidden">
        {/* ── Search input ─────────────────────────────────── */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="ml-1 shrink-0 text-muted-foreground" size={18} aria-hidden="true" />
          <input
            ref={inputRef}
            autoFocus
            placeholder="Jump to a view, search records, or run an action..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
            Esc
          </kbd>
        </div>

        {/* ── Results ──────────────────────────────────────── */}
        <div className="max-h-[360px] overflow-y-auto px-1 py-2" ref={listRef}>
          {hasResults ? (
            displayGroups.map(([section, items]) => (
              <div className="mb-1" key={section}>
                <h3 className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section}
                </h3>
                {items.map((cmd) => {
                  const idx = flatCommands.findIndex((f) => f.id === cmd.id);
                  const isActive = idx === index;
                  const Icon = routeIcon(cmd.href);
                  const titleSpans = query ? fuzzyHighlight(cmd.title, query) : null;
                  const subSpans = query ? fuzzyHighlight(cmd.subtitle, query) : null;
                  return (
                    <button
                      className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent ${
                        isActive ? "bg-accent text-accent-foreground" : ""
                      }`}
                      key={cmd.id}
                      type="button"
                      data-active={isActive}
                      onMouseEnter={() => onIndexChange(idx)}
                      onClick={() => handleVisit(cmd)}
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center text-muted-foreground">
                        <Icon size={16} aria-hidden="true" />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="text-sm font-medium">
                          {titleSpans
                            ? titleSpans.map((s, i) =>
                                s.matched ? (
                                  <mark
                                    key={i}
                                    className="rounded-sm bg-primary/20 font-medium text-primary"
                                  >
                                    {s.text}
                                  </mark>
                                ) : (
                                  <span key={i}>{s.text}</span>
                                )
                              )
                            : cmd.title}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {subSpans
                            ? subSpans.map((s, i) =>
                                s.matched ? (
                                  <mark
                                    key={i}
                                    className="rounded-sm bg-primary/20 font-medium text-primary"
                                  >
                                    {s.text}
                                  </mark>
                                ) : (
                                  <span key={i}>{s.text}</span>
                                )
                              )
                            : cmd.subtitle}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1">
                        {cmd.shortcut ? (
                          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                            {cmd.shortcut}
                          </kbd>
                        ) : (
                          <ArrowUpRight size={14} className="text-muted-foreground" aria-hidden="true" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <Search size={28} className="text-muted-foreground/50" aria-hidden="true" />
              <strong>No command found</strong>
              <span>Try a view, record name, scope, or shortcut.</span>
            </div>
          )}
        </div>

        {/* ── Footer shortcuts ─────────────────────────────── */}
        <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">↑↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">↵</kbd>
            Open
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">Esc</kbd>
            Close
          </span>
          {role && (
            <span className="ml-auto flex items-center gap-1 capitalize opacity-60">
              <ArrowUpRight size={12} aria-hidden="true" />
              {role}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
