"use client";

import { Bell } from "lucide-react";

export type NotificationBellProps = {
  count: number;
  onClick?: () => void;
};

/**
 * Notification bell icon with unread badge count.
 * Shows bell icon with a destructive-tinted badge when count > 0.
 */
export function NotificationBell({ count, onClick }: NotificationBellProps) {
  return (
    <button
      className="relative flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      onClick={onClick}
      aria-label={count > 0 ? `Notifications (${count} unread)` : "Notifications"}
      type="button"
    >
      <Bell size={18} strokeWidth={1.5} aria-hidden="true" />
      {count > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 flex min-w-[16px] h-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground"
          data-testid="notification-badge"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
