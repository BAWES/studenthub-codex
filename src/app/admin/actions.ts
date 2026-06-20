"use server";

// ---------------------------------------------------------------------------
// Admin — Server Actions (app-level wrappers)
// ---------------------------------------------------------------------------
// Thin wrappers that perform capability checks and delegate all business
// logic (Prisma queries + Zod validation) to the module-level counterparts
// in @/modules/admin/dashboard-actions.
// ---------------------------------------------------------------------------

import { requireCapability } from "@/modules/auth/session";
import {
  listAdminCompanies as moduleListAdminCompanies,
  listAdminRequests as moduleListAdminRequests,
  listAdminTransfers as moduleListAdminTransfers,
  listAdminCandidates as moduleListAdminCandidates,
  getTransferDetail as moduleGetTransferDetail,
} from "@/modules/admin/dashboard-actions";
import type {
  AdminCompanyRow,
  AdminRequestRow,
  AdminTransferRow,
  AdminCandidateRow,
  AdminTransferDetail,
} from "@/modules/admin/dashboard-schemas";

// ---------------------------------------------------------------------------
// listAdminCompanies
// ---------------------------------------------------------------------------

/**
 * Fetch recent company rows for the admin dashboard.
 * Requires company.read.any capability.
 */
export async function listAdminCompanies(): Promise<AdminCompanyRow[]> {
  await requireCapability("company.read.any");
  return moduleListAdminCompanies();
}

// ---------------------------------------------------------------------------
// listAdminRequests
// ---------------------------------------------------------------------------

/**
 * Fetch recent request rows for the admin dashboard.
 * Requires request.read.any capability.
 */
export async function listAdminRequests(): Promise<AdminRequestRow[]> {
  await requireCapability("request.read.any");
  return moduleListAdminRequests();
}

// ---------------------------------------------------------------------------
// listAdminTransfers
// ---------------------------------------------------------------------------

/**
 * Fetch recent transfer rows for the admin dashboard.
 * Requires transfer.read capability.
 */
export async function listAdminTransfers(): Promise<AdminTransferRow[]> {
  await requireCapability("transfer.read");
  return moduleListAdminTransfers();
}

// ---------------------------------------------------------------------------
// listAdminCandidates
// ---------------------------------------------------------------------------

/**
 * Fetch recent candidate rows for the admin dashboard.
 * Requires candidate.read.any capability.
 */
export async function listAdminCandidates(): Promise<AdminCandidateRow[]> {
  await requireCapability("candidate.read.any");
  return moduleListAdminCandidates();
}

// ---------------------------------------------------------------------------
// getTransferDetail
// ---------------------------------------------------------------------------

/**
 * Fetch full transfer detail by transfer ID.
 * Requires transfer.read capability.
 */
export async function getTransferDetail(
  transferId: number,
): Promise<AdminTransferDetail> {
  await requireCapability("transfer.read");
  return moduleGetTransferDetail(transferId);
}
