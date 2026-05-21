"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";
import { X } from "lucide-react";

type WorkTab = {
  path: string;
  label: string;
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

export function useWorkTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const [tabs, setTabs] = useState<WorkTab[]>([]);

  useEffect(() => {
    setTabs(readTabs());
  }, []);

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

export function WorkTabs({ state }: { state: WorkTabState }) {
  const pathname = usePathname();
  const router = useRouter();

  if (!state.tabs.length) return null;

  return (
    <nav
      className="flex items-center gap-1 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Recently opened records"
    >
      {state.tabs.map((tab) => {
        const active = pathname === tab.path;
        return (
          <span
            key={tab.path}
            className={`inline-flex items-center border rounded-md overflow-hidden shrink-0 ${
              active
                ? "border-[var(--blue)] bg-[#eef5ff] dark:border-[var(--blue)] dark:bg-[rgba(138,191,255,0.12)]"
                : "border-[var(--line)] bg-[var(--surface-soft)] dark:border-[var(--line)] dark:bg-[var(--surface-soft)]"
            }`}
          >
            <button
              type="button"
              onClick={() => router.push(tab.path as Route)}
              aria-current={active ? "page" : undefined}
              className={`min-h-8 inline-flex items-center border-0 bg-none text-xs font-bold px-2.5 cursor-pointer whitespace-nowrap ${
                active ? "text-[var(--blue)]" : "text-[var(--ink)]"
              }`}
            >
              {tab.label}
            </button>
            <button
              type="button"
              className="min-w-6 min-h-6 inline-flex items-center justify-center border-0 border-l border-[var(--line)] bg-none text-[var(--muted)] cursor-pointer p-0 hover:text-[var(--rose)] hover:bg-[rgba(180,35,87,0.08)]"
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
      {state.tabs.length > 1 ? (
        <button
          type="button"
          className="min-h-8 inline-flex items-center border border-transparent rounded-md bg-none text-[var(--faint)] text-[11px] font-semibold px-2.5 cursor-pointer whitespace-nowrap shrink-0 hover:text-[var(--rose)] hover:border-[var(--line)]"
          onClick={state.closeAll}
          aria-label="Close all tabs"
        >
          Clear all
        </button>
      ) : null}
    </nav>
  );
}
