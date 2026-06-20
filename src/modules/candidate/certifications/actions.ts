"use server";

// ---------------------------------------------------------------------------
// Candidate Certifications — module-level server actions
// ---------------------------------------------------------------------------
// Ported from app/candidate/certifications and src/modules/certifications.
// Handles session extraction, Zod validation, Prisma queries, and output
// validation in one cohesive layer.
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  listCertificationsSchema,
  getCertificationSchema,
  createCertificationSchema,
  updateCertificationSchema,
  deleteCertificationSchema,
  certificationItemOutputSchema,
  certificationListOutputSchema,
  certificationActionResultOutputSchema,
  type ListCertificationsInput,
  type CreateCertificationInput,
  type UpdateCertificationInput,
  type CertificationActionResult,
  type CertificationItem,
} from "./schemas";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function logOutputError(source: string, error: unknown): void {
  console.error(`[modules/candidate/certifications] ${source} output failed:`, error);
}

// ---------------------------------------------------------------------------
// Server Actions
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
  const candidateId = Number(session.id);

  const [items] = await Promise.all([
    prisma.candidate_certification.findMany({
      where: { candidate_id: candidateId, deleted: 0 },
      orderBy: [{ created_at: "desc" }, { certification_id: "desc" }],
      skip: page && limit ? (page - 1) * limit : undefined,
      take: limit,
    }),
  ]);

  const result = items as unknown as CertificationItem[];

  // Validate output shape
  const outputParsed = certificationListOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listCandidateCertifications", outputParsed.error.issues);
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
  const candidateId = Number(session.id);

  const parsed = getCertificationSchema.safeParse({ certificationId });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid certification ID",
    );
  }

  const item = await prisma.candidate_certification.findFirst({
    where: {
      certification_id: parsed.data.certificationId,
      candidate_id: candidateId,
      deleted: 0,
    },
  });

  if (!item) return null;

  const result = item as unknown as CertificationItem;

  // Validate output shape
  const outputParsed = certificationItemOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("getCandidateCertification", outputParsed.error.issues);
  }

  return result;
}

/**
 * Create a new certification record for the current candidate.
 */
export async function createCandidateCertification(
  data: CreateCertificationInput,
): Promise<CertificationActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");
  const candidateId = Number(session.id);

  const parsed = createCertificationSchema.safeParse(data);
  if (!parsed.success) {
    const errorResult: CertificationActionResult = {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid certification data",
    };

    const outputParsed = certificationActionResultOutputSchema.safeParse(errorResult);
    if (!outputParsed.success) {
      logOutputError("createCandidateCertification", outputParsed.error.issues);
    }

    return errorResult;
  }

  const newItem = await prisma.candidate_certification.create({
    data: {
      candidate_id: candidateId,
      certification_name: parsed.data.certificationName,
      issuing_organization: parsed.data.issuingOrganization,
      issue_date: parsed.data.issueDate ? new Date(parsed.data.issueDate) : null,
      expiry_date: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : null,
      credential_id: parsed.data.credentialId ?? null,
      credential_url: parsed.data.credentialUrl ?? null,
      description: parsed.data.description ?? null,
      deleted: 0,
    },
  });

  revalidatePath("/candidate/certifications");

  const result: CertificationActionResult = {
    success: true,
    certificationId: newItem.certification_id,
  };

  const outputParsed = certificationActionResultOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("createCandidateCertification", outputParsed.error.issues);
  }

  return result;
}

/**
 * Update an existing certification record.
 */
