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
        return (
          <Link aria-current={active ? "page" : undefined} className={active ? "active" : ""} href={item.href} key={item.href}>
            <span>{navToken(item.label)}</span>
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
        return (
          <Link aria-current={active ? "page" : undefined} className={active ? "active" : ""} href={item.href} key={item.href}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/hub") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navToken(label: string) {
  const normalized = label.toLowerCase();
  if (normalized.includes("hub")) return "⌘";
  if (normalized.includes("overview")) return "Ov";
  if (normalized.includes("candidate")) return "Ca";
  if (normalized.includes("company")) return "Co";
  if (normalized.includes("request")) return "Rq";
  if (normalized.includes("transfer")) return "Tr";
  if (normalized.includes("invitation")) return "In";
  if (normalized.includes("work")) return "Wk";
  if (normalized.includes("id")) return "ID";
  return label.slice(0, 2);
}
