"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import type { NavItem } from "./navigation";
import { cn } from "@/lib/utils";

export function WorkspaceNavigation({ items, role }: { items: NavItem[]; role: string }) {
  const pathname = usePathname();
  return (
    <nav
      className="flex w-11 flex-col items-center gap-[3px] overflow-hidden transition-[width] duration-300 group-hover/rail:w-full md:w-11 md:group-hover/rail:w-full"
      aria-label={`${role} workspace navigation`}
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "w-full min-h-[38px] justify-start gap-2.5 px-[9px] overflow-hidden whitespace-nowrap",
              active &&
                "bg-[color-mix(in_srgb,#eb6651_12%,transparent)] text-[#eb6651]"
            )}
            href={item.href}
            key={item.href}
            title={item.label}
          >
            <Icon size={18} strokeWidth={2} aria-hidden="true" className="shrink-0" />
            <strong className="truncate">{item.label}</strong>
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
          <Link
            aria-current={active ? "page" : undefined}
            className={active ? "active" : ""}
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
  return pathname === href || pathname.startsWith(`${href}/`);
}
