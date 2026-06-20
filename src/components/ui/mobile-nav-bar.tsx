"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navForRole } from "@/modules/workspace/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { Role } from "@/modules/auth/types";

export interface MobileNavBarProps {
  role: Role;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  unreadBadges?: Record<string, number>;
}

/**
 * Mobile bottom tab bar for viewports ≤760px.
 * Uses shadcn button variants, no glass effects, Tailwind-only styling.
 * Role-aware navigation items with unread badges.
 */
export function MobileNavBar({
  role,
  unreadBadges,
}: MobileNavBarProps) {
  const pathname = usePathname();
  const items = navForRole(role);

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "hidden max-md:flex items-center justify-around",
        "border-t border-border bg-background",
        "px-2 pb-[env(safe-area-inset-bottom)]",
        "animate-in slide-in-from-bottom duration-300",
      )}
      aria-label={`${role} mobile navigation`}
    >
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const badgeKey = item.label.toLowerCase().replace(/\s+/g, "-");
        const badgeCount = unreadBadges?.[badgeKey];
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "flex flex-col items-center gap-0.5 py-2 px-3 h-auto",
              "text-xs font-medium leading-none",
              active
                ? "text-[#1f73b7]"
                : "text-muted-foreground hover:text-foreground",
            )}
            aria-current={active ? "page" : undefined}
            aria-label={`${item.label}${badgeCount ? ` (${badgeCount} unread)` : ""}`}
          >
            <div className="relative">
              <Icon size={20} strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
              {badgeCount ? (
                <span
                  className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold leading-none"
                  data-testid={`badge-${badgeKey}`}
                >
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              ) : null}
            </div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
