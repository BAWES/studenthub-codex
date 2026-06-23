"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
 * Floating Action Button for mobile viewports.
 *
 * - 56px rounded-full button with Zendesk Coral accent
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
        <div
          className="absolute bottom-20 right-4 flex flex-col gap-2"
          role="menu"
          aria-label={`${role} speed dial`}
        >
          {speedDial.map((item) => (
            <Button
              key={item.label}
              variant="secondary"
              size="sm"
              className="rounded-full shadow-lg min-w-[120px]"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                item.onAction();
              }}
            >
              {item.icon ? <span aria-hidden="true">{item.icon}</span> : null}
              <span>{item.label}</span>
            </Button>
          ))}
        </div>
      )}

      {/* FAB button */}
      <Button
        type="button"
        size="icon"
        className={cn(
          "fixed bottom-6 right-6 z-50 size-14 rounded-full shadow-xl",
          "bg-[#eb6651] hover:bg-[#d45441] text-white",
          "transition-all duration-200 ease-in-out",
          "text-2xl font-light leading-none",
          hidden && "opacity-0 pointer-events-none scale-0",
        )}
        aria-label={`${role} quick action`}
        onClick={primaryAction}
      >
        +
      </Button>
    </>
  );
}
