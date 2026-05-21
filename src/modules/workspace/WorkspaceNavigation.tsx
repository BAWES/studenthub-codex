"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "./navigation";

export function WorkspaceNavigation({ items, role }: { items: NavItem[]; role: string }) {
  const pathname = usePathname();
  return (
    <nav className="w-full grid content-start gap-2" aria-label={`${role} workspace navigation`}>
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={`w-full min-h-[42px] flex items-center relative border rounded-lg px-3 no-underline ${
              active
                ? "border-[#d9dee8] bg-[var(--surface-soft)] text-[var(--blue)] shadow-[inset_3px_0_0_var(--blue),0_8px_22px_rgba(16,24,40,0.08)]"
                : "border-transparent text-[var(--muted)] hover:border-[#d9dee8] hover:bg-[var(--surface-soft)] hover:text-[var(--blue)] hover:shadow-[0_8px_22px_rgba(16,24,40,0.08)]"
            }`}
            href={item.href}
            key={item.href}
          >
            <Icon size={16} strokeWidth={2.5} aria-hidden="true" />
            <strong className="text-sm">{item.label}</strong>
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
      className="hidden select-none max-md:fixed max-md:right-0 max-md:bottom-0 max-md:left-0 max-md:z-30 max-md:flex max-md:justify-center max-md:border-t max-md:border-[var(--line)] max-md:bg-[rgba(255,255,255,0.97)] max-md:backdrop-blur-md max-md:pt-1.5 max-md:px-1 max-md:pb-[max(6px,env(safe-area-inset-bottom,6px))]"
      aria-label={`${role} mobile navigation`}
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={`flex-1 min-w-0 max-w-24 min-h-14 flex flex-col items-center justify-center gap-0.5 border-none border-t-[3px] bg-transparent px-0.5 py-1 text-[11px] font-semibold no-underline rounded-md ${
              active ? "border-t-[var(--blue)] text-[var(--blue)]" : "border-t-transparent text-[var(--faint)]"
            }`}
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
