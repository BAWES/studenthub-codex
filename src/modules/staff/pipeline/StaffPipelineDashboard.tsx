"use client";

import type { PipelineItem, PipelineMetrics, PipelineStage } from "@/modules/staff/pipeline";
import { StageMetricsRow } from "./StageMetricsRow";
import { PipelineBoard } from "./PipelineBoard";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useState } from "react";

export interface StaffPipelineDashboardProps {
  initialItems: PipelineItem[];
  metrics: PipelineMetrics;
  onStageChange: (itemId: string, targetStage: PipelineStage) => void;
}

export function StaffPipelineDashboard({
  initialItems,
  metrics,
  onStageChange,
}: StaffPipelineDashboardProps) {
  const [items, setItems] = useState(initialItems);
  const [error, setError] = useState<string | null>(null);

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

      {/* Pipeline kanban board */}
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

      {/* Drag hint */}
      <p
        className="text-[11px] text-center m-0"
        style={{ color: "var(--text-tertiary, var(--muted))" }}
      >
        Drag cards between columns to update candidate pipeline stage
      </p>
    </section>
  );
}
