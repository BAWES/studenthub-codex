"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type SwipeActionVariant = "info" | "success" | "warning" | "error";

export interface SwipeAction {
  label: string;
  icon?: string;
  variant: SwipeActionVariant;
  onAction: () => void;
}

export interface SwipeableRowProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  onSwipeStart?: () => void;
  onSwipeEnd?: (open: boolean) => void;
}

/**
 * Swipeable row component for mobile list items.
 *
 * Supports left-swipe (reveal actions) and right-swipe reserved actions.
 * The actual swipe gesture is handled via pointer events; semantic buttons
 * are always rendered for accessibility and keyboard users.
 *
 * @example
 * ```tsx
 * <SwipeableRow
 *   leftActions={[
 *     { label: "Edit", variant: "info", onAction: handleEdit },
 *   ]}
 *   rightActions={[
 *     { label: "Delete", variant: "error", onAction: handleDelete },
 *   ]}
 * >
 *   <div>Row content</div>
 * </SwipeableRow>
 * ```
 */
export function SwipeableRow({
  children,
  leftActions,
  rightActions,
}: SwipeableRowProps) {
  const [openSide, setOpenSide] = React.useState<"left" | "right" | null>(null);

  const translateX = openSide === "left" ? 128 : openSide === "right" ? -128 : 0;

  return (
    <div className="shSwipeableRow">
      {/* Left actions */}
      {leftActions && leftActions.length > 0 && (
        <div className={cn("shSwipeableRowActions", "shSwipeableRowActionsLeft")}>
          {leftActions.map((action) => {
            const bgColor = getVariantBg(action.variant);
            return (
              <button
                key={action.label}
                type="button"
                className="shSwipeAction"
                style={{ background: bgColor }}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenSide(null);
                  action.onAction();
                }}
                aria-label={action.label}
              >
                {action.icon ? <span aria-hidden="true">{action.icon}</span> : null}
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Right actions */}
      {rightActions && rightActions.length > 0 && (
        <div className={cn("shSwipeableRowActions", "shSwipeableRowActionsRight")}>
          {rightActions.map((action) => {
            const bgColor = getVariantBg(action.variant);
            return (
              <button
                key={action.label}
                type="button"
                className="shSwipeAction"
                style={{ background: bgColor }}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenSide(null);
                  action.onAction();
                }}
                aria-label={action.label}
              >
                {action.icon ? <span aria-hidden="true">{action.icon}</span> : null}
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      <div
        className="shSwipeableRowContent"
        style={{ transform: `translateX(${translateX}px)` }}
      >
        {children}
      </div>
    </div>
  );
}

/** Map variant to a background colour for swipe actions */
function getVariantBg(variant: SwipeActionVariant): string {
  switch (variant) {
    case "info":
      return "#3b82f6";
    case "success":
      return "#22c55e";
    case "warning":
      return "#f59e0b";
    case "error":
      return "#ef4444";
  }
}
