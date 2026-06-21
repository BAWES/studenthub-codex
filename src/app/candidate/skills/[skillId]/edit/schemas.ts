import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas for candidate/skills/[skillId]/edit actions
// ---------------------------------------------------------------------------

/**
 * Validate update skill params.
 * Mirrors the parent updateSkillSchema shape since the edit action
 * accepts the same positional parameters and validates them before delegating.
 */
export const updateSkillSchema = z.object({
  skillId: z.coerce.number().int().positive("Skill ID is required"),
  skill: z
    .string()
    .min(1, "Skill name is required")
    .max(128, "Skill name must be 128 characters or fewer")
    .transform((v) => v.trim()),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UpdateSkillInput = z.input<typeof updateSkillSchema>;

export type SkillActionResult =
  | { success: true; skillId: number }
  | { success: false; error: string };

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const skillActionResultOutputSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true), skillId: z.number().int() }),
  z.object({ success: z.literal(false), error: z.string() }),
]);
