import { z } from "zod";

// ---------------------------------------------------------------------------
// Theme — output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for the theme mode type.
 */
export const themeModeSchema = z.enum(["light", "dark"]);

export type ThemeMode = z.output<typeof themeModeSchema>;

/**
 * Schema for the theme toggle component props / state.
 */
export const themeToggleStateSchema = z.object({
  theme: themeModeSchema,
  className: z.string().optional(),
});

export type ThemeToggleState = z.output<typeof themeToggleStateSchema>;
