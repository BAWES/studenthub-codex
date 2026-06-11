import { z } from "zod";

// ---------------------------------------------------------------------------
// Inspector workspace — Zod schemas
// ---------------------------------------------------------------------------

/**
 * Schema for getInspectorWorkspace action.
 * Validates the inspectorUuid parameter — must be a non-empty string.
 */
export const getInspectorWorkspaceSchema = z.object({
  inspectorUuid: z
    .string({ invalid_type_error: "inspectorUuid must be a string" })
    .min(1, "inspectorUuid must not be empty"),
});

// ---------------------------------------------------------------------------
// Inspector workspace — type definitions (derived from schemas)
// Mirrors the return shape of getInspectorWorkspace
// ---------------------------------------------------------------------------

export type IdRequestRow = z.output<typeof inspectorRequestRowSchema>;

export type InspectWorkspaceResult = z.output<typeof inspectorWorkspaceOutputSchema>;

// ---------------------------------------------------------------------------
// Inspector workspace — output validation schemas
// ---------------------------------------------------------------------------

/**
 * Validates a single inspector metric row.
 * NOTE: value can be number or string (the 4th metric "Mode" has string value "Review").
 */
export const inspectorMetricSchema = z.object({
  label: z.string().min(1),
  value: z.union([z.number(), z.string()]),
  note: z.string(),
});

/**
 * Validates a single ID request row in the inspector workspace.
 */
export const inspectorRequestRowSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string(),
  meta: z.string(),
});

/**
 * Validates the inspector object inside the workspace response.
 */
export const inspectorObjectOutputSchema = z.object({
  inspector_name: z.string(),
  inspector_email: z.string(),
});

/**
 * Validates the full getInspectorWorkspace return shape.
 */
export const inspectorWorkspaceOutputSchema = z.object({
  inspector: inspectorObjectOutputSchema.nullable(),
  metrics: z.array(inspectorMetricSchema).length(4),
  requests: z.array(inspectorRequestRowSchema),
});
