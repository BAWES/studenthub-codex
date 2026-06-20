import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for admin/candidate-account-requests actions
// ---------------------------------------------------------------------------
// DB table: candidate_id_request
// PK:       cir_uuid (String @db.Char(60))
// Fields:   candidate_ids (Text), status (VarChar: pending/approved/rejected),
//           rejection_reason (Text), created_by (Int), updated_by (Int),
//           created_at (DateTime), updated_at (DateTime)
//
// Prisma model: candidate_id_request (auto-generated from schema)
// Relations:
//   - staff_candidate_id_request_created_byTostaff: staff?
//   - staff_candidate_id_request_updated_byTostaff: staff?
// ---------------------------------------------------------------------------

export const listCandidateIdRequestsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
});

export const getCandidateIdRequestSchema = z.object({
  cirUuid: z.string().min(1, "Candidate ID Request UUID is required"),
});

export const updateCandidateIdRequestStatusSchema = z.object({
  cirUuid: z.string().min(1, "Candidate ID Request UUID is required"),
  status: z.enum(["pending", "approved", "rejected"]),
  rejectionReason: z.string().max(1000).optional(),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single candidate ID request row in the listing.
 */
export const candidateIdRequestRowSchema = z.object({
  cir_uuid: z.string().min(1),
  candidate_ids: z.string().nullable(),
  status: z.string().nullable(),
  rejection_reason: z.string().nullable(),
  created_by_name: z.string().nullable(),
  updated_by_name: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

/**
 * Schema for the full list response from listCandidateIdRequests.
 */
export const listCandidateIdRequestsOutputSchema = z.object({
  items: z.array(candidateIdRequestRowSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export type ListCandidateIdRequestsOutput = z.output<typeof listCandidateIdRequestsOutputSchema>;

/**
 * Schema for a single candidate ID request detail (same shape as row).
 */
export const getCandidateIdRequestOutputSchema = z.object({
  request: candidateIdRequestRowSchema.nullable(),
});

export type GetCandidateIdRequestOutput = z.output<typeof getCandidateIdRequestOutputSchema>;

/**
 * Schema for status update action response.
 */
const candidateIdRequestActionResponseSchema = z.object({
  operation: z.enum(["success", "error"]),
  message: z.string().min(1),
});

export const updateCandidateIdRequestStatusOutputSchema = candidateIdRequestActionResponseSchema;

export type UpdateCandidateIdRequestStatusOutput = z.output<typeof updateCandidateIdRequestStatusOutputSchema>;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListCandidateIdRequestsInput = z.input<typeof listCandidateIdRequestsSchema>;
export type GetCandidateIdRequestInput = z.input<typeof getCandidateIdRequestSchema>;
export type UpdateCandidateIdRequestStatusInput = z.input<typeof updateCandidateIdRequestStatusSchema>;

export type CandidateIdRequestRow = z.output<typeof candidateIdRequestRowSchema>;

export type CandidateIdRequestDetail = z.output<typeof getCandidateIdRequestOutputSchema>;

export type UpdateCandidateIdRequestStatusResult = z.output<typeof updateCandidateIdRequestStatusOutputSchema>;
