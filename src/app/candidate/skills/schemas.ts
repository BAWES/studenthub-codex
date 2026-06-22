import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const listSkillsSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getSkillSchema = z.object({
  skillId: z.coerce.number().int().positive("Skill ID is required"),
});

export const createSkillSchema = z.object({
  skill: z
    .string()
    .min(1, "Skill name is required")
    .max(128, "Skill name must be 128 characters or fewer")
    .transform((v) => v.trim()),
});

export const updateSkillSchema = z.object({
  skillId: z.coerce.number().int().positive("Skill ID is required"),
  skill: z
    .string()
    .min(1, "Skill name is required")
    .max(128, "Skill name must be 128 characters or fewer")
    .transform((v) => v.trim()),
});

export const deleteSkillSchema = z.object({
  skillId: z.coerce.number().int().positive("Skill ID is required"),
});

// Input types
export type ListSkillsInput = z.input<typeof listSkillsSchema>;
export type GetSkillInput = z.input<typeof getSkillSchema>;
export type CreateSkillInput = z.input<typeof createSkillSchema>;
export type UpdateSkillInput = z.input<typeof updateSkillSchema>;
export type DeleteSkillInput = z.input<typeof deleteSkillSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const skillItemOutputSchema = z.object({
  candidate_skill_id: z.number().int(),
  skill: z.string(),
  created_at: z.date().nullable(),
});

export const skillListOutputSchema = z.object({
  items: z.array(skillItemOutputSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

export const skillActionResultOutputSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true), skillId: z.number().int() }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

// Output types
export type SkillItem = z.output<typeof skillItemOutputSchema>;
export type SkillListResult = z.output<typeof skillListOutputSchema>;
export type SkillActionResult =
  | { success: true; skillId: number }
  | { success: false; error: string };
