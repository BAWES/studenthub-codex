"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ==========================================================================
   StudentHub OS — Data Table
   Sticky header, row hover lift, entrance stagger animations,
   and compact data-dense layout. shadcn-based.
   ========================================================================== */

// ── Inline style injection for entrance animations ──────────────

const TABLE_STYLE_ID = "sh-table-styles";

function injectTableStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(TABLE_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = TABLE_STYLE_ID;
  style.textContent = `
    @keyframes shTableRowIn {
      from { opacity: 0; transform: translateY(6px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
  `;
  document.head.appendChild(style);
}

// ── Context for table props ─────────────────────────────────────

type TableContextValue = {
  staggerMs?: number;
};

const TableContext = React.createContext<TableContextValue>({});

// ── Glass Table Container ───────────────────────────────────────

const Table = React.forwardRef<HTMLTableElement, React.ComponentPropsWithoutRef<"table"> & { staggerMs?: number }>(
  function Table({ className, staggerMs = 30, ...props }, ref) {
    React.useEffect(() => { injectTableStyles(); }, []);

    return (
      <TableContext.Provider value={{ staggerMs }}>
        <div
          data-slot="table-wrapper"
          className="relative w-full overflow-auto rounded-lg border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)]"
        >
          <table
            ref={ref}
            data-slot="table"
            className={cn(
              "w-full caption-bottom text-sm",
              "shOsTable",
              className,
            )}
            {...props}
          />
        </div>
      </TableContext.Provider>
    );
  },
);

// ── Glass Sticky Header ─────────────────────────────────────────

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.ComponentPropsWithoutRef<"thead">>(
  function TableHeader({ className, ...props }, ref) {
    return (
      <thead
        ref={ref}
        data-slot="table-header"
        className={cn(
          "sticky top-0 z-10",
          "bg-[var(--surface)]",
          "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-[var(--border)]",
          className,
        )}
        {...props}
      />
    );
  },
);

// ── Table Body ──────────────────────────────────────────────────

const TableBody = React.forwardRef<HTMLTableSectionElement, React.ComponentPropsWithoutRef<"tbody">>(
  function TableBody({ className, ...props }, ref) {
    return (
      <tbody
        ref={ref}
        data-slot="table-body"
        className={cn(
          "[&_tr:last-child]:border-0",
          className,
        )}
        {...props}
      />
    );
  },
);

// ── Table Footer ────────────────────────────────────────────────

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.ComponentPropsWithoutRef<"tfoot">>(
  function TableFooter({ className, ...props }, ref) {
    return (
      <tfoot
        ref={ref}
        data-slot="table-footer"
        className={cn(
          "border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] font-medium",
          "[&>tr]:last:border-b-0",
          className,
        )}
        {...props}
      />
    );
  },
);

// ── Table Row with hover lift + entrance stagger ────────────────

export interface TableRowProps extends React.ComponentPropsWithoutRef<"tr"> {
  index?: number;
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  function TableRow({ className, index = 0, style, onClick, onKeyDown, ...props }, ref) {
    const { staggerMs } = React.useContext(TableContext);

    const isInteractive = typeof onClick === "function";

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLTableRowElement>) => {
        if (onKeyDown) onKeyDown(e);
        if (e.defaultPrevented) return;
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick(e as unknown as React.MouseEvent<HTMLTableRowElement>);
        }
      },
      [onClick, onKeyDown],
    );

    return (
      <tr
        ref={ref}
        data-slot="table-row"
        tabIndex={isInteractive ? 0 : undefined}
        role={isInteractive ? "button" : undefined}
        onClick={onClick}
        onKeyDown={isInteractive ? handleKeyDown : onKeyDown}
        className={cn(
          "border-b border-[var(--border)]",
          "transition-all duration-[200ms] ease-out",
          "hover:bg-[var(--surface)] hover:translate-x-[2px]",
          "data-[state=selected]:bg-[var(--sh-info-bg)]",
          "cursor-default",
          isInteractive && "cursor-pointer",
          className,
        )}
        style={{
          animation: `shTableRowIn 280ms cubic-bezier(0.16, 1, 0.3, 1) ${index * (staggerMs ?? 30)}ms both`,
          ...style,
        }}
        {...props}
      />
    );
  },
);

// ── Header Cell ─────────────────────────────────────────────────

const TableHead = React.forwardRef<HTMLTableHeaderCellElement, React.ComponentPropsWithoutRef<"th">>(
  function TableHead({ className, ...props }, ref) {
    return (
      <th
        ref={ref}
        data-slot="table-head"
        className={cn(
          "h-10 px-3 text-left align-middle",
          "text-[11px] font-semibold uppercase tracking-[0.04em]",
          "text-[var(--muted)]",
          "whitespace-nowrap",
          "first:pl-4 last:pr-4",
          "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
          className,
        )}
        {...props}
      />
    );
  },
);

// ── Data Cell ───────────────────────────────────────────────────

const TableCell = React.forwardRef<HTMLTableDataCellElement, React.ComponentPropsWithoutRef<"td">>(
  function TableCell({ className, ...props }, ref) {
    return (
      <td
        ref={ref}
        data-slot="table-cell"
        className={cn(
          "p-3 align-middle",
          "text-[13px] text-[var(--ink)]",
          "first:pl-4 last:pr-4",
          "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
          className,
        )}
        {...props}
      />
    );
  },
);

// ── Table Caption ───────────────────────────────────────────────

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.ComponentPropsWithoutRef<"caption">>(
  function TableCaption({ className, ...props }, ref) {
    return (
      <caption
        ref={ref}
        data-slot="table-caption"
        className={cn(
          "mt-3 text-center text-[12px] text-[var(--muted)]",
          className,
        )}
        {...props}
      />
    );
  },
);

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
