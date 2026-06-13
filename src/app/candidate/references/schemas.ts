import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
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
// Types
// ---------------------------------------------------------------------------

export type ListReferenceInput = z.input<typeof listReferenceSchema>;
export type GetReferenceInput = z.input<typeof getReferenceSchema>;
export type CreateReferenceInput = z.input<typeof createReferenceSchema>;
export type UpdateReferenceInput = z.input<typeof updateReferenceSchema>;
export type DeleteReferenceInput = z.input<typeof deleteReferenceSchema>;

// Re-export types from module
export type {
  ReferenceItem,
  ReferenceActionResult,
} from "@/modules/references/schemas";

// Re-export output schemas from module with original names for compatibility
import {
  referenceItemSchema as _refItemSchema,
  referenceListSchema as _refListSchema,
  referenceActionResultSchema as _refActionResultSchema,
} from "@/modules/references/schemas";

export const referenceItemOutputSchema = _refItemSchema;
export const referenceListOutputSchema = _refListSchema;
export const referenceActionResultOutputSchema = _refActionResultSchema;
