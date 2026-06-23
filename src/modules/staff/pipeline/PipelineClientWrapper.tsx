"use client";

import { useCallback, useState, useEffect } from "react";
import { StaffPipelineDashboard } from "@/modules/staff/pipeline/StaffPipelineDashboard";
import type { PipelineItem, PipelineMetrics, PipelineStage } from "@/modules/staff/pipeline";

interface PipelineClientWrapperProps {
  initialItems: PipelineItem[];
  metrics: PipelineMetrics;
  updateAction: (
    invitationUuid: string,
    stage: PipelineStage,
  ) => Promise<{ success: boolean; error?: string }>;
}

export function PipelineClientWrapper({
  initialItems,
  metrics,
  updateAction,
}: PipelineClientWrapperProps) {
  const [items, setItems] = useState(initialItems);
  const [currentMetrics, setCurrentMetrics] = useState(metrics);

  // Sync initial state when props change
  useEffect(() => {
    setItems(initialItems);
    setCurrentMetrics(metrics);
  }, [initialItems, metrics]);

  const handleStageChange = useCallback(
    async (itemId: string, targetStage: PipelineStage) => {
      const result = await updateAction(itemId, targetStage);

      if (result.success) {
        // Optimistic update
        setItems((prev) =>
          prev.map((item) => {
            if (item.id === itemId) {
              return { ...item, stage: targetStage };
            }
            return item;
          }),
        );

        // Recalculate metrics
        setItems((prev) => {
          const byStage = (stage: PipelineStage) =>
            prev.filter((i) => i.stage === stage).length;
          setCurrentMetrics((m) => ({
            ...m,
            pendingReview: byStage("pending_review"),
            interviewing: byStage("interviewing"),
            offered: byStage("offered"),
            hired: byStage("hired"),
            rejected: byStage("rejected"),
          }));
          return prev;
        });
      } else {
        throw new Error(result.error ?? "Failed to update");
      }
    },
    [updateAction],
  );

  return (
    <StaffPipelineDashboard
      initialItems={items}
      metrics={currentMetrics}
      onStageChange={handleStageChange}
    />
  );
}
