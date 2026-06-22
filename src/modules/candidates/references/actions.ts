"use server";

import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  listCandidateReferencesSchema,
  createCandidateReferenceSchema,
  updateCandidateReferenceSchema,
  deleteCandidateReferenceSchema,
  candidateReferenceItemSchema,
  listCandidateReferencesResultSchema,
  candidateReferenceActionResultSchema,
  type ListCandidateReferencesParams,
  type CreateCandidateReferenceParams,
  type UpdateCandidateReferenceParams,
  type DeleteCandidateReferenceParams,
  type CandidateReferenceItem,
  type ListCandidateReferencesResult,
  type CandidateReferenceActionResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a Prisma candidate_reference row to the shared item shape. */
function toItem(
  row: Awaited<ReturnType<typeof prisma.candidate_reference.findFirst>>,
): CandidateReferenceItem | null {
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

/** Log output validation errors without throwing. */
function logOutputError(source: string, error: unknown): void {
  console.error(`[modules/candidates/references] ${source} output failed:`, error);
}

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

/**
 * List reference records for the current candidate (newest first).
 */
export async function listCandidateReferences(
  params: ListCandidateReferencesParams = {},
): Promise<ListCandidateReferencesResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const { page, limit } = listCandidateReferencesSchema.parse(params);

  const where = {
    candidate_id: candidateId,
    deleted: 0,
  };

  const [rows, total] = await Promise.all([
    prisma.candidate_reference.findMany({
      where,
      orderBy: [
        { created_at: "desc" },
        { reference_uuid: "desc" },
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.candidate_reference.count({ where }),
  ]);

  const result = {
    items: rows.map((r) => toItem(r)!),
    total,
    page,
    pageSize: limit,
  };

  // Output validation — log mismatches without throwing
  const outputParsed = listCandidateReferencesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listCandidateReferences", outputParsed.error.issues);
  }

  return result;
}

/**
 * Get a single reference record by UUID.
 * Returns null if the record does not exist or does not belong to the candidate.
 */
export async function getCandidateReference(
  referenceUuid: string,
): Promise<CandidateReferenceItem | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const row = await prisma.candidate_reference.findFirst({
    where: {
      reference_uuid: referenceUuid,
      candidate_id: candidateId,
      deleted: 0,
    },
  });

  const result = toItem(row);

  // Output validation — log mismatches without throwing
  const outputParsed = candidateReferenceItemSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("getCandidateReference", outputParsed.error.issues);
  }

  return result;
}

/**
 * Create a new reference record for the current candidate.
 */
export async function createCandidateReference(
  params: CreateCandidateReferenceParams,
): Promise<CandidateReferenceActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");
  const candidateId = Number(session.id);

  const parsed = createCandidateReferenceSchema.safeParse(params);
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

  const result: CandidateReferenceActionResult = { success: true, referenceUuid };

  // Output validation
  const outputParsed = candidateReferenceActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("createCandidateReference", outputParsed.error.issues);
  }

  return result;
}

/**
 * Update an existing reference record.
 * Verifies ownership before updating.
 */
export async function updateCandidateReference(
  params: UpdateCandidateReferenceParams,
): Promise<CandidateReferenceActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");
  const candidateId = Number(session.id);

  const parsed = updateCandidateReferenceSchema.safeParse(params);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid reference data",
    };
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

  await prisma.candidate_reference.update({
    where: { reference_uuid: parsed.data.referenceUuid },
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

  const result: CandidateReferenceActionResult = {
    success: true,
    referenceUuid: parsed.data.referenceUuid,
  };

  // Output validation
  const outputParsed = candidateReferenceActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("updateCandidateReference", outputParsed.error.issues);
  }

  return result;
}

/**
 * Delete a reference record (soft-delete using the `deleted` flag).
 */
export async function deleteCandidateReference(
  params: DeleteCandidateReferenceParams,
): Promise<CandidateReferenceActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");
  const candidateId = Number(session.id);

  const parsed = deleteCandidateReferenceSchema.safeParse(params);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid reference UUID",
    };
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

  const result: CandidateReferenceActionResult = {
    success: true,
    referenceUuid: parsed.data.referenceUuid,
  };

  // Output validation
  const outputParsed = candidateReferenceActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("deleteCandidateReference", outputParsed.error.issues);
  }

  return result;
}
