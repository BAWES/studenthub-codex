import { z } from "zod";

// ---------------------------------------------------------------------------
// Dashboard — shared schema definitions for the Dashboard component
// ---------------------------------------------------------------------------
// The Dashboard component renders admin dashboard data. Data fetching lives in
// src/modules/admin/dashboard/actions.ts with its own schemas. This module-level
// schemas.ts provides the component-level data contracts used by the Dashboard
// component and related UI helpers.
// ---------------------------------------------------------------------------

/**
 * Schema for a dashboard metric card value.
 */
export const dashboardMetricCardSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  note: z.string().optional(),
  trend: z.enum(["up", "down", "neutral"]).optional(),
  sparklineData: z.array(z.number()).optional(),
});

export type DashboardMetricCard = z.output<typeof dashboardMetricCardSchema>;

/**
 * Schema for a dashboard status item row (used in recent-items tables).
 */
export const dashboardStatusItemSchema = z.object({
  label: z.string(),
  count: z.number().int().nonnegative(),
  href: z.string().optional(),
  variant: z.enum(["success", "warning", "error", "info", "neutral"]).optional(),
});

export type DashboardStatusItem = z.output<typeof dashboardStatusItemSchema>;

/**
 * Schema for a generic dashboard list item (requests, candidates, etc.).
 */
export const dashboardDataListItemSchema = z.object({
  id: z.union([z.string(), z.number()]),
  title: z.string(),
  subtitle: z.string().optional(),
  meta: z.string().optional(),
  status: z.string().optional(),
  href: z.string().optional(),
  date: z.string().optional(),
});

export type DashboardDataListItem = z.output<typeof dashboardDataListItemSchema>;

/**
 * Schema for a status variant string.
 */
export const statusVariantSchema = z.enum([
  "success",
  "warning",
  "error",
  "info",
  "neutral",
]);

export type StatusVariant = z.output<typeof statusVariantSchema>;
