"use client";

import { Badge } from "@/components/ui/badge";
import { DataTablePage } from "@/modules/workspace/DataTablePage";
import { pipelineStageLabel } from "./schemas";
import { useCallback, useState } from "react";
import type { PipelineItem, PipelineStage } from "@/modules/staff/pipeline";

// ── Stage badge variant mapping ──────────────────────────────────────────

function stageBadgeVariant(stage: PipelineStage) {
  switch (stage) {
    case "pending_review": return "warning";
    case "interviewing": return "success";
    case "offered": return "success";
    case "hired": return "success";
    case "rejected": return "secondary";
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
        <div className="p-3 text-[13px] font-medium rounded-lg bg-destructive/10 text-destructive border-l-4 border-destructive">
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
              <strong className="text-[13px] text-foreground">
                {row.candidateName}
              </strong>
            ),
          },
          {
            key: "position",
            label: "Position",
            render: (row) => (
              <span className="text-[13px] text-muted-foreground">
                {row.positionTitle}
              </span>
            ),
          },
          {
            key: "company",
            label: "Company",
            render: (row) => (
              <span className="text-[13px] text-muted-foreground">
                {row.companyName}
              </span>
            ),
          },
          {
            key: "stage",
            label: "Stage",
            render: (row) => (
              <div className="flex items-center gap-2">
                <Badge variant={stageBadgeVariant(row.stage)}>
                  {pipelineStageLabel[row.stage] ?? row.stage}
                </Badge>
                <select
                  value=""
                  onChange={(e) => {
                    const val = e.target.value as PipelineStage;
                    if (val) handleStageChange(row.id, val);
                  }}
                  disabled={changingId === row.id}
                  className="text-[11px] px-1.5 py-0.5 rounded-md cursor-pointer bg-card text-muted-foreground border border-border"
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
                  ? "text-rose-500"
                  : row.priority === "low"
                    ? "text-muted-foreground"
                    : "text-amber-500";
              return (
                <span className={`text-[12px] font-medium capitalize ${color}`}>
                  {row.priority}
                </span>
              );
            },
          },
          {
            key: "updated",
            label: "Updated",
            render: (row) => (
              <span className="text-[12px] text-muted-foreground">
                {formatDate(row.updatedAt)}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
