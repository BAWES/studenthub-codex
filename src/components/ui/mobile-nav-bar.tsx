"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navForRole } from "@/modules/workspace/navigation";
import { cn } from "@/lib/utils";
import type { Role } from "@/modules/auth/types";

export interface MobileNavBarProps {
  role: Role;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  unreadBadges?: Record<string, number>;
}

/**
 * Mobile bottom tab bar — role-aware navigation using Tailwind & shadcn primitives.
 * Fixed at the bottom on viewports ≤768px (max-md).
 * Uses Zendesk Coral (#eb6651) for active state, no glass/blur effects.
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
        "px-4 pb-[calc(4px+env(safe-area-inset-bottom))]",
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
              "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg no-underline",
              "text-xs font-medium leading-none transition-colors",
              "active:scale-[0.94] transition-transform duration-150",
              active
                ? "text-[#eb6651]"
                : "text-muted-foreground/70 hover:text-foreground hover:text-opacity-100",
            )}
            aria-current={active ? "page" : undefined}
            aria-label={`${item.label}${badgeCount ? ` (${badgeCount} unread)` : ""}`}
          >
            <div className="relative">
              <Icon size={20} strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
              {active && (
                <span
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#eb6651]"
                  aria-hidden="true"
                />
              )}
              {badgeCount ? (
                <span
                  className="absolute -top-0.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold leading-4 text-center pointer-events-none"
                  data-testid={`badge-${badgeKey}`}
                >
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              ) : null}
            </div>
            <span className="text-[10px] font-medium leading-none">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
