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
 * Glass-morphism bottom tab bar for mobile viewports.
 * Role-aware navigation items with active spring indicator, unread badges,
 * safe-area insets, and reduced-motion support.
 */
export function MobileNavBar({
  role,
  unreadBadges,
}: MobileNavBarProps) {
  const pathname = usePathname();
  const items = navForRole(role);

  return (
    <nav className="shMobileNavBar" aria-label={`${role} mobile navigation`}>
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
              "shMobileNavTab",
              active ? "shMobileNavTabActive" : "shMobileNavTabInactive",
            )}
            aria-current={active ? "page" : undefined}
            aria-label={`${item.label}${badgeCount ? ` (${badgeCount} unread)` : ""}`}
          >
            <div className="relative">
              <Icon size={20} strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
              {active && <span className="shMobileNavIndicator" />}
              {badgeCount ? (
                <span className="shMobileNavBadge" data-testid={`badge-${badgeKey}`}>
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              ) : null}
            </div>
            <span className="shMobileNavLabel">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
