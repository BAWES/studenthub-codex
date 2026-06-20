"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";
import type { Role } from "@/modules/auth/types";
import type { LucideIcon } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────

export interface TabEntry {
  /** Unique identifier (typically the href). */
  id: string;
  /** Display label for the tab. */
  label: string;
  /** Route the tab navigates to. */
  href: string;
  /** Optional lucide icon name (string, resolved in TabBar). */
  icon: string | null;
  /** Whether the tab is pinned (cannot be closed). */
  pinned: boolean;
  /** Which role created this tab. */
  role: Role;
}

export interface TabContextValue {
  /** All open tabs for the current role. Sorted: pinned first, then by order. */
  tabs: TabEntry[];
  /** The currently active tab ID (matches the current pathname). */
  activeTabId: string | null;
  /** Open or activate a tab. Creates one if it doesn't exist. */
  openTab: (href: string, label: string, icon?: string | null) => void;
  /** Close a tab by ID. No-op if pinned. */
  closeTab: (id: string) => void;
  /** Toggle the pinned state of a tab. */
  pinTab: (id: string) => void;
  /** Reorder a tab by moving from one index to another. */
  moveTab: (fromIndex: number, toIndex: number) => void;
  /** Set the active tab by ID (navigates to the tab's route). */
  setActive: (id: string) => void;
}

// ─── Storage key ───────────────────────────────────────────────────────

const STORAGE_KEY = "sh-workspace-tabs";

/** Maximum unpinned tabs per role before oldest is auto-closed. */
const MAX_TABS = 12;

// ─── Helpers ────────────────────────────────────────────────────────────

function loadTabs(): TabEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as TabEntry[];
  } catch {
    return [];
  }
}

function saveTabs(tabs: TabEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
  } catch {
    // Storage full or unavailable — silently degrade
  }
}

// ─── Default home tab per role ─────────────────────────────────────────

function homeTabForRole(role: Role): TabEntry {
  return {
    id: `/${role}`,
    label: "Overview",
    href: `/${role}`,
    icon: "User",
    pinned: true,
    role,
  };
}

// ─── Context ────────────────────────────────────────────────────────────

const TabContext = createContext<TabContextValue | null>(null);

export function useTabs(): TabContextValue {
  const ctx = useContext(TabContext);
  if (!ctx) throw new Error("useTabs must be used within <TabProvider>");
  return ctx;
}

// ─── Provider ───────────────────────────────────────────────────────────

