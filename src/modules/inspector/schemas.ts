import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for src/modules/inspector actions
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
export type IdRequestListItem = {
  cir_uuid: string;
  candidate_count: number;
  status: string | null;
  rejection_reason: string | null;
  created_at: Date | null;
  updated_at: Date | null;
  created_by_name: string | null;
};
export type IdRequestDetail = {
  cir_uuid: string;
  status: string | null;
  rejection_reason: string | null;
  created_at: Date | null;
  updated_at: Date | null;
  created_by_name: string | null;
  updated_by_name: string | null;
};
export type ListRequestsResult = {
  requests: IdRequestListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
export const listInspectorsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
});
export const getInspectorSchema = z.object({
  uuid: z.string().min(1, "Inspector UUID is required"),
});
export type ListInspectorsInput = z.input<typeof listInspectorsSchema>;
export type GetInspectorInput = z.input<typeof getInspectorSchema>;
export type InspectorAccountItem = {
  inspector_uuid: string;
  inspector_name: string;
  inspector_email: string;
  inspector_status: number;
  inspector_created_at: Date;
  inspector_updated_at: Date;
};
export type ListInspectorsResult = {
  inspectors: InspectorAccountItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
