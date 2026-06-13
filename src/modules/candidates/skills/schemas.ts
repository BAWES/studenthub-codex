import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listCandidateSkillsSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getCandidateSkillSchema = z.object({
  skillId: z.coerce.number().int().positive("Skill ID is required"),
});

export const createCandidateSkillSchema = z.object({
  skill: z
    .string()
    .min(1, "Skill name is required")
    .max(128, "Skill name must be 128 characters or fewer")
    .transform((v) => v.trim()),
});

export const updateCandidateSkillSchema = z.object({
  skillId: z.coerce.number().int().positive("Skill ID is required"),
  skill: z
    .string()
    .min(1, "Skill name is required")
    .max(128, "Skill name must be 128 characters or fewer")
    .transform((v) => v.trim()),
});

export const deleteCandidateSkillSchema = z.object({
  skillId: z.coerce.number().int().positive("Skill ID is required"),
});

// Input types
export type ListCandidateSkillsParams = z.input<typeof listCandidateSkillsSchema>;
export type GetCandidateSkillParams = z.input<typeof getCandidateSkillSchema>;
export type CreateCandidateSkillParams = z.input<typeof createCandidateSkillSchema>;
export type UpdateCandidateSkillParams = z.input<typeof updateCandidateSkillSchema>;
export type DeleteCandidateSkillParams = z.input<typeof deleteCandidateSkillSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const skillItemSchema = z.object({
  candidate_skill_id: z.number().int(),
  skill: z.string(),
  created_at: z.date().nullable(),
});

export const skillListOutputSchema = z.object({
  items: z.array(skillItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

export const skillActionResultSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true), skillId: z.number().int() }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

// Output types
export type SkillItem = z.output<typeof skillItemSchema>;
export type SkillListResult = z.output<typeof skillListOutputSchema>;
export type SkillActionResult = z.output<typeof skillActionResultSchema>;
