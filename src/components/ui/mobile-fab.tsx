"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { Role } from "@/modules/auth/types";

export interface MobileFABProps {
  /** Agent role for aria-label context */
  role: Role;
  /** Primary action on tap/click */
  primaryAction: () => void;
  /** Speed-dial menu items (shown when open) */
  speedDial?: Array<{
    label: string;
    icon?: string;
    onAction: () => void;
  }>;
  /** Open speed-dial menu */
  speedDialOpen?: boolean;
  /** Hide FAB (e.g. when keyboard is open) */
  hidden?: boolean;
}

/**
 * Glass-morphism Floating Action Button for mobile viewports.
 *
 * - 56px glass circle with backdrop blur
 * - Role-aware primary action on tap
 * - Optional speed-dial menu on long-press / external toggle
 * - Hides when keyboard is open
 */
export function MobileFAB({
  role,
  primaryAction,
  speedDial = [],
  speedDialOpen = false,
  hidden = false,
}: MobileFABProps) {
  return (
    <>
      {/* Speed-dial menu (rendered above FAB when open) */}
      {speedDialOpen && speedDial.length > 0 && (
        <div className="shMobileFABSpeedDial" role="menu" aria-label={`${role} speed dial`}>
          {speedDial.map((item) => (
            <button
              key={item.label}
              type="button"
              className="shMobileFABSpeedDialItem"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                item.onAction();
              }}
            >
              {item.icon ? <span aria-hidden="true">{item.icon}</span> : null}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* FAB button */}
      <button
        type="button"
        className={cn("shMobileFAB", hidden && "shMobileFABHidden")}
        aria-label={`${role} quick action`}
        onClick={primaryAction}
      >
        +
      </button>
    </>
  );
}
