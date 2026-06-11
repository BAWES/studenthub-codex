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
  adminCompanyRowListSchema,
  adminRequestRowListSchema,
  adminTransferRowListSchema,
  adminCandidateRowListSchema,
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

  // Per-row output validation — log mismatches without throwing
  rows.forEach((row) => {
    const parsed = adminCompanyRowSchema.safeParse(row);
    if (!parsed.success) {
      console.error("[admin] listAdminCompanies row failed:", parsed.error.issues);
    }
  });

  // List-level output validation
  const listParsed = adminCompanyRowListSchema.safeParse(rows);
  if (!listParsed.success) {
    console.error("[admin] listAdminCompanies list failed:", listParsed.error.issues);
  }

  return rows;
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

  // Per-row output validation — log mismatches without throwing
  rows.forEach((row) => {
    const parsed = adminRequestRowSchema.safeParse(row);
    if (!parsed.success) {
      console.error("[admin] listAdminRequests row failed:", parsed.error.issues);
    }
  });

  // List-level output validation
  const listParsed = adminRequestRowListSchema.safeParse(rows);
  if (!listParsed.success) {
    console.error("[admin] listAdminRequests list failed:", listParsed.error.issues);
  }

  return rows;
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

  // Per-row output validation — log mismatches without throwing
  rows.forEach((row) => {
    const parsed = adminTransferRowSchema.safeParse(row);
    if (!parsed.success) {
      console.error("[admin] listAdminTransfers row failed:", parsed.error.issues);
    }
  });

  // List-level output validation
  const listParsed = adminTransferRowListSchema.safeParse(rows);
  if (!listParsed.success) {
    console.error("[admin] listAdminTransfers list failed:", listParsed.error.issues);
  }

  return rows;
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

  // Per-row output validation — log mismatches without throwing
  rows.forEach((row) => {
    const parsed = adminCandidateRowSchema.safeParse(row);
    if (!parsed.success) {
      console.error("[admin] listAdminCandidates row failed:", parsed.error.issues);
    }
  });

  // List-level output validation
  const listParsed = adminCandidateRowListSchema.safeParse(rows);
  if (!listParsed.success) {
    console.error("[admin] listAdminCandidates list failed:", listParsed.error.issues);
  }

  return rows;
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

  // Output validation — log mismatches without throwing
  const parsed = adminTransferDetailSchema.safeParse(detail);
  if (!parsed.success) {
    console.error("[admin] getTransferDetail output validation failed:", parsed.error.issues);
  }

  return detail;
}
