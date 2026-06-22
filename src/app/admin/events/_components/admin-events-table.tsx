"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { EventItem } from "../schemas";
import { getEventTimeline } from "../actions";

type Props = {
  session: SessionUser;
  events: EventItem[];
};

export function AdminEventsTable({ session, events }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [timelineRequestUuid, setTimelineRequestUuid] = useState<
    string | null
  >(null);
  const [timeline, setTimeline] = useState<
    { date: string; events: EventItem[] }[] | null
  >(null);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  const viewTimeline = useCallback(
    async (requestUuid: string) => {
      setError(null);
      setLoadingTimeline(true);
      setTimelineRequestUuid(requestUuid);
      try {
        const result = await getEventTimeline({ requestUuid });
        setTimeline(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load event timeline",
        );
        setTimeline(null);
      } finally {
        setLoadingTimeline(false);
      }
    },
    [],
  );

  const closeTimeline = useCallback(() => {
    setTimelineRequestUuid(null);
    setTimeline(null);
  }, []);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage events — request activity and audit trail."
      metrics={[
        {
          label: "Total events",
          value: events.length,
          note: "Request activity events loaded",
        },
      ]}
    >
      {error ? (
        <div
          className="mb-4 rounded-lg border px-4 py-3 text-sm border-destructive text-destructive bg-card"
        >
          {error}
        </div>
      ) : null}

      {timelineRequestUuid && timeline ? (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-sm font-semibold text-foreground"
            >
              Timeline for request:{" "}
              <span className="font-mono">{timelineRequestUuid}</span>
            </h3>
            <button
              type="button"
              onClick={closeTimeline}
              className="text-xs px-3 py-1 rounded-md transition-all duration-200 hover:opacity-80"
              style={{
                background: "var(--surface)",
                color: "var(--muted)",
                border: "1px solid var(--border)",
              }}
            >
              Close timeline
            </button>
          </div>
          {timeline.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No events found for this request.
            </p>
          ) : (
            <div className="space-y-4">
              {timeline.map((entry) => (
                <div key={entry.date}>
                  <h4
                    className="text-xs font-semibold uppercase tracking-wider mb-2 text-muted-foreground"
                  >
                    {entry.date}
                  </h4>
                  <div className="space-y-2">
                    {entry.events.map((evt) => (
                      <div
                        key={evt.activity_uuid}
                        className="rounded-lg border p-3 text-sm"
                        style={{
                          borderColor: "var(--border)",
                          background: "var(--surface)",
                        }}
                      >
                        <p className="text-foreground">
                          {evt.activity_detail}
                        </p>
                        <p
                          className="text-xs mt-1 text-muted-foreground"
                        >
                          {evt.staff_name ?? "System"} &middot;{" "}
                          {evt.activity_created_datetime
                            ? new Date(
                                evt.activity_created_datetime,
                              ).toLocaleString()
                            : "—"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      <DataTable
        title="Events"
        description="Request activity events. Click on a request UUID to view its timeline."
        rows={events.map((e) => ({ ...e, id: e.activity_uuid }))}
        rowHref={undefined}
        columns={[
          {
            key: "activity_uuid",
            label: "UUID",
            render: (row) => (
              <span
                className="text-sm font-mono text-muted-foreground"
              >
                {row.activity_uuid.slice(0, 8)}...
              </span>
            ),
          },
          {
            key: "request_uuid",
            label: "Request UUID",
            render: (row) => (
              <button
                type="button"
                onClick={() => viewTimeline(row.request_uuid)}
                className="text-sm font-mono transition-all duration-200 hover:opacity-80"
                style={{ color: "var(--accent)", cursor: "pointer" }}
                disabled={loadingTimeline}
              >
                {row.request_uuid.slice(0, 8)}...
              </button>
            ),
          },
          {
            key: "activity_detail",
            label: "Detail",
            render: (row) => (
              <span
                className="text-sm text-foreground"
              >
                {row.activity_detail ?? "—"}
              </span>
            ),
          },
          {
            key: "staff_name",
            label: "Staff",
            render: (row) => (
              <span
                className="text-sm text-foreground"
              >
                {row.staff_name ?? "—"}
              </span>
            ),
          },
          {
            key: "activity_created_datetime",
            label: "Created",
            render: (row) => {
              const d = row.activity_created_datetime
                ? new Date(row.activity_created_datetime)
                : null;
              return (
                <span
                  className="text-sm text-foreground"
                >
                  {d ? d.toLocaleDateString() : "—"}
                </span>
              );
            },
          },
        ]}
      />
    </WorkspaceShell>
  );
}
