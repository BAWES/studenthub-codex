import { z } from "zod";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const VALID_REQUEST_STATUSES = ["pending", "started", "delivered"] as const;

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listStaffRequestsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.enum(VALID_REQUEST_STATUSES).optional(),
  q: z.string().optional(),
});

export const getStaffRequestDetailSchema = z.object({
  requestUuid: z.string().min(1, "Request UUID is required"),
});

export const updateRequestStatusSchema = z.object({
  requestUuid: z.string().min(1, "Request UUID is required"),
  status: z.enum(VALID_REQUEST_STATUSES, {
    errorMap: () => ({
      message: `Status must be one of: ${VALID_REQUEST_STATUSES.join(", ")}`,
    }),
  }),
  feedback: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListStaffRequestsInput = z.input<typeof listStaffRequestsSchema>;

export type GetStaffRequestDetailInput = z.input<
  typeof getStaffRequestDetailSchema
>;

export type UpdateRequestStatusInput = z.input<typeof updateRequestStatusSchema>;

export type StaffRequestRow = {
  id: string;
  title: string;
  company: string;
  seats: number;
  status: string;
  updated: string;
};

export type StaffRequestDetail = {
  requestUuid: string;
  positionTitle: string | null;
  jobDescription: string;
  compensation: string;
  seats: number;
  location: string | null;
  status: string | null;
  priority: number | null;
  assignedAt: Date | null;
  startedAt: Date | null;
  finishedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
  company: {
    company_id: number;
    company_name: string | null;
    company_email: string | null;
  } | null;
  contact: {
    contact_name: string | null;
    contact_email: string | null;
  } | null;
  staff: {
    staff_name: string | null;
    staff_email: string | null;
  } | null;
  candidates: {
    uuid: string;
    name: string | null;
    email: string | null;
    applicationStatus: number | null;
    appliedAt: Date | null;
  }[];
};

export type UpdateRequestStatusResult = {
  operation: "success" | "error";
  message: string;
};

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/** Validates a single staff request row returned in list results. */
export const staffRequestRowOutputSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  seats: z.number().int(),
  status: z.string(),
  updated: z.string(),
});

/** Validates the listStaffRequests return shape. */
export const staffRequestListOutputSchema = z.object({
  items: z.array(staffRequestRowOutputSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/** Validates the candidate application object inside request detail. */
export const requestCandidateOutputSchema = z.object({
  uuid: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  applicationStatus: z.number().int().nullable(),
  appliedAt: z.date().nullable(),
});

/** Validates a staff request detail object. */
export const staffRequestDetailOutputSchema = z.object({
  requestUuid: z.string(),
  positionTitle: z.string().nullable(),
  jobDescription: z.string(),
  compensation: z.string(),
  seats: z.number().int(),
  location: z.string().nullable(),
  status: z.string().nullable(),
  priority: z.number().int().nullable(),
  assignedAt: z.date().nullable(),
  startedAt: z.date().nullable(),
  finishedAt: z.date().nullable(),
  updatedAt: z.date(),
  createdAt: z.date(),
  company: z.object({
    company_id: z.number().int(),
    company_name: z.string().nullable(),
    company_email: z.string().nullable(),
  }).nullable(),
  contact: z.object({
    contact_name: z.string().nullable(),
    contact_email: z.string().nullable(),
  }).nullable(),
  staff: z.object({
    staff_name: z.string().nullable(),
    staff_email: z.string().nullable(),
  }).nullable(),
  candidates: z.array(requestCandidateOutputSchema),
});

/** Validates the updateRequestStatus return shape. */
export const updateRequestStatusOutputSchema = z.object({
  operation: z.enum(["success", "error"]),
  message: z.string(),
});
