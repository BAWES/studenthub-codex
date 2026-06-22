"use client";

import Link from "next/link";
import { useWorkspaceOS } from "@/modules/workspace/WorkspaceOSContext";
import { NavTabs } from "./NavTabs";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";

/**
 * App Header — sticky top navigation bar.
 *
 * Features:
 * - Clean border-bottom, no glass effects
 * - Brand logo (links to /app)
 * - Role-aware navigation tabs
 * - Notification bell
 * - User avatar dropdown menu
 */
export function AppHeader() {
  const { session } = useWorkspaceOS();

  if (!session) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="flex h-[52px] items-center justify-between px-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/app"
            className="flex items-center gap-2 no-underline"
            aria-label="StudentHub app"
          >
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              SH
            </span>
            <strong className="text-sm font-semibold text-foreground">StudentHub</strong>
          </Link>

          {/* Role-aware nav tabs */}
          <NavTabs role={session.role} />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <NotificationBell count={0} />
          <UserMenu name={session.name} email={session.email} />
        </div>
      </div>
    </header>
  );
}
