import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas — inspector ID verification requests
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListIdRequestsInput = z.input<typeof listIdRequestsSchema>;
export type GetIdRequestInput = z.input<typeof getIdRequestSchema>;
export type UpdateIdRequestStatusInput = z.input<typeof updateIdRequestStatusSchema>;

export type IdRequestRow = {
  id: string;
  request: string;
  candidates: number;
  status: string;
  createdBy: string;
  updatedBy: string;
  created: string;
  updated: string;
};

export type IdRequestDetail = {
  cir_uuid: string;
  status: string | null;
  rejection_reason: string | null;
  candidate_ids: string | null;
  created_at: Date | null;
  updated_at: Date | null;
  created_by_name: string | null;
  updated_by_name: string | null;
  metrics: { label: string; value: string | number; note: string }[];
  candidates: {
    id: number;
    title: string;
    subtitle: string;
    meta: string;
  }[];
};

export type ListIdRequestsResult = {
  items: IdRequestRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
