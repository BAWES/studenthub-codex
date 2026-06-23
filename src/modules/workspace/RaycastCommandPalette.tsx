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
  History,
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
      className={`rcpOverlay ${mounted ? "rcpVisible" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <button className="rcpScrim" aria-label="Close" type="button" onClick={onClose} />
      <div className="rcpPanel">
        {/* ── Search input ─────────────────────────────────── */}
        <div className="rcpInputWrap">
          <Search className="rcpSearchIcon" size={18} aria-hidden="true" />
          <input
            ref={inputRef}
            autoFocus
            placeholder="Jump to a view, search records, or run an action..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="rcpInput"
          />
          <kbd className="rcpEscKey">Esc</kbd>
        </div>

        {/* ── Results ──────────────────────────────────────── */}
        <div className="rcpList" ref={listRef}>
          {hasResults ? (
            displayGroups.map(([section, items]) => (
              <div className="rcpGroup" key={section}>
                <h3 className="rcpGroupTitle">{section}</h3>
                {items.map((cmd) => {
                  const idx = flatCommands.findIndex((f) => f.id === cmd.id);
                  const isActive = idx === index;
                  const Icon = routeIcon(cmd.href);
                  const titleSpans = query ? fuzzyHighlight(cmd.title, query) : null;
                  const subSpans = query ? fuzzyHighlight(cmd.subtitle, query) : null;
                  return (
                    <button
                      className={`rcpItem ${isActive ? "rcpItemActive" : ""}`}
                      key={cmd.id}
                      type="button"
                      data-active={isActive}
                      onMouseEnter={() => onIndexChange(idx)}
                      onClick={() => handleVisit(cmd)}
                    >
                      <span className="rcpItemIcon">
                        <Icon size={16} aria-hidden="true" />
                      </span>
                      <span className="rcpItemLabel">
                        <span className="rcpItemTitle">
                          {titleSpans
                            ? titleSpans.map((s, i) =>
                                s.matched ? (
                                  <mark key={i} className="rcpHit">
                                    {s.text}
                                  </mark>
                                ) : (
                                  <span key={i}>{s.text}</span>
                                )
                              )
                            : cmd.title}
                        </span>
                        <span className="rcpItemSub">
                          {subSpans
                            ? subSpans.map((s, i) =>
                                s.matched ? (
                                  <mark key={i} className="rcpHit">
                                    {s.text}
                                  </mark>
                                ) : (
                                  <span key={i}>{s.text}</span>
                                )
                              )
                            : cmd.subtitle}
                        </span>
                      </span>
                      <span className="rcpItemRight">
                        {cmd.shortcut ? (
                          <kbd className="rcpShortcut">{cmd.shortcut}</kbd>
                        ) : (
                          <ArrowUpRight size={14} className="rcpArrow" aria-hidden="true" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="rcpEmpty">
              <Search size={28} className="rcpEmptyIcon" aria-hidden="true" />
              <strong>No command found</strong>
              <span>Try a view, record name, scope, or shortcut.</span>
            </div>
          )}
        </div>

        {/* ── Footer shortcuts ─────────────────────────────── */}
        <div className="rcpFooter">
          <span className="rcpFooterItem">
            <kbd>↑↓</kbd> Navigate
          </span>
          <span className="rcpFooterItem">
            <kbd>↵</kbd> Open
          </span>
          <span className="rcpFooterItem">
            <kbd>Esc</kbd> Close
          </span>
          {role && (
            <span className="rcpFooterRole">
              <ArrowUpRight size={12} aria-hidden="true" />
              {role}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
