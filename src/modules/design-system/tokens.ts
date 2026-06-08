/**
 * Design tokens — single source of truth for type scale, spacing, and elevation.
 * Values reflect the STU-616 design audit recommendations.
 * Import from `@/modules/design-system` in application code.
 */

// ── Type Scale (7-step ramp per STU-616 §4.1) ──────────────────────────────────

export const fontSize = {
  /** 12px — captions, badges */
  xs: "0.75rem",
  /** 13px — meta, labels */
  sm: "0.8125rem",
  /** 14px — body */
  base: "0.875rem",
  /** 15px — emphasized body, buttons */
  md: "0.9375rem",
  /** 17px — card titles, section heads */
  lg: "1.0625rem",
  /** 20px — page titles */
  xl: "1.25rem",
  /** 24px — hero/metric emphasis */
  "2xl": "1.5rem",
} as const;

export const fontWeight = {
  normal: "500",
  medium: "600",
  semibold: "700",
} as const;

export const lineHeight = {
  tight: "1.1",
  normal: "1.4",
  relaxed: "1.6",
} as const;

// ── Spacing Scale (4px grid per STU-616 §4.2) ──────────────────────────────────

export const space = {
  "1": "4px",
  "2": "8px",
  "3": "12px",
  "4": "16px",
  "5": "20px",
  "6": "24px",
  "8": "32px",
  "10": "40px",
} as const;

// ── Elevation (3-step per STU-616 §4.3) ────────────────────────────────────────

export const shadow = {
  /** Cards, inputs */
  "1": "0 1px 3px rgba(16, 24, 40, 0.06)",
  /** Dropdowns, sheets */
  "2": "0 8px 24px rgba(16, 24, 40, 0.08)",
  /** Dialogs, modals */
  "3": "0 22px 80px rgba(16, 24, 40, 0.12)",
} as const;

// ── Radii ───────────────────────────────────────────────────────────────────────

export const radius = {
  sm: "6px",
  md: "8px",
  lg: "12px",
  full: "999px",
} as const;

// ── Motion ──────────────────────────────────────────────────────────────────────

export const duration = {
  fast: "120ms",
  normal: "160ms",
  slow: "240ms",
} as const;

// ── Semantic Color Tokens (reference — prefer CSS custom properties directly) ──

export const ink = {
  light: "#182230",
  dark: "#e7ecf5",
} as const;

export const accent = {
  blue: { light: "#0b63ce", dark: "#8abfff" },
  green: { light: "#24835b", dark: "#6ed5a0" },
  amber: { light: "#a66212", dark: "#e8ae63" },
  rose: { light: "#b42357", dark: "#ff8aac" },
} as const;
