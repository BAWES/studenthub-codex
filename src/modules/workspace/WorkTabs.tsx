"use client";

import { useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type WorkTab = {
  path: string;
  label: string;
};

/** Role-specific visibility rules. Omitted = visible to everyone. */
type WorkTabVisibility = {
  /** Only show tabs whose path matches the given role prefix */
  includeRoles?: string[];
  /** Hide tabs whose path matches the given role prefix */
  excludeRoles?: string[];
};

const STORAGE_KEY = "studenthub-work-tabs";
const MAX_TABS = 8;

function readTabs(): WorkTab[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_TABS);
  } catch {
    return [];
  }
}

function writeTabs(tabs: WorkTab[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs.slice(0, MAX_TABS)));
  } catch {
    // localStorage may be full or unavailable
  }
}

function deriveLabel(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 2) return null;

  const names: Record<string, string> = {
    candidates: "Candidate",
    companies: "Company",
    requests: "Request",
    transfers: "Transfer",
    invitations: "Invitation",
    "work-logs": "Work Log",
    "id-requests": "ID Request",
  };

  const mod = segments[1];
  const id = segments[2];
  if (!id) return null;

  const moduleName = names[mod] ?? mod;
  const displayId = id.length > 12 ? `${id.slice(0, 12)}...` : id;
  return `${moduleName} ${displayId}`;
}

/** Extract the role prefix from a path like /admin/candidates/123 -> admin */
function roleFromPath(path: string): string {
  const segs = path.split("/").filter(Boolean);
  return segs[0] ?? "";
}

/**
 * Filter tabs by role-scoping rules.
 * - If a tab's path matches `includeRoles` (or no rules), it's visible.
 * - Tabs whose path matches `excludeRoles` are hidden.
 */
function filterTabsByRole(tabs: WorkTab[], role: string, rules?: WorkTabVisibility): WorkTab[] {
  if (!rules) return tabs;
  return tabs.filter((tab) => {
    const tabRole = roleFromPath(tab.path);
    if (rules.excludeRoles?.includes(tabRole)) return false;
    if (rules.includeRoles && !rules.includeRoles.includes(tabRole)) return false;
    return true;
  });
}

export function useWorkTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const [tabs, setTabs] = useState<WorkTab[]>([]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setTabs(readTabs());
  }, []);

  // Add current path as a tab when it's a record detail page
  useEffect(() => {
    const label = deriveLabel(pathname);
    if (!label) return;

    setTabs((prev) => {
      const existing = prev.findIndex((t) => t.path === pathname);
      let next: WorkTab[];
      if (existing >= 0) {
        next = [...prev];
        next[existing] = { path: pathname, label };
      } else {
        next = [{ path: pathname, label }, ...prev];
      }
      next = next.slice(0, MAX_TABS);
      writeTabs(next);
      return next;
    });
  }, [pathname]);

  const closeTab = useCallback(
    (path: string) => {
      setTabs((prev) => {
        const next = prev.filter((t) => t.path !== path);
        writeTabs(next);
        if (pathname === path && next.length > 0) {
          router.push(next[0].path as Route);
        }
        return next;
      });
    },
    [pathname, router]
  );

  const closeAll = useCallback(() => {
    setTabs([]);
    writeTabs([]);
  }, []);

  return { tabs, closeTab, closeAll };
}

export type WorkTabState = ReturnType<typeof useWorkTabs>;

export function WorkTabs({
  state,
  visibility,
}: {
  state: WorkTabState;
  /** Role-scoping rules for which tabs to show. Inferred from the first path's role if omitted. */
  visibility?: WorkTabVisibility;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Derive the current role from the pathname
  const currentRole = roleFromPath(pathname);

  // Filter tabs by role-scoping rules
  const visibleTabs = visibility ? filterTabsByRole(state.tabs, currentRole, visibility) : state.tabs;

  // ── Scroll detection ──────────────────────────────────────────
  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    const ro = new ResizeObserver(updateScrollButtons);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      ro.disconnect();
    };
  }, [visibleTabs.length, updateScrollButtons]);

  const scrollBy = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = dir === "left" ? -200 : 200;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (!visibleTabs.length) return null;

  return (
    <nav className="workTabs" aria-label="Recently opened records">
      {canScrollLeft ? (
        <button
          type="button"
          className="workTabsScroll workTabsScrollLeft"
          aria-label="Scroll tabs left"
          onClick={() => scrollBy("left")}
        >
          <ChevronLeft size={14} />
        </button>
      ) : null}

      <div className="workTabsScroller" ref={scrollRef}>
        {visibleTabs.map((tab) => {
          const active = pathname === tab.path;
          return (
            <span key={tab.path} className={`workTab ${active ? "active" : ""}`}>
              <button
                type="button"
                onClick={() => router.push(tab.path as Route)}
                aria-current={active ? "page" : undefined}
              >
                {tab.label}
              </button>
              <button
                type="button"
                className="workTabClose"
                aria-label={`Close ${tab.label}`}
                onClick={(e) => {
                  e.stopPropagation();
                  state.closeTab(tab.path);
                }}
              >
                <X size={12} />
              </button>
            </span>
          );
        })}
        {visibleTabs.length > 1 ? (
          <button type="button" className="workTabsClear" onClick={state.closeAll} aria-label="Close all tabs">
            Clear all
          </button>
        ) : null}
      </div>

      {canScrollRight ? (
        <button
          type="button"
          className="workTabsScroll workTabsScrollRight"
          aria-label="Scroll tabs right"
          onClick={() => scrollBy("right")}
        >
          <ChevronRight size={14} />
        </button>
      ) : null}
    </nav>
  );
}
