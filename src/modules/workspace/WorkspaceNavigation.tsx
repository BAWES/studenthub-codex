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
      className={cn(
        "grid content-start gap-[3px] w-11",
        "transition-all duration-300 ease-[var(--sh-easing)]",
        "group-hover/rail:w-full overflow-hidden",
      )}
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
              "relative flex items-center gap-2.5 min-h-[38px] px-[9px]",
              "text-muted-foreground no-underline whitespace-nowrap overflow-hidden",
              "transition-[background,color,box-shadow,padding] duration-180",
              active && [
                "bg-[color-mix(in_srgb,_#eb6651_12%,_transparent)] text-[#eb6651]",
                "before:absolute before:inset-y-0 before:left-0",
                "before:w-[3px] before:h-5 before:my-auto",
                "before:rounded-r-sm before:bg-[#eb6651]",
                "before:content-['']",
              ],
            )}
            href={item.href}
            key={item.href}
            title={item.label}
          >
            <Icon size={18} strokeWidth={2} aria-hidden="true" />
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
                ? "text-[#eb6651]"
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
