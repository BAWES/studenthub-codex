import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const experienceListItemSchema = z.object({
  candidate_experience_id: z.number(),
  candidate_id: z.number().nullable(),
  experience: z.string(),
  employer: z.string().nullable(),
  start_year: z.number().nullable(),
  end_year: z.number().nullable(),
  candidate_experience_created_at: z.date().nullable(),
});

export type ExperienceListItem = z.output<typeof experienceListItemSchema>;

export const listExperienceResultSchema = z.object({
  items: z.array(experienceListItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type ListExperienceResult = z.output<typeof listExperienceResultSchema>;

export const deleteExperienceResultSchema = z.object({
  success: z.boolean(),
});

/** Discriminated union for create/update/delete action results. */
export const experienceActionResultSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    experienceId: z.number().int().positive(),
  }),
  z.object({
    success: z.literal(false),
    error: z.string(),
  }),
]);

export type ExperienceActionResult = z.output<typeof experienceActionResultSchema>;
