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
      className="w-11 group-hover/rail:w-full transition-all duration-300 grid content-start gap-[3px]"
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
              "relative flex items-center gap-2.5 min-h-[38px] px-[9px] justify-start w-full whitespace-nowrap overflow-hidden no-underline",
              active
                ? "bg-[color-mix(in_srgb,#1f73b7_12%,transparent)] text-[#1f73b7]"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
            href={item.href}
            key={item.href}
            title={item.label}
          >
            <Icon size={18} strokeWidth={2} aria-hidden="true" />
            <strong className="opacity-0 group-hover/rail:opacity-100 transition-opacity duration-300 delay-[80ms] text-sm font-semibold whitespace-nowrap">
              {item.label}
            </strong>
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
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40",
        "hidden max-md:flex items-center justify-around",
        "border-t border-border bg-background",
        "px-2 pb-[env(safe-area-inset-bottom)]",
      )}
      aria-label={`${role} mobile navigation`}
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-0.5 py-2 px-3 rounded-md",
              "text-xs font-medium leading-none",
              active
                ? "text-[#1f73b7]"
                : "text-muted-foreground hover:text-foreground",
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
  return pathname === href || pathname.startsWith(`${href}/`);
}
