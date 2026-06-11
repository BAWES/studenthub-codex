import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for candidate/references actions
// ---------------------------------------------------------------------------

export const listReferenceSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getReferenceSchema = z.object({
  referenceUuid: z.string().min(1, "Reference UUID is required"),
});

export const createReferenceSchema = z.object({
  name: z
    .string()
    .min(1, "Reference name is required")
    .max(255, "Name must be 255 characters or fewer")
    .transform((v) => v.trim()),
  company: z
    .string()
    .max(255, "Company must be 255 characters or fewer")
    .optional()
    .default("")
    .transform((v) => v.trim()),
  position: z
    .string()
    .max(255, "Position must be 255 characters or fewer")
    .optional()
    .default("")
    .transform((v) => v.trim()),
  phone: z
    .string()
    .max(50, "Phone must be 50 characters or fewer")
    .optional()
    .default("")
    .transform((v) => v.trim()),
  email: z
    .string()
    .max(255, "Email must be 255 characters or fewer")
    .email("Invalid email format")
    .optional()
    .or(z.literal(""))
    .default(""),
  relationship: z
    .string()
    .max(255, "Relationship must be 255 characters or fewer")
    .optional()
    .default("")
    .transform((v) => v.trim()),
});

export const updateReferenceSchema = z.object({
  referenceUuid: z.string().min(1, "Reference UUID is required"),
  name: z
    .string()
    .min(1, "Reference name is required")
    .max(255, "Name must be 255 characters or fewer")
    .transform((v) => v.trim()),
  company: z
    .string()
    .max(255, "Company must be 255 characters or fewer")
    .optional()
    .default("")
    .transform((v) => v.trim()),
  position: z
    .string()
    .max(255, "Position must be 255 characters or fewer")
    .optional()
    .default("")
    .transform((v) => v.trim()),
  phone: z
    .string()
    .max(50, "Phone must be 50 characters or fewer")
    .optional()
    .default("")
    .transform((v) => v.trim()),
  email: z
    .string()
    .max(255, "Email must be 255 characters or fewer")
    .email("Invalid email format")
    .optional()
    .or(z.literal(""))
    .default(""),
  relationship: z
    .string()
    .max(255, "Relationship must be 255 characters or fewer")
    .optional()
    .default("")
    .transform((v) => v.trim()),
});

export const deleteReferenceSchema = z.object({
  referenceUuid: z.string().min(1, "Reference UUID is required"),
});

// ---------------------------------------------------------------------------
// Output validation — Zod schemas for server action return types
// ---------------------------------------------------------------------------

/**
 * A single reference record returned from the API.
 */
export const referenceItemOutputSchema = z.object({
  reference_uuid: z.string().min(1, "Reference UUID is required"),
  candidate_id: z.number().int().nullable(),
  name: z.string().min(1, "Reference name is required"),
  company: z.string().nullable(),
  position: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  relationship: z.string().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

/**
 * List result — array of reference items.
 */
export const referenceListOutputSchema = z.array(referenceItemOutputSchema);

/**
 * Action result — success returns the UUID, failure returns an error message.
 */
export const referenceActionResultOutputSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    referenceUuid: z.string().min(1, "Reference UUID is required"),
  }),
  z.object({
    success: z.literal(false),
    error: z.string().min(1, "Error message is required"),
  }),
]);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListReferenceInput = z.input<typeof listReferenceSchema>;
export type GetReferenceInput = z.input<typeof getReferenceSchema>;
export type CreateReferenceInput = z.input<typeof createReferenceSchema>;
export type UpdateReferenceInput = z.input<typeof updateReferenceSchema>;
export type DeleteReferenceInput = z.input<typeof deleteReferenceSchema>;

export type ReferenceItem = z.output<typeof referenceItemOutputSchema>;

export type ReferenceActionResult = z.output<typeof referenceActionResultOutputSchema>;
