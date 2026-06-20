import { z } from "zod";
import { APPLICATION_STATUSES } from "@/modules/status-labels";

// ---------------------------------------------------------------------------
// Schemas — employer applications list
// ---------------------------------------------------------------------------

export const listEmployerApplicationsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListEmployerApplicationsInput = z.input<typeof listEmployerApplicationsSchema>;

export type EmployerApplicationRow = z.output<
  typeof employerApplicationRowOutputSchema
>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const employerApplicationRowOutputSchema = z.object({
  id: z.number().int(),
  jobTitle: z.string(),
  candidateName: z.string().nullable(),
  status: z.string(),
  createdAt: z.date(),
});

export const employerApplicationListOutputSchema = z.object({
  success: z.literal(true),
  applications: z.array(employerApplicationRowOutputSchema),
  total: z.number().int().nonnegative(),
  metrics: z.object({
    total: z.number().int().nonnegative(),
    pending: z.number().int().nonnegative(),
    accepted: z.number().int().nonnegative(),
    rejected: z.number().int().nonnegative(),
  }),
});

// ---------------------------------------------------------------------------
// Detail schemas — single application detail page
// ---------------------------------------------------------------------------

export const getApplicationDetailSchema = z.object({
  applicationId: z.coerce.number().int().positive(),
});

export type GetApplicationDetailInput = z.input<typeof getApplicationDetailSchema>;

export const employerApplicationDetailOutputSchema = z.object({
  applicationId: z.number().int(),
  jobListingId: z.number().int(),
  candidateId: z.number().int(),
  candidateName: z.string().nullable(),
  jobTitle: z.string(),
  status: z.string(),
  coverLetter: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const getApplicationDetailOutputSchema = z.object({
  success: z.literal(true),
  application: employerApplicationDetailOutputSchema.nullable(),
});

// ---------------------------------------------------------------------------
// Update application status schemas
// ---------------------------------------------------------------------------

export const updateEmployerApplicationStatusSchema = z.object({
  applicationId: z.coerce.number().int().positive(),
  status: z.enum(APPLICATION_STATUSES),
  rejectionReason: z.string().optional(),
});

export type UpdateEmployerApplicationStatusInput = z.input<
  typeof updateEmployerApplicationStatusSchema
>;

export const updateEmployerApplicationStatusOutputSchema = z.object({
  success: z.literal(true),
});
