import { z } from "zod";

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
