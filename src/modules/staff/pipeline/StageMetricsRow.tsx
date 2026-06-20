"use client";

import { pipelineStageColor, pipelineStageLabel } from "./schemas";
import type { PipelineMetrics, PipelineStage } from "@/modules/staff/pipeline";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StageMetricsRowProps {
  metrics: PipelineMetrics;
}

/** Map from PipelineStage → camelCase metric key in PipelineMetrics */
const STAGE_TO_METRIC: Record<PipelineStage, keyof PipelineMetrics> = {
  pending_review: "pendingReview",
  interviewing: "interviewing",
  offered: "offered",
  hired: "hired",
  rejected: "rejected",
};

const STAGES: PipelineStage[] = [
  "pending_review",
  "interviewing",
  "offered",
  "hired",
  "rejected",
];

export function StageMetricsRow({ metrics }: StageMetricsRowProps) {
  return (
    <div className="grid grid-cols-5 gap-3 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
      {STAGES.map((stage) => {
        const metricKey = STAGE_TO_METRIC[stage];
        const count = metrics[metricKey] as number;
        const trend = metrics.trends[stage];
        const color = pipelineStageColor[stage];
        const label = pipelineStageLabel[stage] ?? stage;

        const TrendIcon =
          trend.direction === "up"
            ? TrendingUp
            : trend.direction === "down"
              ? TrendingDown
              : Minus;

        return (
          <Card
            key={stage}
            className="relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
            style={{
              borderLeft: `4px solid ${color}`,
            }}
          >
            <div className="p-4 space-y-2">
              {/* Count */}
              <strong
                className="block text-[32px] leading-[1] font-bold tracking-[-0.02em]"
                style={{ color }}
              >
                {count.toLocaleString()}
              </strong>
              {/* Label */}
              <span className="block text-[13px] font-medium text-muted-foreground">
                {label}
              </span>
              {/* Trend */}
              <div className="flex items-center gap-1">
                <TrendIcon
                  size={12}
                  className={
                    trend.direction === "up"
                      ? "text-emerald-500"
                      : trend.direction === "down"
                        ? "text-rose-500"
                        : "text-muted-foreground"
                  }
                />
                <span className="text-[11px] text-muted-foreground">
                  {trend.label} this week
                </span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
