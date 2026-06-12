"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listCandidateCertificationsSchema,
  getCandidateCertificationSchema,
  createCandidateCertificationSchema,
  updateCandidateCertificationSchema,
  deleteCandidateCertificationSchema,
  candidateCertificationItemSchema,
  listCandidateCertificationsResultSchema,
  candidateCertificationActionResultSchema,
  type ListCandidateCertificationsParams,
  type GetCandidateCertificationParams,
  type CreateCandidateCertificationParams,
  type UpdateCandidateCertificationParams,
  type DeleteCandidateCertificationParams,
  type CandidateCertificationItem,
  type CandidateCertificationDetail,
  type ListCandidateCertificationsResult,
  type CandidateCertificationActionResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a Prisma candidate_certification row to the shared item shape. */
function toItem(
  row: PrismaCandidateCertificationRow,
): CandidateCertificationItem {
  return {
    certification_id: row.certification_id,
    candidate_id: row.candidate_id,
    certification_name: row.certification_name,
    issuing_organization: row.issuing_organization,
    issue_date: row.issue_date,
    expiry_date: row.expiry_date,
    credential_id: row.credential_id,
    credential_url: row.credential_url,
    description: row.description,
    deleted: row.deleted,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/** Raw row shape from Prisma. */
type PrismaCandidateCertificationRow = NonNullable<
  Awaited<ReturnType<typeof prisma.candidate_certification.findFirst>>
>;

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

/**
 * List certification records for a candidate (paginated).
 * Requires candidate.read capability.
 */
export async function listCandidateCertifications(
  params: ListCandidateCertificationsParams,
): Promise<ListCandidateCertificationsResult> {
  await requireCapability("candidate.read");

  const parsed = listCandidateCertificationsSchema.parse(params);

  const { candidateId, page, limit } = parsed;
  const skip = (page - 1) * limit;
  const where = { candidate_id: candidateId, deleted: 0 };

  const [rows, total] = await Promise.all([
    prisma.candidate_certification.findMany({
      where,
      orderBy: [{ created_at: "desc" }, { certification_id: "desc" }],
      skip,
      take: limit,
    }),
    prisma.candidate_certification.count({ where }),
  ]);

  const result: ListCandidateCertificationsResult = {
    items: rows.map(toItem),
    total,
    page,
    pageSize: limit,
  };

  // Output validation — log mismatches without throwing
  const outputParsed = listCandidateCertificationsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/certifications] listCandidateCertifications output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get a single certification record by ID.
 * Requires candidate.read capability.
 * Returns null if the record does not exist or is soft-deleted.
 */
export async function getCandidateCertification(
  params: GetCandidateCertificationParams,
): Promise<CandidateCertificationDetail> {
  await requireCapability("candidate.read");

  const { certificationId } = getCandidateCertificationSchema.parse(params);

  const row = await prisma.candidate_certification.findUnique({
    where: { certification_id: certificationId },
  });

  if (!row || row.deleted !== 0) return null;

  const result = toItem(row);

  // Output validation — log mismatches without throwing
  const outputParsed = candidateCertificationItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/certifications] getCandidateCertification output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Create a new certification record for a candidate.
 * Requires candidate.profile.edit capability.
 */
export async function createCandidateCertification(
  params: CreateCandidateCertificationParams,
): Promise<CandidateCertificationActionResult> {
  await requireCapability("candidate.profile.edit");

  const parsed = createCandidateCertificationSchema.parse(params);

  const { candidateId, ...certData } = parsed;
  const now = new Date();

  const row = await prisma.candidate_certification.create({
    data: {
      certification_name: certData.certificationName,
      issuing_organization: certData.issuingOrganization,
      candidate_id: candidateId,
      issue_date: certData.issueDate ? new Date(certData.issueDate) : null,
      expiry_date: certData.expiryDate ? new Date(certData.expiryDate) : null,
      credential_id: certData.credentialId ?? null,
      credential_url: certData.credentialUrl || null,
      description: certData.description ?? null,
      deleted: 0,
      created_at: now,
      updated_at: now,
    },
  });

  const result: CandidateCertificationActionResult = {
    success: true,
    certificationId: row.certification_id,
  };

  // Output validation
  const outputParsed = candidateCertificationActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/certifications] createCandidateCertification output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Update an existing certification record.
 * Requires candidate.profile.edit capability.
 */
export async function updateCandidateCertification(
  params: UpdateCandidateCertificationParams,
): Promise<CandidateCertificationActionResult> {
  await requireCapability("candidate.profile.edit");

  const parsed = updateCandidateCertificationSchema.parse(params);

  const { certificationId } = parsed;

  // Verify the record exists
  const existing = await prisma.candidate_certification.findUnique({
    where: { certification_id: certificationId },
    select: { certification_id: true, deleted: true },
  });

  if (!existing || existing.deleted !== 0) {
    const result: CandidateCertificationActionResult = {
      success: false,
      error: "Certification not found or access denied",
    };
    return result;
  }

  // Direct update — certifications have no child records depending on the ID
  await prisma.candidate_certification.update({
    where: { certification_id: certificationId },
    data: {
      certification_name: parsed.certificationName,
      issuing_organization: parsed.issuingOrganization,
      issue_date: parsed.issueDate ? new Date(parsed.issueDate) : null,
      expiry_date: parsed.expiryDate ? new Date(parsed.expiryDate) : null,
      credential_id: parsed.credentialId ?? null,
      credential_url: parsed.credentialUrl || null,
      description: parsed.description ?? null,
      updated_at: new Date(),
    },
  });

  const result: CandidateCertificationActionResult = {
    success: true,
    certificationId,
  };

  // Output validation
  const outputParsed = candidateCertificationActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/certifications] updateCandidateCertification output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Delete a certification record by ID (soft-delete).
 * Requires candidate.profile.edit capability.
 */
export async function deleteCandidateCertification(
  params: DeleteCandidateCertificationParams,
): Promise<CandidateCertificationActionResult> {
  await requireCapability("candidate.profile.edit");

  const { certificationId } = deleteCandidateCertificationSchema.parse(params);

  const existing = await prisma.candidate_certification.findUnique({
    where: { certification_id: certificationId },
    select: { certification_id: true, deleted: true },
  });

  if (!existing || existing.deleted !== 0) {
    const result: CandidateCertificationActionResult = {
      success: false,
      error: "Certification not found or access denied",
    };
    return result;
  }

  // Soft-delete
  await prisma.candidate_certification.update({
    where: { certification_id: certificationId },
    data: { deleted: 1 },
  });

  const result: CandidateCertificationActionResult = {
    success: true,
    certificationId,
  };

  // Output validation
  const outputParsed = candidateCertificationActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/certifications] deleteCandidateCertification output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
