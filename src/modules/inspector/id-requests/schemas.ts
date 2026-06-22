import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas — inspector ID verification requests
// ---------------------------------------------------------------------------

export const listIdRequestsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  q: z.string().optional(),
  status: z.string().optional(),
});

export const getIdRequestSchema = z.object({
  id: z.string().min(1, "Request ID is required"),
});

export const updateIdRequestStatusSchema = z.object({
  id: z.string().min(1, "Request ID is required"),
  status: z.enum(["pending", "approved", "rejected"], {
    errorMap: () => ({ message: "Status must be one of: pending, approved, rejected" }),
  }),
  rejection_reason: z.string().min(10).max(500).optional(),
});

export const approveIdRequestSchema = z.object({
  id: z.string().min(1, "Request ID is required"),
  comment: z.string().optional(),
});

export const rejectIdRequestSchema = z.object({
  id: z.string().min(1, "Request ID is required"),
  comment: z.string().min(10, "Rejection reason must be at least 10 characters").max(500, "Rejection reason must be under 500 characters"),
});

// ---------------------------------------------------------------------------
// Input type aliases
// ---------------------------------------------------------------------------

export type ListIdRequestsInput = z.input<typeof listIdRequestsSchema>;
export type GetIdRequestInput = z.input<typeof getIdRequestSchema>;
export type UpdateIdRequestStatusInput = z.input<typeof updateIdRequestStatusSchema>;
export type ApproveIdRequestInput = z.input<typeof approveIdRequestSchema>;
export type RejectIdRequestInput = z.input<typeof rejectIdRequestSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const idRequestRowSchema = z.object({
  id: z.string(),
  request: z.string(),
  candidates: z.number().int().nonnegative(),
  status: z.string(),
  createdBy: z.string(),
  updatedBy: z.string(),
  created: z.string(),
  updated: z.string(),
});

export const idRequestMetricsItemSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  note: z.string(),
});

export const idRequestCandidateRowSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  subtitle: z.string(),
  meta: z.string(),
});

export const idRequestDetailSchema = z.object({
  cir_uuid: z.string(),
  status: z.string().nullable(),
  rejection_reason: z.string().nullable(),
  candidate_ids: z.string().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
  created_by_name: z.string().nullable(),
  updated_by_name: z.string().nullable(),
  metrics: z.array(idRequestMetricsItemSchema),
  candidates: z.array(idRequestCandidateRowSchema),
});

export const listIdRequestsResultSchema = z.object({
  items: z.array(idRequestRowSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

// ---------------------------------------------------------------------------
// Derived types
// ---------------------------------------------------------------------------

export type IdRequestRow = z.output<typeof idRequestRowSchema>;
export type IdRequestDetail = z.output<typeof idRequestDetailSchema>;
export type ListIdRequestsResult = z.output<typeof listIdRequestsResultSchema>;
