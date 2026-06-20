"use client";

import { DataTablePage } from "@/modules/workspace/DataTablePage";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { pipelineStageColor, pipelineStageLabel } from "./schemas";
import { useCallback, useState } from "react";
import type { PipelineItem, PipelineStage } from "@/modules/staff/pipeline";

// ── Stage badge variant mapping ──────────────────────────────────────────

function stageBadgeVariant(stage: PipelineStage): string {
  switch (stage) {
    case "pending_review": return "warning";
    case "interviewing": return "info";
    case "offered": return "success";
    case "hired": return "success";
    case "rejected": return "error";
    default: return "default";
  }
}

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-KW", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Row type ─────────────────────────────────────────────────────────────

type PipelineTableRow = {
  id: string;
  candidateName: string;
  positionTitle: string;
  companyName: string;
  stage: PipelineStage;
  priority: string;
  updatedAt: Date;
};

const ALL_STAGES: PipelineStage[] = [
  "pending_review",
  "interviewing",
  "offered",
  "hired",
  "rejected",
];

// ── Component ────────────────────────────────────────────────────────────

export type PipelineDataTableProps = {
  items: PipelineItem[];
  onStageChange: (itemId: string, targetStage: PipelineStage) => Promise<void>;
};

export function PipelineDataTable({ items, onStageChange }: PipelineDataTableProps) {
  const [changingId, setChangingId] = useState<string | null>(null);
  const [stageError, setStageError] = useState<string | null>(null);

  const handleStageChange = useCallback(
    async (itemId: string, stage: PipelineStage) => {
      setChangingId(itemId);
      setStageError(null);
      try {
        await onStageChange(itemId, stage);
      } catch {
        setStageError("Failed to update stage. Please try again.");
      } finally {
        setChangingId(null);
      }
    },
    [onStageChange],
  );

  const rows: PipelineTableRow[] = items.map((item) => ({
    id: item.id,
    candidateName: item.candidateName,
    positionTitle: item.positionTitle,
    companyName: item.companyName,
    stage: item.stage,
    priority: item.priority ?? "normal",
    updatedAt: item.updatedAt,
  }));

  return (
    <div className="space-y-3">
      {stageError && (
        <div
          className="p-3 text-[13px] font-medium rounded-lg"
          style={{
            background: "var(--rose-50, rgba(244,63,94,0.08))",
            color: "var(--rose-500, #f43f5e)",
            borderLeft: "4px solid var(--rose-500, #f43f5e)",
          }}
        >
          {stageError}
        </div>
      )}
      <DataTablePage
        title="Pipeline Items"
        description="All candidates in your pipeline."
        rows={rows}
        searchable
        searchPlaceholder="Search by candidate, position, or company..."
        columns={[
          {
            key: "candidate",
            label: "Candidate",
            render: (row) => (
              <strong
                className="text-[13px]"
                style={{ color: "var(--text-primary, var(--ink))" }}
              >
                {row.candidateName}
              </strong>
            ),
          },
          {
            key: "position",
            label: "Position",
            render: (row) => (
              <span
                className="text-[13px]"
                style={{ color: "var(--text-secondary, var(--muted))" }}
              >
                {row.positionTitle}
              </span>
            ),
          },
          {
            key: "company",
            label: "Company",
            render: (row) => (
              <span
                className="text-[13px]"
                style={{ color: "var(--text-secondary, var(--muted))" }}
              >
                {row.companyName}
              </span>
            ),
          },
          {
            key: "stage",
            label: "Stage",
            render: (row) => (
              <div className="flex items-center gap-2">
                <StatusBadge
                  variant={stageBadgeVariant(row.stage)}
                  label={pipelineStageLabel[row.stage] ?? row.stage}
                  size="sm"
                />
                <select
                  value=""
                  onChange={(e) => {
                    const val = e.target.value as PipelineStage;
                    if (val) handleStageChange(row.id, val);
                  }}
                  disabled={changingId === row.id}
                  className="text-[11px] px-1.5 py-0.5 rounded-md cursor-pointer"
                  style={{
                    background: "var(--surface)",
                    color: "var(--text-tertiary, var(--muted))",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  aria-label={`Change stage for ${row.candidateName}`}
                >
                  <option value="">Move to…</option>
                  {ALL_STAGES.filter((s) => s !== row.stage).map((s) => (
                    <option key={s} value={s}>
                      {pipelineStageLabel[s] ?? s}
                    </option>
                  ))}
                </select>
              </div>
            ),
          },
          {
            key: "priority",
            label: "Priority",
            render: (row) => {
              const color =
                row.priority === "high"
                  ? "var(--rose-500, #f43f5e)"
                  : row.priority === "low"
                    ? "var(--text-tertiary, var(--muted))"
                    : "var(--amber-500, #f59e0b)";
              return (
                <span
                  className="text-[12px] font-medium capitalize"
                  style={{ color }}
                >
                  {row.priority}
                </span>
              );
            },
          },
          {
            key: "updated",
            label: "Updated",
            render: (row) => (
              <span
                className="text-[12px]"
                style={{ color: "var(--text-tertiary, var(--muted))" }}
              >
                {formatDate(row.updatedAt)}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
