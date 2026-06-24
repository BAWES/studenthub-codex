"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export function WorkTabs({ state }: { state: WorkTabState }) {
  const pathname = usePathname();
  const router = useRouter();

  if (!state.tabs.length) return null;

  return (
    <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none px-1" aria-label="Recently opened records">
      {state.tabs.map((tab) => {
        const active = pathname === tab.path;
        return (
          <span
            key={tab.path}
            className={`inline-flex items-center overflow-hidden rounded-md border shrink-0 ${
              active
                ? "border-primary bg-accent"
                : "border-border bg-card"
            }`}
          >
            <button
              type="button"
              onClick={() => router.push(tab.path as Route)}
              aria-current={active ? "page" : undefined}
              className={`inline-flex items-center border-0 bg-none px-2.5 text-xs font-bold whitespace-nowrap cursor-pointer ${
                active ? "text-primary" : "text-foreground"
              }`}
            >
              {tab.label}
            </button>
            <button
              type="button"
              aria-label={`Close ${tab.label}`}
              onClick={(e) => {
                e.stopPropagation();
                state.closeTab(tab.path);
              }}
              className="inline-flex items-center justify-center min-w-6 min-h-6 border-0 border-l border-border bg-none p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
            >
              <X size={12} />
            </button>
          </span>
        );
      })}
      {state.tabs.length > 1 ? (
        <Button type="button" variant="ghost" size="sm" onClick={state.closeAll} aria-label="Close all tabs">
          Clear all
        </Button>
      ) : null}
    </nav>
  );
}
