"use client";

import type { PipelineItem, PipelineStage } from "@/modules/staff/pipeline";
import { pipelineStageColor, pipelineStageLabel } from "./schemas";
import { useState, useCallback, useRef } from "react";
import { GripVertical } from "lucide-react";

interface PipelineCardProps {
  item: PipelineItem;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  isDragging?: boolean;
}

function PipelineCard({ item, onDragStart, onDragEnd, isDragging }: PipelineCardProps) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(item.id)}
      onDragEnd={onDragEnd}
      className={`
        cursor-grab active:cursor-grabbing select-none
        transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${isDragging ? "opacity-50 scale-[0.97]" : "hover:-translate-y-0.5"}
      `}
    >
      <div className="rounded-lg border border-border bg-card p-3 space-y-2">
        <div className="flex items-center gap-2">
          <GripVertical size={14} className="shrink-0 text-muted-foreground" />
          <span className="text-[13px] font-semibold leading-snug truncate text-foreground">
            {item.candidateName}
          </span>
        </div>
        <div className="pl-6 space-y-0.5">
          <p className="text-[12px] leading-snug truncate m-0 text-muted-foreground">
            {item.positionTitle}
          </p>
          <p className="text-[11px] leading-snug truncate m-0 text-muted-foreground/70">
            {item.companyName}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Pipeline Column ───────────────────────────────────────────────────

interface PipelineColumnProps {
  stage: PipelineStage;
  items: PipelineItem[];
  onDrop: (itemId: string, targetStage: PipelineStage) => void;
  draggedItemId: string | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
}

const STAGE_ORDER: PipelineStage[] = [
  "pending_review",
  "interviewing",
  "offered",
  "hired",
  "rejected",
];

function PipelineColumn({ stage, items, onDrop, draggedItemId, onDragStart, onDragEnd }: PipelineColumnProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsOver(false);
      const data = e.dataTransfer.getData("text/plain");
      if (data) {
        onDrop(data, stage);
      }
    },
    [stage, onDrop],
  );

  const color = pipelineStageColor[stage];
  const label = pipelineStageLabel[stage] ?? stage;

  return (
    <div
      className={`
        flex flex-col gap-2 min-w-[220px] w-[260px] flex-shrink-0
        rounded-xl p-3 transition-colors duration-200
        ${isOver ? "bg-muted/10 border border-dashed border-border/20" : "bg-transparent border border-transparent"}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-1 pb-2">
        <div className="flex items-center gap-2">
          <div
            className="size-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
            {label}
          </span>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full min-w-[22px] text-center bg-muted text-muted-foreground">
          {items.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
        {items.length > 0 ? (
          items.map((item) => (
            <PipelineCard
              key={item.id}
              item={item}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              isDragging={draggedItemId === item.id}
            />
          ))
        ) : (
          <div className="text-[12px] text-center text-muted-foreground/50 py-6 rounded-lg border border-dashed border-border/10">
            Drop items here
          </div>
        )}
      </div>
    </div>
  );
}

// ── Pipeline Board ────────────────────────────────────────────────────

interface PipelineBoardProps {
  items: PipelineItem[];
  onStageChange: (itemId: string, targetStage: PipelineStage) => void;
}

export function PipelineBoard({ items, onStageChange }: PipelineBoardProps) {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  const handleDragStart = useCallback((id: string) => {
    setDraggedItemId(id);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedItemId(null);
  }, []);

  const handleDrop = useCallback(
    (itemId: string, targetStage: PipelineStage) => {
      setDraggedItemId(null);
      onStageChange(itemId, targetStage);
    },
    [onStageChange],
  );

  const itemsByStage = (stage: PipelineStage) => items.filter((i) => i.stage === stage);

  return (
      <div className="flex gap-3 overflow-x-auto pb-4 pipelineScrollbar">
        {STAGE_ORDER.map((stage) => (
          <PipelineColumn
            key={stage}
            stage={stage}
            items={itemsByStage(stage)}
            onDrop={handleDrop}
            draggedItemId={draggedItemId}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>
    );
  }
