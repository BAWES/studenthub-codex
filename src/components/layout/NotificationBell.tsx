"use client";

import { Bell } from "lucide-react";

export type NotificationBellProps = {
  count: number;
  onClick?: () => void;
};

/**
 * Notification bell icon with unread badge count.
 * Shows bell icon with a rose-tinted badge when count > 0.
 */
export function NotificationBell({ count, onClick }: NotificationBellProps) {
  return (
    <div className="shBellContainer">
      <button
        className="shBellBtn"
        onClick={onClick}
        aria-label={count > 0 ? `Notifications (${count} unread)` : "Notifications"}
        type="button"
      >
        <Bell size={18} strokeWidth={1.5} aria-hidden="true" />
        {count > 0 && (
          <span className="shBellDot" data-testid="notification-badge">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>
    </div>
  );
}
