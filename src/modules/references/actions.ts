"use server";

import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  referenceActionResultSchema,
  referenceItemSchema,
  referenceListSchema,
} from "./schemas";
import type {
  ReferenceActionResult,
  ReferenceItem,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

const listReferencesInputSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getReferenceInputSchema = z.object({
  referenceUuid: z.string().min(1, "Reference UUID is required"),
});

const createReferenceInputSchema = z.object({
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

const updateReferenceInputSchema = z.object({
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

const deleteReferenceInputSchema = z.object({
  referenceUuid: z.string().min(1, "Reference UUID is required"),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a Prisma candidate_reference row to the API shape. */
function toItem(
  row: Awaited<ReturnType<typeof prisma.candidate_reference.findFirst>>,
): ReferenceItem | null {
  if (!row) return null;
  return {
    reference_uuid: row.reference_uuid,
    candidate_id: row.candidate_id,
    name: row.name,
    company: row.company,
    position: row.position,
    phone: row.phone,
    email: row.email,
    relationship: row.relationship,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/** Validate a single item with safeParse. */
function validateItem(
  item: ReferenceItem | null,
  context: string,
): ReferenceItem | null {
  const parsed = referenceItemSchema.nullable().safeParse(item);
  if (!parsed.success) {
    console.error(
      `[modules/references] ${context} item output validation failed:`,
      parsed.error.issues,
    );
  }
  return item;
}

/** Validate a list result with safeParse. */
function validateList(
  items: ReferenceItem[],
  context: string,
): ReferenceItem[] {
  const parsed = referenceListSchema.safeParse(items);
  if (!parsed.success) {
    console.error(
      `[modules/references] ${context} list output validation failed:`,
      parsed.error.issues,
    );
  }
  return items;
}

/** Validate an action result with safeParse. */
function validateActionResult(
  result: ReferenceActionResult,
  context: string,
): ReferenceActionResult {
  const parsed = referenceActionResultSchema.safeParse(result);
  if (!parsed.success) {
    console.error(
      `[modules/references] ${context} action result output validation failed:`,
      parsed.error.issues,
    );
  }
  return result;
}

// ---------------------------------------------------------------------------
// listCandidateReferences
// ---------------------------------------------------------------------------

/**
 * List reference records for a candidate (paginated, non-deleted, newest first).
 */
export async function listCandidateReferences(
  candidateId: number,
  input: z.input<typeof listReferencesInputSchema> = {},
): Promise<ReferenceItem[]> {
  const parsed = listReferencesInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid reference list params",
    );
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const rows = await prisma.candidate_reference.findMany({
    where: {
      candidate_id: candidateId,
      deleted: 0,
    },
    orderBy: [
      { created_at: "desc" },
      { reference_uuid: "desc" },
    ],
    skip,
    take: limit,
  });

  const items = rows.map((r: any) => toItem(r)!);
  return validateList(items, "listCandidateReferences");
}

// ---------------------------------------------------------------------------
// getCandidateReference
// ---------------------------------------------------------------------------

/**
 * Get a single reference record by UUID.
 * Returns null if not found or deleted.
 */
export async function getCandidateReference(
  referenceUuid: string,
): Promise<ReferenceItem | null> {
  const parsed = getReferenceInputSchema.safeParse({ referenceUuid });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid reference UUID",
    );
  }

  const row = await prisma.candidate_reference.findFirst({
    where: {
      reference_uuid: parsed.data.referenceUuid,
      deleted: 0,
    },
  });

  const result = toItem(row);
  return validateItem(result, "getCandidateReference");
}

// ---------------------------------------------------------------------------
// createCandidateReference
// ---------------------------------------------------------------------------

/**
 * Create a new reference record for a candidate.
 */
export async function createCandidateReference(
  candidateId: number,
  data: z.input<typeof createReferenceInputSchema>,
): Promise<ReferenceActionResult> {
  const parsed = createReferenceInputSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid reference data",
    };
  }

  const now = new Date();
  const referenceUuid = `ref_${crypto.randomUUID()}`;

  await prisma.candidate_reference.create({
    data: {
      reference_uuid: referenceUuid,
      candidate_id: candidateId,
      name: parsed.data.name,
      company: parsed.data.company || null,
      position: parsed.data.position || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      relationship: parsed.data.relationship || null,
      deleted: 0,
      created_at: now,
      updated_at: now,
    },
  });

  const result: ReferenceActionResult = { success: true, referenceUuid };
  return validateActionResult(result, "createCandidateReference");
}

// ---------------------------------------------------------------------------
// updateCandidateReference
// ---------------------------------------------------------------------------

/**
 * Update an existing reference record, scoped to a candidate.
 */
export async function updateCandidateReference(
  candidateId: number,
  data: z.input<typeof updateReferenceInputSchema>,
): Promise<ReferenceActionResult> {
  const parsed = updateReferenceInputSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid reference data",
    };
  }

  const referenceUuid = parsed.data.referenceUuid;

  // Verify ownership
  const existing = await prisma.candidate_reference.findFirst({
    where: {
      reference_uuid: referenceUuid,
      candidate_id: candidateId,
      deleted: 0,
    },
    select: { reference_uuid: true },
  });
  if (!existing) {
    return {
      success: false,
      error: "Reference record not found or access denied",
    };
  }

  await prisma.candidate_reference.update({
    where: { reference_uuid: referenceUuid },
    data: {
      name: parsed.data.name,
      company: parsed.data.company || null,
      position: parsed.data.position || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      relationship: parsed.data.relationship || null,
      updated_at: new Date(),
    },
  });

  const result: ReferenceActionResult = { success: true, referenceUuid };
  return validateActionResult(result, "updateCandidateReference");
}

// ---------------------------------------------------------------------------
// deleteCandidateReference
// ---------------------------------------------------------------------------

/**
 * Delete a reference record (soft-delete using the `deleted` flag).
 */
export async function deleteCandidateReference(
  referenceUuid: string,
  candidateId: number,
): Promise<ReferenceActionResult> {
  const parsed = deleteReferenceInputSchema.safeParse({ referenceUuid });
  if (!parsed.success) {
    return { success: false, error: "Invalid reference UUID" };
  }

  // Verify ownership
  const existing = await prisma.candidate_reference.findFirst({
    where: {
      reference_uuid: parsed.data.referenceUuid,
      candidate_id: candidateId,
      deleted: 0,
    },
    select: { reference_uuid: true },
  });
  if (!existing) {
    return {
      success: false,
      error: "Reference record not found or access denied",
    };
  }

  // Soft-delete
  await prisma.candidate_reference.update({
    where: { reference_uuid: parsed.data.referenceUuid },
    data: { deleted: 1 },
  });

  const result: ReferenceActionResult = {
    success: true,
    referenceUuid: parsed.data.referenceUuid,
  };
  return validateActionResult(result, "deleteCandidateReference");
}
