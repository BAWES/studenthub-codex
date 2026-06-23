"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navForRole } from "./navigation";
import type { Role } from "@/modules/auth/types";
import { cn } from "@/lib/utils";

/**
 * WorkspaceTabs — Horizontal tab bar showing navigation sections for the current role.
 *
 * Renders inside the workspaceStage, above the page content, giving users a
 * visible tab-based navigation that complements the sidebar rail.
 * Uses Zendesk Coral (#eb6651) for active state, no glass effects.
 */
export function WorkspaceTabs({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = navForRole(role);

  // Skip if only one item (no tab bar needed)
  if (items.length <= 1) return null;

  return (
    <nav
      className="flex items-center gap-0 min-h-[36px] px-1 pt-[3px] pb-0 border-b border-border overflow-x-auto [scrollbar-width:none]"
      role="tablist"
      aria-label={`${role} section navigation`}
    >
      {items.map((item) => {
        const roleHome = `/${role}`;
        const active = item.href === roleHome
          ? pathname === roleHome
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            role="tab"
            aria-selected={active}
            className={cn(
              "relative flex items-center gap-[5px] min-w-0 px-[6px] py-[4px] border-0 rounded-t-md text-xs font-medium whitespace-nowrap cursor-pointer transition-colors no-underline",
              active
                ? "bg-card text-foreground after:absolute after:bottom-[-1px] after:left-2 after:right-2 after:h-[2px] after:rounded-t-[1px] after:bg-coral"
                : "text-muted-foreground hover:bg-coral-light hover:text-foreground",
            )}
          >
            <Icon size={16} strokeWidth={2} aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
