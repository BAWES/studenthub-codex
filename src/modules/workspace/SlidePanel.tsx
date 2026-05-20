"use client";

import { useState, useCallback } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetBody,
} from "@/components/ui/sheet";

// ── Types ──────────────────────────────────────────────────

export type SlidePanelSide = "top" | "right" | "bottom" | "left";

export type SlidePanelProps = {
  /** Controlled: whether the panel is open. */
  open?: boolean;
  /** Controlled: callback when open state changes. */
  onOpenChange?: (open: boolean) => void;

  /** The side from which the panel slides in. Default: "right". */
  side?: SlidePanelSide;
  /** Panel title (rendered in SheetHeader). */
  title?: string;
  /** Optional subtitle line below the title. */
  description?: string;
  /** Small eyebrow label above the title. */
  eyebrow?: string;

  /** Main panel body content. */
  children?: React.ReactNode;
  /** Content rendered in the sticky footer at the bottom. */
  footer?: React.ReactNode;

  /** Extra classes for the sheet content wrapper. */
  className?: string;

  /** Whether to show the built-in X close button. Default: true. */
  showCloseButton?: boolean;
};

// ── Trigger convenience ────────────────────────────────────

export type SlidePanelTriggerProps = {
  children: React.ReactNode;
  /** When true, renders the trigger as a child wrapper instead of a button. */
  asChild?: boolean;
  className?: string;
};

// ── Hook: uncontrolled open state ──────────────────────────

export function useSlidePanel(defaultOpen = false) {
  const [open, setOpen] = useState(defaultOpen);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);
  const close = useCallback(() => setOpen(false), []);
  const show = useCallback(() => setOpen(true), []);
  return { open, onOpenChange: setOpen, toggle, close, show };
}

// ── SlidePanel Component ───────────────────────────────────

export function SlidePanel({
  open,
  onOpenChange,
  side = "right",
  title,
  description,
  eyebrow,
  children,
  footer,
  className,
  showCloseButton = true,
}: SlidePanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        showCloseButton={showCloseButton}
        className={className}
      >
        <div className="slidePanel">
          {title || eyebrow || description ? (
            <SheetHeader>
              {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
              {title ? <SheetTitle>{title}</SheetTitle> : null}
              {description ? <SheetDescription>{description}</SheetDescription> : null}
            </SheetHeader>
          ) : null}
          <SheetBody>
            <div className="slidePanelInner">{children}</div>
          </SheetBody>
          {footer ? <SheetFooter>{footer}</SheetFooter> : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── SlidePanelTrigger ──────────────────────────────────────

export function SlidePanelTrigger({ children, className, asChild }: SlidePanelTriggerProps) {
  return (
    <SheetTrigger className={className} asChild={asChild}>
      {children}
    </SheetTrigger>
  );
}
