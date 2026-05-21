"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "./navigation";

export function WorkspaceNavigation({ items, role }: { items: NavItem[]; role: string }) {
  const pathname = usePathname();

  return (
    <nav className="workspaceRailNav" aria-label={`${role} workspace navigation`}>
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link aria-current={active ? "page" : undefined} className={active ? "active" : ""} href={item.href} key={item.href}>
            <Icon size={16} strokeWidth={2.5} aria-hidden="true" />
            <strong>{item.label}</strong>
          </Link>
        );
      })}
    </nav>
  );
}

export function WorkspaceMobileNavigation({ items, role }: { items: NavItem[]; role: string }) {
  const pathname = usePathname();

  return (
    <nav className="mobileTabBar" aria-label={`${role} mobile navigation`}>
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link aria-current={active ? "page" : undefined} className={active ? "active" : ""} href={item.href} key={item.href}>
            <Icon size={20} strokeWidth={2} aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/app") return pathname === href || pathname === "/hub";
  return pathname === href || pathname.startsWith(`${href}/`);
}
