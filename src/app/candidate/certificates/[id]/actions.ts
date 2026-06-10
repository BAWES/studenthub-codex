"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  getCertificateSchema,
  updateCertificateSchema,
  deleteCertificateSchema,
  type GetCertificateInput,
  type UpdateCertificateInput,
  type DeleteCertificateInput,
} from "./schemas";
import {
  getCertificate as parentGetCertificate,
  updateCertificate as parentUpdateCertificate,
  deleteCertificate as parentDeleteCertificate,
} from "../actions";

// ---------------------------------------------------------------------------
// getCertificate
// ---------------------------------------------------------------------------

/**
 * Get a single certificate by UUID for the [id] route.
 * Delegates to the parent-level getCertificate action.
 */
export async function getCertificate(
  input: GetCertificateInput,
): Promise<ReturnType<typeof parentGetCertificate>> {
  const parsed = getCertificateSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  return parentGetCertificate(parsed.data.uuid);
}

// ---------------------------------------------------------------------------
// updateCertificate
// ---------------------------------------------------------------------------

/**
 * Update a single certificate by UUID for the [id] route.
 * Delegates to the parent-level updateCertificate action.
 */
export async function updateCertificate(
  input: UpdateCertificateInput,
): Promise<ReturnType<typeof parentUpdateCertificate>> {
  await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = updateCertificateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { certificateUuid, ...fields } = parsed.data;

  return parentUpdateCertificate({
    certificateUuid,
    ...fields,
  });
}

// ---------------------------------------------------------------------------
// deleteCertificate
// ---------------------------------------------------------------------------

/**
 * Soft-delete a single certificate by UUID for the [id] route.
 * Delegates to the parent-level deleteCertificate action.
 */
export async function deleteCertificate(
  input: DeleteCertificateInput,
): Promise<ReturnType<typeof parentDeleteCertificate>> {
  await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = deleteCertificateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  return parentDeleteCertificate(parsed.data.certificateUuid);
}