export async function updateCandidateCertification(
  data: UpdateCertificationInput,
): Promise<CertificationActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");
  const candidateId = Number(session.id);

  const parsed = updateCertificationSchema.safeParse(data);
  if (!parsed.success) {
    const errorResult: CertificationActionResult = {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid certification data",
    };

    const outputParsed = certificationActionResultOutputSchema.safeParse(errorResult);
    if (!outputParsed.success) {
      logOutputError("updateCandidateCertification", outputParsed.error.issues);
    }

    return errorResult;
  }

  // Verify ownership
  const existing = await prisma.candidate_certification.findFirst({
    where: {
      certification_id: parsed.data.certificationId,
      candidate_id: candidateId,
      deleted: 0,
    },
    select: { certification_id: true },
  });

  if (!existing) {
    return { success: false, error: "Certification not found or access denied" };
  }

  await prisma.candidate_certification.update({
    where: { certification_id: parsed.data.certificationId },
    data: {
      ...(parsed.data.certificationName !== undefined && { certification_name: parsed.data.certificationName }),
      ...(parsed.data.issuingOrganization !== undefined && { issuing_organization: parsed.data.issuingOrganization }),
      ...(parsed.data.issueDate !== undefined && { issue_date: new Date(parsed.data.issueDate) }),
      ...(parsed.data.expiryDate !== undefined && { expiry_date: new Date(parsed.data.expiryDate) }),
      ...(parsed.data.credentialId !== undefined && { credential_id: parsed.data.credentialId }),
      ...(parsed.data.credentialUrl !== undefined && { credential_url: parsed.data.credentialUrl }),
      ...(parsed.data.description !== undefined && { description: parsed.data.description }),
    },
  });

  revalidatePath("/candidate/certifications");

  const result: CertificationActionResult = {
    success: true,
    certificationId: parsed.data.certificationId,
  };

  const outputParsed = certificationActionResultOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("updateCandidateCertification", outputParsed.error.issues);
  }

  return result;
}

/**
 * Delete a certification record by ID (soft-delete).
 */
export async function deleteCandidateCertification(
  certificationId: number,
): Promise<CertificationActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");
  const candidateId = Number(session.id);

  const parsed = deleteCertificationSchema.safeParse({ certificationId });
  if (!parsed.success) {
    const errorResult: CertificationActionResult = {
      success: false,
      error: "Invalid certification ID",
    };

    const outputParsed = certificationActionResultOutputSchema.safeParse(errorResult);
    if (!outputParsed.success) {
      logOutputError("deleteCandidateCertification", outputParsed.error.issues);
    }

    return errorResult;
  }

  // Verify ownership
  const existing = await prisma.candidate_certification.findFirst({
    where: {
      certification_id: parsed.data.certificationId,
      candidate_id: candidateId,
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

  const result: CertificationActionResult = {
    success: true,
    certificationId: parsed.data.certificationId,
  };

  const outputParsed = certificationActionResultOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("deleteCandidateCertification", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// getCertification — [certificationId] route wrapper
// ---------------------------------------------------------------------------

/**
 * Get a single certification record by ID (for the [certificationId] route).
 * Delegates to getCandidateCertification.
 */
export async function getCertification(
  certificationId: number,
): Promise<CertificationItem | null> {
  return getCandidateCertification(certificationId);
}

// ---------------------------------------------------------------------------
// updateCertification — [certificationId] route wrapper
// ---------------------------------------------------------------------------

/**
 * Update a certification record (for the [certificationId] edit route).
 * Delegates to updateCandidateCertification.
 */
export async function updateCertification(
  data: UpdateCertificationInput,
): Promise<CertificationActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");
  const result = await updateCandidateCertification(data);

  if (result.success) {
    revalidatePath("/candidate/certifications");
  }

  return result;
}

// ---------------------------------------------------------------------------
// deleteCertification — [certificationId] route wrapper
// ---------------------------------------------------------------------------

/**
 * Delete a certification record by ID (for the [certificationId] route).
 * Delegates to deleteCandidateCertification.
 */
export async function deleteCertification(
  certificationId: number,
): Promise<CertificationActionResult> {
  return deleteCandidateCertification(certificationId);
}

// ---------------------------------------------------------------------------
// createCertification — new route wrapper
// ---------------------------------------------------------------------------

/**
 * Create a new certification record (for the new route).
 * Delegates to createCandidateCertification.
 */
export async function createCertification(
  data: CreateCertificationInput,
): Promise<CertificationActionResult> {
  return createCandidateCertification(data);
}
