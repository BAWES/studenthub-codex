"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import type {
  ListCertificationsInput,
  CreateCertificationInput,
  UpdateCertificationInput,
  CertificationActionResult,
  CertificationItem,
} from "./schemas";
import {
  listCertificationsSchema,
  getCertificationSchema,
  createCertificationSchema,
  updateCertificationSchema,
  deleteCertificationSchema,
  certificationItemOutputSchema,
  certificationListOutputSchema,
  certificationActionResultOutputSchema,
} from "./schemas";

// Re-export types for client components
export type { CertificationActionResult, CertificationItem };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a Prisma candidate_certification row to the API shape. */
function toItem(
  row: Awaited<ReturnType<typeof prisma.candidate_certification.findFirst>>,
): CertificationItem | null {
  if (!row) return null;
  return {
    certification_id: row.certification_id,
    certification_name: row.certification_name,
    issuing_organization: row.issuing_organization,
    issue_date: row.issue_date,
    expiry_date: row.expiry_date,
    credential_id: row.credential_id,
    credential_url: row.credential_url,
    description: row.description,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List certification records for the current candidate (paginated).
 */
export async function listCandidateCertifications(
  input: ListCertificationsInput = {},
): Promise<CertificationItem[]> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = listCertificationsSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid certifications list params",
    );
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const rows = await prisma.candidate_certification.findMany({
    where: {
      candidate_id: Number(session.id),
      deleted: 0,
    },
    orderBy: [{ created_at: "desc" }, { certification_id: "desc" }],
    skip,
    take: limit,
  });

  const result = rows.map((r) => toItem(r)!);

  // Validate output shape
  const outputParsed = certificationListOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/certifications] listCandidateCertifications output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get a single certification record by ID.
 * Only returns records belonging to the current candidate.
 */
export async function getCandidateCertification(
  certificationId: number,
): Promise<CertificationItem | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = getCertificationSchema.safeParse({ certificationId });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid certification ID",
    );
  }

  const row = await prisma.candidate_certification.findFirst({
    where: {
      certification_id: parsed.data.certificationId,
      candidate_id: Number(session.id),
      deleted: 0,
    },
  });

  const result = toItem(row);

  // Validate output shape
  if (result !== null) {
    const outputParsed = certificationItemOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[candidate/certifications] getCandidateCertification output validation failed:",
        outputParsed.error.issues,
      );
    }
  }

  return result;
}

/**
 * Create a new certification record for the current candidate.
 */
export async function createCandidateCertification(
  data: CreateCertificationInput,
): Promise<CertificationActionResult> {
  const session = await requireRoleCapability(
    "candidate",
    "candidate.profile.edit",
  );

  const parsed = createCertificationSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid certification data",
    };
  }

  const now = new Date();

  const row = await prisma.candidate_certification.create({
    data: {
      candidate_id: Number(session.id),
      certification_name: parsed.data.certificationName,
      issuing_organization: parsed.data.issuingOrganization,
      issue_date: parsed.data.issueDate ? new Date(parsed.data.issueDate) : null,
      expiry_date: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : null,
      credential_id: parsed.data.credentialId ?? null,
      credential_url: parsed.data.credentialUrl || null,
      description: parsed.data.description ?? null,
      deleted: 0,
      created_at: now,
      updated_at: now,
    },
  });

  revalidatePath("/candidate/certifications");

  const actionResult = { success: true as const, certificationId: row.certification_id };

  // Validate output shape
  const outputParsed = certificationActionResultOutputSchema.safeParse(actionResult);
  if (!outputParsed.success) {
    console.error(
      "[candidate/certifications] createCandidateCertification output validation failed:",
      outputParsed.error.issues,
    );
  }

  return actionResult;
}

/**
 * Update an existing certification record.
 * Uses direct update — certifications have no child records depending on the ID.
 */
export async function updateCandidateCertification(
  data: UpdateCertificationInput,
): Promise<CertificationActionResult> {
  const session = await requireRoleCapability(
    "candidate",
    "candidate.profile.edit",
  );

  const parsed = updateCertificationSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid certification data",
    };
  }

  const candidateId = Number(session.id);
  const certificationId = parsed.data.certificationId;

  // Verify ownership
  const existing = await prisma.candidate_certification.findFirst({
    where: {
      certification_id: certificationId,
      candidate_id: candidateId,
      deleted: 0,
    },
    select: { certification_id: true },
  });
  if (!existing) {
    return { success: false, error: "Certification not found or access denied" };
  }

  // Direct update
  await prisma.candidate_certification.update({
    where: { certification_id: certificationId },
    data: {
      certification_name: parsed.data.certificationName,
      issuing_organization: parsed.data.issuingOrganization,
      issue_date: parsed.data.issueDate ? new Date(parsed.data.issueDate) : null,
      expiry_date: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : null,
      credential_id: parsed.data.credentialId ?? null,
      credential_url: parsed.data.credentialUrl || null,
      description: parsed.data.description ?? null,
      updated_at: new Date(),
    },
  });

  revalidatePath("/candidate/certifications");

  const actionResult = { success: true as const, certificationId };

  // Validate output shape
  const outputParsed = certificationActionResultOutputSchema.safeParse(actionResult);
  if (!outputParsed.success) {
    console.error(
      "[candidate/certifications] updateCandidateCertification output validation failed:",
      outputParsed.error.issues,
    );
  }

  return actionResult;
}

/**
 * Delete a certification record by ID (soft-delete).
 */
export async function deleteCandidateCertification(
  certificationId: number,
): Promise<CertificationActionResult> {
  const session = await requireRoleCapability(
    "candidate",
    "candidate.profile.edit",
  );

  const parsed = deleteCertificationSchema.safeParse({ certificationId });
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid certification ID",
    };
  }

  const existing = await prisma.candidate_certification.findFirst({
    where: {
      certification_id: parsed.data.certificationId,
      candidate_id: Number(session.id),
      deleted: 0,
    },
    select: { certification_id: true },
  });
  if (!existing) {
    return { success: false, error: "Certification not found or access denied" };
  }

  // Soft-delete
  await prisma.candidate_certification.update({
    where: { certification_id: parsed.data.certificationId },
    data: { deleted: 1 },
  });

  revalidatePath("/candidate/certifications");

  const actionResult = { success: true as const, certificationId: parsed.data.certificationId };

  // Validate output shape
  const outputParsed = certificationActionResultOutputSchema.safeParse(actionResult);
  if (!outputParsed.success) {
    console.error(
      "[candidate/certifications] deleteCandidateCertification output validation failed:",
      outputParsed.error.issues,
    );
  }

  return actionResult;
}
