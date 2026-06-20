"use client";

import type { HomeActivityItem } from "@/app/company/schemas";
import { EmptyState } from "@/modules/workspace/EmptyState";
import { formatDate } from "@/modules/workspace/format";
import { Activity, FileText, MessageSquare, UserPlus, RefreshCw } from "lucide-react";

type CompanyActivityPanelProps = {
  activities: HomeActivityItem[];
};

const activityIcons: Record<HomeActivityItem["type"], typeof Activity> = {
  request_created: FileText,
  request_updated: RefreshCw,
  note_added: MessageSquare,
  application_received: UserPlus,
};

/**
 * CompanyActivityPanel — recent activity feed panel.
 * Shows the last 30 actions across linked company requests.
 */
export function CompanyActivityPanel({
  activities,
}: CompanyActivityPanelProps) {
  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
            Recent Activity
          </h2>
          <p className="text-xs mt-0.5 text-muted-foreground">
            Last {activities.length} actions
          </p>
        </div>
        <Activity className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </div>

      <div className="space-y-1">
        {activities.length ? (
          activities.map((activity) => {
            const Icon = activityIcons[activity.type] ?? Activity;
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              >
                <div
                  className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30"
                >
                  <Icon className="size-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs leading-relaxed line-clamp-2 text-foreground">
                    {activity.detail}
                  </p>
                  <span className="text-[11px] mt-0.5 block text-muted-foreground">
                    {formatDate(activity.timestamp)}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState
            variant="empty"
            message="No recent activity"
            hint="Activity will appear here as hiring requests are created and updated."
          />
        )}
      </div>
    </div>
  );
}