export function TabProvider({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // ── All tabs (every role) ─────────────────────────────────────────
  const [allTabs, setAllTabs] = useState<TabEntry[]>([]);
  const hydrated = useRef(false);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    if (!hydrated.current) {
      const saved = loadTabs();
      setAllTabs(saved);
      hydrated.current = true;
    }
  }, []);

  // Persist on every change (after initial hydration)
  useEffect(() => {
    if (hydrated.current) {
      saveTabs(allTabs);
    }
  }, [allTabs]);

  // Tabs filtered to the current role
  const tabs = useMemo(() => {
    const roleTabs = allTabs.filter((t) => t.role === role);
    // Ensure the home tab is always present as the first pinned tab
    const home = homeTabForRole(role);
    const hasHome = roleTabs.some((t) => t.id === home.id);
    if (!hasHome) {
      return [home, ...roleTabs];
    }
    // Sort: pinned first, then by insertion order (stable)
    const pinned = roleTabs.filter((t) => t.pinned);
    const unpinned = roleTabs.filter((t) => !t.pinned);
    return [...pinned, ...unpinned];
  }, [allTabs, role]);

  // Determine active tab from pathname
  const activeTabId = useMemo(() => {
    // Exact match first, then prefix match
    const exact = tabs.find((t) => t.href === pathname);
    if (exact) return exact.id;
    // Prefix match (tab href is a parent of current path)
    const prefix = tabs.find(
      (t) => t.href !== "/" + role && pathname.startsWith(t.href + "/"),
    );
    return prefix?.id ?? tabs[0]?.id ?? null;
  }, [tabs, pathname, role]);

  // ── Actions ───────────────────────────────────────────────────────

  const openTab = useCallback(
    (href: string, label: string, icon?: string | null) => {
      setAllTabs((prev) => {
        const existing = prev.find(
          (t) => t.href === href && t.role === role,
        );
        if (existing) return prev; // Already open

        // ── Enforce max unpinned tabs per role ─────────────────
        const roleUnpinned = prev.filter(
          (t) => t.role === role && !t.pinned,
        );
        let next = prev;
        if (roleUnpinned.length >= MAX_TABS) {
          // Remove the oldest unpinned tab for this role
          const oldestIdx = prev.findIndex(
            (t) => t.role === role && !t.pinned,
          );
          if (oldestIdx !== -1) {
            next = prev.filter((_, i) => i !== oldestIdx);
          }
        }

        const entry: TabEntry = {
          id: href,
          label,
          href,
          icon: icon ?? null,
          pinned: false,
          role,
        };
        return [...next, entry];
      });
    },
    [role],
  );

  const closeTab = useCallback(
    (id: string) => {
      setAllTabs((prev) => {
        const target = prev.find((t) => t.id === id && t.role === role);
        if (!target || target.pinned) return prev;
        const next = prev.filter((t) => t.id !== id);

        // If closing the active tab, navigate to the nearest tab
        if (id === activeTabId) {
          const roleTabs = next.filter((t) => t.role === role);
          // Find the closest index
          const currentIdx = tabs.findIndex((t) => t.id === id);
          const neighbor =
            roleTabs[Math.min(currentIdx, roleTabs.length - 1)] ??
            roleTabs[roleTabs.length - 1];
          if (neighbor) {
            // Defer navigation to avoid state-update-during-render
            setTimeout(() => router.push(neighbor.href as Route), 0);
          }
        }

        return next;
      });
    },
    [role, activeTabId, tabs, router],
  );

  const pinTab = useCallback(
    (id: string) => {
      setAllTabs((prev) =>
        prev.map((t) =>
          t.id === id && t.role === role ? { ...t, pinned: !t.pinned } : t,
        ),
      );
    },
    [role],
  );

  const moveTab = useCallback(
    (fromIndex: number, toIndex: number) => {
      setAllTabs((prev) => {
        const roleTabs = prev.filter((t) => t.role === role);
        if (
          fromIndex < 0 ||
          fromIndex >= roleTabs.length ||
          toIndex < 0 ||
          toIndex >= roleTabs.length ||
          fromIndex === toIndex
        )
          return prev;

        const entry = roleTabs[fromIndex];
        const reordered = [...roleTabs];
        reordered.splice(fromIndex, 1);
        reordered.splice(toIndex, 0, entry);

        // Merge reordered role tabs back with other roles' tabs
        const otherTabs = prev.filter((t) => t.role !== role);
        return [...otherTabs, ...reordered];
      });
    },
    [role],
  );

  const setActive = useCallback(
    (id: string) => {
      const tab = allTabs.find((t) => t.id === id);
      if (tab) {
        router.push(tab.href as Route);
      }
    },
    [allTabs, router],
  );

  // Auto-open tabs on navigation (when pathname changes)
  useEffect(() => {
    if (!hydrated.current) return;
    // Skip for role home pages (already have a pinned home tab)
    if (pathname === `/${role}`) return;
    // Skip if already open
    const alreadyOpen = tabs.some((t) => t.href === pathname);
    if (alreadyOpen) return;

    // Derive a human-friendly label from the pathname
    const segments = pathname.replace(`/${role}/`, "").split("/");
    const label = segments
      .map((s) => s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
      .join(" / ");

    openTab(pathname, label || "Page", null);
  }, [pathname, role, openTab, tabs]);

  const value = useMemo<TabContextValue>(
    () => ({
      tabs,
      activeTabId,
      openTab,
      closeTab,
      pinTab,
      moveTab,
      setActive,
    }),
    [tabs, activeTabId, openTab, closeTab, pinTab, moveTab, setActive],
  );

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
}
