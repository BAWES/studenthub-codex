"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { NavItem } from "./navigation";

export function WorkspaceNavigation({ items, role }: { items: NavItem[]; role: string }) {
  const pathname = usePathname();
  return (
    <nav className="flex w-full flex-col gap-0.5" aria-label={`${role} workspace navigation`}>
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "w-full justify-start gap-2.5 px-3.5 h-10 no-underline font-medium text-sm",
              active
                ? "bg-[#1f73b7]/10 text-[#1f73b7] font-semibold hover:bg-[#1f73b7]/15 hover:text-[#1f73b7]"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
            href={item.href}
            key={item.href}
          >
            <Icon size={16} strokeWidth={2.5} aria-hidden="true" />
            <span>{item.label}</span>
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
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "flex flex-col items-center gap-0.5 py-1.5 px-2.5 min-w-[52px] no-underline text-[10px] font-semibold leading-tight",
              active
                ? "bg-[#1f73b7]/10 text-[#1f73b7]"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
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
