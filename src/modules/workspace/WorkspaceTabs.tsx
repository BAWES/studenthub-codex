"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navForRole } from "./navigation";
import type { Role } from "@/modules/auth/types";

/**
 * WorkspaceTabs — Horizontal tab bar showing navigation sections for the current role.
 *
 * Renders inside the workspaceStage, above the page content, giving users a
 * visible tab-based navigation that complements the sidebar rail.
 */
export function WorkspaceTabs({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = navForRole(role);

  // Skip if only one item (just the Dashboard — no tab bar needed)
  if (items.length <= 1) return null;

  return (
    <nav className="workspaceTabs" role="tablist" aria-label={`${role} section navigation`}>
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
            className={active ? "active" : ""}
          >
            <Icon size={16} strokeWidth={2} aria-hidden="true" />
            <span>{item.label}</span>
            {active && <span className="workspaceTabIndicator" aria-hidden="true" />}
          </Link>
        );
      })}
    </nav>
  );
}
