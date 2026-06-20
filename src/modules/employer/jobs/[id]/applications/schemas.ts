import { z } from "zod";
import { APPLICATION_STATUSES } from "@/modules/status-labels";

// ---------------------------------------------------------------------------
// Schemas — employer job application management
// ---------------------------------------------------------------------------

export const listJobApplicationsSchema = z.object({
  jobListingId: z.coerce.number().int().positive(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
});

export const listJobApplicationsByEmployerSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
});

export const updateApplicationStatusSchema = z.object({
  applicationId: z.coerce.number().int().positive(),
  status: z.enum(APPLICATION_STATUSES),
  rejectionReason: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListJobApplicationsInput = z.input<typeof listJobApplicationsSchema>;
export type ListJobApplicationsByEmployerInput = z.input<typeof listJobApplicationsByEmployerSchema>;
export type UpdateApplicationStatusInput = z.input<typeof updateApplicationStatusSchema>;

export type JobApplicationRow = z.output<
  typeof jobApplicationRowOutputSchema
>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/** Validates a single job application row returned in list results. */
export const jobApplicationRowOutputSchema = z.object({
  applicationId: z.number().int(),
  candidateId: z.number().int(),
  candidateName: z.string().nullable(),
  status: z.string(),
  coverLetter: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/** Validates the listJobApplications return shape. */
export const jobApplicationListOutputSchema = z.object({
  success: z.literal(true),
  applications: z.array(jobApplicationRowOutputSchema),
  total: z.number().int().nonnegative(),
});

/** Validates a single job application row with job title (employer view). */
export const jobApplicationWithJobRowOutputSchema = z.object({
  applicationId: z.number().int(),
  candidateId: z.number().int(),
  candidateName: z.string().nullable(),
  status: z.string(),
  coverLetter: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  jobTitle: z.string(),
});

/** Validates the listJobApplicationsByEmployer return shape. */
export const jobApplicationListByEmployerOutputSchema = z.object({
  success: z.literal(true),
  applications: z.array(jobApplicationWithJobRowOutputSchema),
  total: z.number().int().nonnegative(),
});

/** Validates the updateApplicationStatus return shape. */
export const updateApplicationStatusOutputSchema = z.object({
  success: z.literal(true),
});
