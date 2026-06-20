"use client";

import type { HomeActiveRequestItem } from "@/app/company/schemas";
import { EmptyState } from "@/modules/workspace/EmptyState";
import { StatusBadge, type StatusBadgeVariant } from "@/modules/workspace/StatusBadge";
import { formatDate } from "@/modules/workspace/format";
import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";

type CompanyRequestPipelineProps = {
  activeRequests: HomeActiveRequestItem[];
};

function statusVariant(status: string): StatusBadgeVariant {
  switch (status) {
    case "started":
      return "info";
    case "pending":
      return "warning";
    case "re_work":
      return "error";
    default:
      return "neutral";
  }
}

/**
 * CompanyRequestPipeline — active hiring requests pipeline view.
 * Lists active requests with status badges and candidate counts.
 */
export function CompanyRequestPipeline({
  activeRequests,
}: CompanyRequestPipelineProps) {
  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
            Active Requests
          </h2>
          <p className="text-xs mt-0.5 text-muted-foreground">
            {activeRequests.length} in pipeline
          </p>
        </div>
        <Link
          href="/company/requests"
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 transition-all hover:opacity-80"
        >
          View All
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>

      <div className="space-y-2">
        {activeRequests.length ? (
          activeRequests.map((req) => (
            <Link
              key={req.id}
              href={`/company/requests/${req.id}`}
              className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate text-foreground">
                  {req.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge variant={statusVariant(req.status)} label={req.status} />
                  <span className="text-xs text-muted-foreground">
                    Created {formatDate(req.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 ml-4 shrink-0">
                <Users className="size-3.5 text-muted-foreground" aria-hidden="true" />
                <span className="text-xs font-medium text-muted-foreground">
                  {req.candidatesCount}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <EmptyState
            variant="empty"
            message="No active requests"
            hint="Create a hiring request to start receiving candidate applications."
          />
        )}
      </div>
    </div>
  );
}
