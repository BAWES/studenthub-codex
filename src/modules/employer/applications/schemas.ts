import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas — colocated with employer applications server actions
// ---------------------------------------------------------------------------

export const applicationRowSchema = z.object({
  id: z.number().int(),
  jobListingId: z.number().int(),
  candidateId: z.number().int(),
  candidateName: z.string().nullable(),
  jobTitle: z.string(),
  status: z.string(),
  createdAt: z.date(),
});

export type ApplicationRow = z.output<typeof applicationRowSchema>;

export const listApplicationsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  status: z.string().optional(),
});

export type ListApplicationsInput = z.input<typeof listApplicationsSchema>;

export const listApplicationsResultSchema = z.object({
  items: z.array(applicationRowSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
  metrics: z.object({
    total: z.number().int().nonnegative(),
    pending: z.number().int().nonnegative(),
    accepted: z.number().int().nonnegative(),
    rejected: z.number().int().nonnegative(),
  }),
});

export type ListApplicationsResult = z.output<typeof listApplicationsResultSchema>;
