"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "./navigation";

export function WorkspaceNavigation({ items, role }: { items: NavItem[]; role: string }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0.5 px-2 py-4" aria-label={`${role} workspace navigation`}>
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "flex items-center gap-3 rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary"
                : "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            }
            href={item.href}
            key={item.href}
          >
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
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-card px-2 py-1 md:hidden"
      aria-label={`${role} mobile navigation`}
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium text-primary"
                : "flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            }
            href={item.href}
            key={item.href}
          >
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
