import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas — follow education module pattern
// ---------------------------------------------------------------------------

export const listApplicationsSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.string().optional(),
});

export const getApplicationSchema = z.object({
  applicationId: z.coerce.number().int().positive("Application ID is required"),
});

export const createApplicationSchema = z.object({
  candidateId: z.number().int().positive("Candidate ID is required"),
  jobListingId: z.coerce.number().int().positive("Job listing is required"),
  coverLetter: z.string().optional().default(""),
});

export const updateApplicationStatusSchema = z.object({
  applicationId: z.coerce.number().int().positive("Application ID is required"),
  status: z.enum([
    "applied",
    "pending",
    "shortlisted",
    "interviewed",
    "offered",
    "hired",
    "rejected",
    "withdrawn",
  ]),
});

export const deleteApplicationSchema = z.object({
  applicationId: z.coerce.number().int().positive("Application ID is required"),
});

// Input types
export type ListApplicationsInput = z.input<typeof listApplicationsSchema>;
export type GetApplicationInput = z.input<typeof getApplicationSchema>;
export type CreateApplicationInput = z.input<typeof createApplicationSchema>;
export type UpdateApplicationStatusInput = z.input<typeof updateApplicationStatusSchema>;
export type DeleteApplicationInput = z.input<typeof deleteApplicationSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const applicationItemSchema = z.object({
  applicationId: z.number().int(),
  jobListingId: z.number().int(),
  jobTitle: z.string(),
  employerName: z.string(),
  status: z.string(),
  coverLetter: z.string().nullable(),
  createdAt: z.coerce.date().nullable(),
  updatedAt: z.coerce.date().nullable(),
});

export const listApplicationsResultSchema = z.object({
  items: z.array(applicationItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

export const applicationActionResultSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true), applicationId: z.number().int() }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

// Output types
export type ApplicationItem = z.output<typeof applicationItemSchema>;
export type ListApplicationsResult = z.output<typeof listApplicationsResultSchema>;
export type ApplicationActionResult = z.output<typeof applicationActionResultSchema>;
