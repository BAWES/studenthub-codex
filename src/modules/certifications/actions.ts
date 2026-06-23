"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  certificationActionResultSchema,
  certificationItemSchema,
  certificationListSchema,
} from "./schemas";
import type {
  CertificationActionResult,
  CertificationItem,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

const listCertificationsInputSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getCertificationInputSchema = z.object({
  certificationId: z.coerce.number().int().positive("Certification ID is required"),
});

const createCertificationInputSchema = z.object({
  certificationName: z
    .string()
    .min(1, "Certification name is required")
    .max(255, "Certification name must be 255 characters or fewer")
    .transform((v) => v.trim()),
  issuingOrganization: z
    .string()
    .min(1, "Issuing organization is required")
    .max(255, "Issuing organization must be 255 characters or fewer")
    .transform((v) => v.trim()),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  credentialId: z
    .string()
    .max(128, "Credential ID must be 128 characters or fewer")
    .optional()
    .transform((v) => v?.trim() || undefined),
  credentialUrl: z
    .string()
    .max(500, "Credential URL must be 500 characters or fewer")
    .url("Credential URL must be a valid URL")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or fewer")
    .optional()
    .transform((v) => v?.trim() || undefined),
});

const updateCertificationInputSchema = z.object({
  certificationId: z.coerce.number().int().positive("Certification ID is required"),
  certificationName: z
    .string()
    .min(1, "Certification name is required")
    .max(255, "Certification name must be 255 characters or fewer")
    .transform((v) => v.trim()),
  issuingOrganization: z
    .string()
    .min(1, "Issuing organization is required")
    .max(255, "Issuing organization must be 255 characters or fewer")
    .transform((v) => v.trim()),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  credentialId: z
    .string()
    .max(128, "Credential ID must be 128 characters or fewer")
    .optional()
    .transform((v) => v?.trim() || undefined),
  credentialUrl: z
    .string()
    .max(500, "Credential URL must be 500 characters or fewer")
    .url("Credential URL must be a valid URL")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or fewer")
    .optional()
    .transform((v) => v?.trim() || undefined),
});

const deleteCertificationInputSchema = z.object({
  certificationId: z.coerce.number().int().positive("Certification ID is required"),
});

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

/** Validate a single item with safeParse. */
function validateItem(
  item: CertificationItem | null,
  context: string,
): CertificationItem | null {
  const parsed = certificationItemSchema.nullable().safeParse(item);
  if (!parsed.success) {
    console.error(
      `[modules/certifications] ${context} item output validation failed:`,
      parsed.error.issues,
    );
  }
  return item;
}

/** Validate a list result with safeParse. */
function validateList(
  items: CertificationItem[],
  context: string,
): CertificationItem[] {
  const parsed = certificationListSchema.safeParse(items);
  if (!parsed.success) {
    console.error(
      `[modules/certifications] ${context} list output validation failed:`,
      parsed.error.issues,
    );
  }
  return items;
}

/** Validate an action result with safeParse. */
function validateActionResult(
  result: CertificationActionResult,
  context: string,
): CertificationActionResult {
  const parsed = certificationActionResultSchema.safeParse(result);
  if (!parsed.success) {
    console.error(
      `[modules/certifications] ${context} action result output validation failed:`,
      parsed.error.issues,
    );
  }
  return result;
}

// ---------------------------------------------------------------------------
// listCandidateCertifications
// ---------------------------------------------------------------------------

/**
 * List certification records for a candidate (paginated).
 */
export async function listCandidateCertifications(
  candidateId: number,
  input: z.input<typeof listCertificationsInputSchema> = {},
): Promise<CertificationItem[]> {
  const parsed = listCertificationsInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid certifications list params",
    );
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const rows = await prisma.candidate_certification.findMany({
    where: {
      candidate_id: candidateId,
      deleted: 0,
    },
    orderBy: [{ created_at: "desc" }, { certification_id: "desc" }],
    skip,
    take: limit,
  });

  const result = rows.map((r: any) => toItem(r)!);
  return validateList(result, "listCandidateCertifications");
}

// ---------------------------------------------------------------------------
// getCandidateCertification
// ---------------------------------------------------------------------------

/**
 * Get a single certification record by ID, scoped to a candidate.
 */
export async function getCandidateCertification(
  candidateId: number,
  certificationId: number,
): Promise<CertificationItem | null> {
  const parsed = getCertificationInputSchema.safeParse({ certificationId });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid certification ID",
    );
  }

  const row = await prisma.candidate_certification.findFirst({
    where: {
      certification_id: parsed.data.certificationId,
      candidate_id: candidateId,
      deleted: 0,
    },
  });

  const result = toItem(row);
  return validateItem(result, "getCandidateCertification");
}

// ---------------------------------------------------------------------------
// createCandidateCertification
// ---------------------------------------------------------------------------

/**
 * Create a new certification record for a candidate.
 */
export async function createCandidateCertification(
  candidateId: number,
  data: z.input<typeof createCertificationInputSchema>,
): Promise<CertificationActionResult> {
  const parsed = createCertificationInputSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid certification data",
    };
  }

  const now = new Date();

  const row = await prisma.candidate_certification.create({
    data: {
      candidate_id: candidateId,
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

  const actionResult: CertificationActionResult = {
    success: true,
    certificationId: row.certification_id,
  };

  return validateActionResult(actionResult, "createCandidateCertification");
}

// ---------------------------------------------------------------------------
// updateCandidateCertification
// ---------------------------------------------------------------------------

/**
 * Update an existing certification record, scoped to a candidate.
 */
export async function updateCandidateCertification(
  candidateId: number,
  data: z.input<typeof updateCertificationInputSchema>,
): Promise<CertificationActionResult> {
  const parsed = updateCertificationInputSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid certification data",
    };
  }

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

  const actionResult: CertificationActionResult = {
    success: true,
    certificationId,
  };

  return validateActionResult(actionResult, "updateCandidateCertification");
}

// ---------------------------------------------------------------------------
// deleteCandidateCertification
// ---------------------------------------------------------------------------

/**
 * Soft-delete a certification record by ID, scoped to a candidate.
 */
export async function deleteCandidateCertification(
  candidateId: number,
  certificationId: number,
): Promise<CertificationActionResult> {
  const parsed = deleteCertificationInputSchema.safeParse({ certificationId });
  if (!parsed.success) {
    return { success: false, error: "Invalid certification ID" };
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

  const actionResult: CertificationActionResult = {
    success: true,
    certificationId: parsed.data.certificationId,
  };

  return validateActionResult(actionResult, "deleteCandidateCertification");
}
