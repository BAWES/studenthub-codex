"use server";

// ---------------------------------------------------------------------------
// Admin — Server Actions
// ---------------------------------------------------------------------------
// Wraps the admin workspace data fetching layer from
// @/modules/workspace/data/admin/ into proper server actions with Zod
// validation and capability checks.
//
// Each action re-exports the data module's return type through a validated
// schema so the client boundary is well-defined.
// ---------------------------------------------------------------------------

import { requireCapability } from "@/modules/auth/session";
import {
  getAdminCompanyRows,
  getAdminRequestRows,
  getAdminTransferRows,
  getAdminTransferDetail,
  getAdminCandidateRows,
} from "@/modules/workspace/data/admin";
import {
  adminCompanyRowSchema,
  adminRequestRowSchema,
  adminTransferRowSchema,
  adminCandidateRowSchema,
  adminTransferDetailSchema,
} from "./schemas";
import type {
  AdminCompanyRow,
  AdminRequestRow,
  AdminTransferRow,
  AdminCandidateRow,
  AdminTransferDetail,
} from "./schemas";

// ---------------------------------------------------------------------------
// listAdminCompanies
// ---------------------------------------------------------------------------

/**
 * Fetch recent company rows for the admin dashboard.
 * Wraps getAdminCompanyRows() with capability check.
 */
export async function listAdminCompanies(): Promise<AdminCompanyRow[]> {
  await requireCapability("company.read.any");
  const rows = await getAdminCompanyRows();
  return rows.map((row) => adminCompanyRowSchema.parse(row));
}

// ---------------------------------------------------------------------------
// listAdminRequests
// ---------------------------------------------------------------------------

/**
 * Fetch recent request rows for the admin dashboard.
 * Wraps getAdminRequestRows() with capability check.
 */
export async function listAdminRequests(): Promise<AdminRequestRow[]> {
  await requireCapability("request.read.any");
  const rows = await getAdminRequestRows();
  return rows.map((row) => adminRequestRowSchema.parse(row));
}

// ---------------------------------------------------------------------------
// listAdminTransfers
// ---------------------------------------------------------------------------

/**
 * Fetch recent transfer rows for the admin dashboard.
 * Wraps getAdminTransferRows() with capability check.
 */
export async function listAdminTransfers(): Promise<AdminTransferRow[]> {
  await requireCapability("transfer.read");
  const rows = await getAdminTransferRows();
  return rows.map((row) => adminTransferRowSchema.parse(row));
}

// ---------------------------------------------------------------------------
// listAdminCandidates
// ---------------------------------------------------------------------------

/**
 * Fetch recent candidate rows for the admin dashboard.
 * Wraps getAdminCandidateRows() with capability check.
 */
export async function listAdminCandidates(): Promise<AdminCandidateRow[]> {
  await requireCapability("candidate.read.any");
  const rows = await getAdminCandidateRows();
  return rows.map((row) => adminCandidateRowSchema.parse(row));
}

// ---------------------------------------------------------------------------
// getTransferDetail
// ---------------------------------------------------------------------------

/**
 * Fetch full transfer detail by transfer ID.
 * Wraps getAdminTransferDetail() with capability check and Zod validation.
 */
export async function getTransferDetail(
  transferId: number,
): Promise<AdminTransferDetail> {
  await requireCapability("transfer.read");
  const detail = await getAdminTransferDetail(transferId);
  return adminTransferDetailSchema.parse(detail);
}
