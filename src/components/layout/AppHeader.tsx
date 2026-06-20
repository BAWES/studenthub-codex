"use client";

import Link from "next/link";
import { useWorkspaceOS } from "@/modules/workspace/WorkspaceOSContext";
import { NavTabs } from "./NavTabs";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";

/**
 * OS Glass App Header — sticky top navigation bar.
 *
 * Features:
 * - Glass-morphism background with backdrop blur
 * - Brand logo (links to /app)
 * - Role-aware navigation tabs
 * - Notification bell
 * - User avatar dropdown menu
 * - Entrance slide-in animation
 */
export function AppHeader() {
  const { session } = useWorkspaceOS();

  if (!session) {
    return null;
  }

  return (
    <header className="shAppHeader">
      <div className="shAppHeaderGlass">
        <div className="shAppHeaderInner">
          {/* Brand Logo */}
          <Link
            href="/app"
            className="shAppHeaderBrand"
            aria-label="StudentHub app"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="shAppHeaderLogoIcon"
            >
              <rect width="24" height="24" rx="6" fill="currentColor" />
              <text
                x="12"
                y="16"
                textAnchor="middle"
                fill="var(--paper)"
                fontSize="12"
                fontWeight="700"
              >
                SH
              </text>
            </svg>
            <strong>StudentHub</strong>
          </Link>

          {/* Role-aware nav tabs */}
          <NavTabs role={session.role} />

          {/* Right actions */}
          <div className="shAppHeaderActions">
            <NotificationBell count={0} />
            <UserMenu name={session.name} email={session.email} />
          </div>
        </div>
      </div>
    </header>
  );
}
