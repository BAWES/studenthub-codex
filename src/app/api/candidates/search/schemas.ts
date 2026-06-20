import { z } from "zod";

// ---------------------------------------------------------------------------
// Query params schema for GET /api/candidates/search
// ---------------------------------------------------------------------------

/** Supported filter presets. */
const filterPresets = [
  "all",
  "active",
  "needs-review",
  "incomplete",
  "civil-id",
] as const;

const profileOptions = ["complete", "incomplete"] as const;
const assignmentOptions = ["assigned", "unassigned"] as const;
const documentOptions = ["resume", "no-resume", "civil-id"] as const;
const roleOptions = ["admin", "staff", "candidate"] as const;
const visibilityOptions = ["all", "assigned"] as const;

export const searchCandidatesQuerySchema = z.object({
  q: z.string().optional().default(""),
  filter: z.enum(filterPresets).optional().default("all"),
  role: z.enum(roleOptions).optional().default("admin"),
  staffId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  country: z.string().optional(),
  university: z.string().optional(),
  company: z.string().optional(),
  skill: z.string().optional(),
  gender: z.string().optional(),
  profile: z.enum(profileOptions).optional(),
  assignment: z.enum(assignmentOptions).optional(),
  document: z.enum(documentOptions).optional(),
  visibility: z.enum(visibilityOptions).optional(),
});

export type SearchCandidatesQuery = z.input<typeof searchCandidatesQuerySchema>;
