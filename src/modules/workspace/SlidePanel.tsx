"use client";

import { useState, useCallback } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetBody,
} from "@/components/ui/sheet";

export type SlidePanelSide = "top" | "right" | "bottom" | "left";

export type SlidePanelProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: SlidePanelSide;
  title?: string;
  description?: string;
  eyebrow?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
};

export type SlidePanelTriggerProps = {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
};

export function useSlidePanel(defaultOpen = false) {
  const [open, setOpen] = useState(defaultOpen);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);
  const close = useCallback(() => setOpen(false), []);
  const show = useCallback(() => setOpen(true), []);
  return { open, onOpenChange: setOpen, toggle, close, show };
}

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
        <div>
          {title || eyebrow || description ? (
            <SheetHeader>
              {eyebrow ? (
                <p className="text-[var(--blue)] text-xs font-bold uppercase m-0 mb-2.5">
                  {eyebrow}
                </p>
              ) : null}
              {title ? <SheetTitle>{title}</SheetTitle> : null}
              {description ? <SheetDescription>{description}</SheetDescription> : null}
            </SheetHeader>
          ) : null}
          <SheetBody>
            <div className="px-[22px] pb-[22px] grid gap-3.5">{children}</div>
          </SheetBody>
          {footer ? <SheetFooter>{footer}</SheetFooter> : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function SlidePanelTrigger({ children, className }: SlidePanelTriggerProps) {
  return (
    <SheetTrigger className={className} asChild>
      {children}
    </SheetTrigger>
  );
}
