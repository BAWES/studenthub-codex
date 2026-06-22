import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas for src/modules/inspector actions
// ---------------------------------------------------------------------------

export const listRequestsSchema = z.object({
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});
export const getRequestSchema = z.object({
  id: z.string().min(1, "Request ID is required"),
});
export const verifyRequestSchema = z.object({
  id: z.string().min(1, "Request ID is required"),
  notes: z.string().optional(),
});
export const rejectRequestSchema = z.object({
  id: z.string().min(1, "Request ID is required"),
  reason: z.string().min(1, "Rejection reason is required"),
});
export type ListRequestsParams = z.input<typeof listRequestsSchema>;
export type GetRequestParams = z.input<typeof getRequestSchema>;
export type VerifyRequestInput = z.input<typeof verifyRequestSchema>;
export type RejectRequestInput = z.input<typeof rejectRequestSchema>;

export const listInspectorsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
});
export const getInspectorSchema = z.object({
  uuid: z.string().min(1, "Inspector UUID is required"),
});
export type ListInspectorsInput = z.input<typeof listInspectorsSchema>;
export type GetInspectorInput = z.input<typeof getInspectorSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const idRequestListItemSchema = z.object({
  cir_uuid: z.string(),
  candidate_count: z.number().int().nonnegative(),
  status: z.string().nullable(),
  rejection_reason: z.string().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
  created_by_name: z.string().nullable(),
});
export type IdRequestListItem = z.output<typeof idRequestListItemSchema>;

export const idRequestDetailSchema = z.object({
  cir_uuid: z.string(),
  status: z.string().nullable(),
  rejection_reason: z.string().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
  created_by_name: z.string().nullable(),
  updated_by_name: z.string().nullable(),
});
export type IdRequestDetail = z.output<typeof idRequestDetailSchema>;

export const listRequestsResultSchema = z.object({
  requests: z.array(idRequestListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});
export type ListRequestsResult = z.output<typeof listRequestsResultSchema>;

export const getRequestResultSchema = idRequestDetailSchema.nullable();

export const inspectorActionResultSchema = z.object({
  success: z.boolean(),
});

export const inspectorAccountItemSchema = z.object({
  inspector_uuid: z.string(),
  inspector_name: z.string(),
  inspector_email: z.string(),
  inspector_status: z.number().int(),
  inspector_created_at: z.date(),
  inspector_updated_at: z.date(),
});
export type InspectorAccountItem = z.output<typeof inspectorAccountItemSchema>;

export const getInspectorResultSchema = inspectorAccountItemSchema;

export const listInspectorsResultSchema = z.object({
  inspectors: z.array(inspectorAccountItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});
export type ListInspectorsResult = z.output<typeof listInspectorsResultSchema>;

// ---------------------------------------------------------------------------
// Inspector workspace — types and output schemas
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

export type InspectWorkspaceResult = z.output<typeof inspectorWorkspaceOutputSchema>;
