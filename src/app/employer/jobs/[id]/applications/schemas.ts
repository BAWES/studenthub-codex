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
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListJobApplicationsInput = z.input<typeof listJobApplicationsSchema>;
export type ListJobApplicationsByEmployerInput = z.input<typeof listJobApplicationsByEmployerSchema>;
export type UpdateApplicationStatusInput = z.input<typeof updateApplicationStatusSchema>;

export type JobApplicationRow = {
  applicationId: number;
  candidateId: number;
  candidateName: string | null;
  status: string;
  coverLetter: string | null;
  createdAt: Date;
  updatedAt: Date;
};
