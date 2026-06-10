"use client";

import type { PipelineItem, PipelineMetrics, PipelineStage } from "@/modules/staff/pipeline";
import { StageMetricsRow } from "./StageMetricsRow";
import { PipelineBoard } from "./PipelineBoard";
import { PipelineDataTable } from "./PipelineDataTable";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useState } from "react";

export interface StaffPipelineDashboardProps {
  initialItems: PipelineItem[];
  metrics: PipelineMetrics;
  onStageChange: (itemId: string, targetStage: PipelineStage) => void;
}

type ViewMode = "board" | "table";

export function StaffPipelineDashboard({
  initialItems,
  metrics,
  onStageChange,
}: StaffPipelineDashboardProps) {
  const [items, setItems] = useState(initialItems);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("board");

  const handleStageChange = async (itemId: string, targetStage: PipelineStage) => {
    // Optimistic update
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, stage: targetStage } : item,
      ),
    );
    setError(null);

    try {
      await onStageChange(itemId, targetStage);
    } catch {
      // Rollback on error
      setItems(initialItems);
      setError("Failed to update pipeline stage. Reverted.");
    }
  };

  return (
    <section className="space-y-4">
      {/* Error banner */}
      {error && (
        <GlassPanel
          variant="strong"
          radius="md"
          className="p-3"
          style={{
            borderLeft: "4px solid var(--rose-500, #f43f5e)",
            background: "var(--rose-50, rgba(244,63,94,0.08))",
          }}
        >
          <span className="text-[13px] font-medium" style={{ color: "var(--rose-500, #f43f5e)" }}>
            {error}
          </span>
        </GlassPanel>
      )}

      {/* Pipeline stage metrics */}
      <StageMetricsRow metrics={metrics} />

      {/* View mode toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setViewMode("board")}
          className="text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
          style={{
            background: viewMode === "board"
              ? "var(--sh-glass-bg-strong, rgba(255,255,255,0.08))"
              : "transparent",
            color: viewMode === "board"
              ? "var(--text-primary, var(--ink))"
              : "var(--text-tertiary, var(--muted))",
            border: "1px solid",
            borderColor: viewMode === "board"
              ? "rgba(255,255,255,0.12)"
              : "transparent",
          }}
        >
          Board
        </button>
        <button
          type="button"
          onClick={() => setViewMode("table")}
          className="text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
          style={{
            background: viewMode === "table"
              ? "var(--sh-glass-bg-strong, rgba(255,255,255,0.08))"
              : "transparent",
            color: viewMode === "table"
              ? "var(--text-primary, var(--ink))"
              : "var(--text-tertiary, var(--muted))",
            border: "1px solid",
            borderColor: viewMode === "table"
              ? "rgba(255,255,255,0.12)"
              : "transparent",
          }}
        >
          Table
        </button>
      </div>

      {/* Pipeline content */}
      {viewMode === "board" ? (
        <GlassPanel variant="subtle" radius="lg" noPadding>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3
                className="text-[14px] font-semibold m-0"
                style={{ color: "var(--text-primary, var(--ink))" }}
              >
                Candidate Pipeline
              </h3>
              <span
                className="text-[11px] font-medium"
                style={{ color: "var(--text-tertiary, var(--muted))" }}
              >
                {items.length} total candidates
              </span>
            </div>
            <PipelineBoard items={items} onStageChange={handleStageChange} />
          </div>
        </GlassPanel>
      ) : (
        <PipelineDataTable
          items={items}
          onStageChange={handleStageChange}
        />
      )}

      {/* Drag hint (board only) */}
      {viewMode === "board" && (
        <p
          className="text-[11px] text-center m-0"
          style={{ color: "var(--text-tertiary, var(--muted))" }}
        >
          Drag cards between columns to update candidate pipeline stage
        </p>
      )}
    </section>
  );
}
