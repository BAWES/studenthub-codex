"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  listReferenceSchema,
  getReferenceSchema,
  createReferenceSchema,
  updateReferenceSchema,
  deleteReferenceSchema,
  type ListReferenceInput,
  type GetReferenceInput,
  type CreateReferenceInput,
  type UpdateReferenceInput,
  type DeleteReferenceInput,
  type ReferenceItem,
  type ReferenceActionResult,
} from "./schemas";

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

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List reference records for the current candidate (non-deleted, newest first).
 */
export async function listCandidateReferences(
  input: ListReferenceInput = {},
): Promise<ReferenceItem[]> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = listReferenceSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid reference list params",
    );
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const candidateId = Number(session.id);

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

  return rows.map((r) => toItem(r)!);
}

/**
 * Get a single reference record by UUID.
 * Only returns records belonging to the current candidate.
 */
export async function getCandidateReference(
  referenceUuid: string,
): Promise<ReferenceItem | null> {
  await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = getReferenceSchema.safeParse({ referenceUuid });
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

  return toItem(row);
}

/**
 * Create a new reference record for the current candidate.
 */
export async function createCandidateReference(
  data: CreateReferenceInput,
): Promise<ReferenceActionResult> {
  const session = await requireRoleCapability(
    "candidate",
    "candidate.profile.edit",
  );

  const parsed = createReferenceSchema.safeParse(data);
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
      candidate_id: Number(session.id),
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

  revalidatePath("/candidate/references");
  return { success: true, referenceUuid };
}

/**
 * Update an existing reference record.
 * Verifies ownership before updating.
 */
export async function updateCandidateReference(
  data: UpdateReferenceInput,
): Promise<ReferenceActionResult> {
  const session = await requireRoleCapability(
    "candidate",
    "candidate.profile.edit",
  );

  const parsed = updateReferenceSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid reference data",
    };
  }

  const candidateId = Number(session.id);
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

  revalidatePath("/candidate/references");
  return { success: true, referenceUuid };
}

/**
 * Delete a reference record (soft-delete using the `deleted` flag).
 */
export async function deleteCandidateReference(
  referenceUuid: string,
): Promise<ReferenceActionResult> {
  const session = await requireRoleCapability(
    "candidate",
    "candidate.profile.edit",
  );

  const parsed = deleteReferenceSchema.safeParse({ referenceUuid });
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid reference UUID",
    };
  }

  const existing = await prisma.candidate_reference.findFirst({
    where: {
      reference_uuid: parsed.data.referenceUuid,
      candidate_id: Number(session.id),
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

  revalidatePath("/candidate/references");
  return { success: true, referenceUuid: parsed.data.referenceUuid };
}
