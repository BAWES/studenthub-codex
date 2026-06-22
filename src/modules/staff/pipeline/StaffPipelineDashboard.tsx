"use client";

import type { PipelineItem, PipelineMetrics, PipelineStage } from "@/modules/staff/pipeline";
import { StageMetricsRow } from "./StageMetricsRow";
import { PipelineBoard } from "./PipelineBoard";
import { PipelineDataTable } from "./PipelineDataTable";
import { useState } from "react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

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
      {/* Error banner — shadcn Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      )}

      {/* Pipeline stage metrics */}
      <StageMetricsRow metrics={metrics} />

      {/* View mode toggle — shadcn Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
        <TabsList>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Pipeline content */}
      {viewMode === "board" ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 p-4">
            <CardTitle className="text-[14px] font-semibold">
              Candidate Pipeline
            </CardTitle>
            <span className="text-[11px] font-medium text-muted-foreground">
              {items.length} total candidates
            </span>
          </CardHeader>
          <div className="px-4 pb-4">
            <PipelineBoard items={items} onStageChange={handleStageChange} />
          </div>
        </Card>
      ) : (
        <PipelineDataTable
          items={items}
          onStageChange={handleStageChange}
        />
      )}

      {/* Drag hint (board only) */}
      {viewMode === "board" && (
        <p className="text-[11px] text-center m-0 text-muted-foreground">
          Drag cards between columns to update candidate pipeline stage
        </p>
      )}
    </section>
  );
}
