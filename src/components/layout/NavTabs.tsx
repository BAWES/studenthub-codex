"use client";

import { usePathname } from "next/navigation";
import { navForRole } from "@/modules/workspace/navigation";
import type { Role } from "@/modules/auth/types";
import { NavTab } from "./NavTab";

export type NavTabsProps = {
  role: Role;
};

/**
 * Role-aware navigation tab container for the OS Glass App Header.
 * Renders primary tabs for the current role and marks the active one.
 */
export function NavTabs({ role }: NavTabsProps) {
  const pathname = usePathname();
  const items = navForRole(role);

  // Filter out the shared "App" tab for the header nav — it's not needed
  // in the top-level header since the brand logo serves as the home link.
  // Also filter to only show primary tabs (max 6).
  const primaryTabs = items.filter((item) => item.label !== "App").slice(0, 7);

  return (
    <nav className="shAppHeaderNav" aria-label={`${role} navigation`}>
      {primaryTabs.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <NavTab
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={active}
          />
        );
      })}
    </nav>
  );
}
