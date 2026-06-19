// ---------------------------------------------------------------------------
// Module: company/workspace/actions
// Raw Prisma wrappers — no auth checks, no revalidation, no output formatting.
// Page-level server actions import these and add auth/validation/revalidation.
// ---------------------------------------------------------------------------

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  contactResultOutputSchema,
  companyLinkWithCompanyOutputSchema,
  workspaceStatsOutputSchema,
  contactUpdateResultOutputSchema,
} from "./schemas";
import type {
  ContactResult,
  CompanyLinkWithCompany,
  WorkspaceStats,
  ContactUpdateResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// findContactByUuid
// ---------------------------------------------------------------------------

/**
 * Fetch a contact by UUID.
 * Returns raw Prisma row — caller formats + validates.
 */
export async function findContactByUuid(
  contactUuid: string,
): Promise<ContactResult> {
  const result = await prisma.contact.findUnique({
    where: { contact_uuid: contactUuid },
    select: { contact_name: true, contact_email: true },
  });

  // Validate output shape
  if (result !== null) {
    const outputParsed = contactResultOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/company/workspace] findContactByUuid output validation failed:",
        outputParsed.error.issues,
      );
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// getCompanyLinksForWorkspace
// ---------------------------------------------------------------------------

/**
 * Fetch company links for a contact, including company details.
 * Returns raw Prisma rows — caller formats + validates.
 */
export async function getCompanyLinksForWorkspace(
  contactUuid: string,
): Promise<CompanyLinkWithCompany[]> {
  const result = await prisma.company_contact.findMany({
    where: { contact_uuid: contactUuid },
    take: 20,
    select: {
      company_contact_uuid: true,
      contact_position: true,
      allow_access: true,
      company: {
        select: {
          company_id: true,
          company_name: true,
          company_email: true,
          no_of_active_requests: true,
          company_approved_to_hire: true,
        },
      },
    },
  });

  // Validate output shape
  const outputParsed = z.array(companyLinkWithCompanyOutputSchema).safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/company/workspace] getCompanyLinksForWorkspace output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getWorkspaceStatsTx
// ---------------------------------------------------------------------------

/**
 * Fetch workspace aggregate stats via a Prisma $transaction:
 * request count, store count, note count, and recent requests.
 * Returns the raw tuple — caller formats + validates.
 */
export async function getWorkspaceStatsTx(
  companyIds: number[],
): Promise<readonly [number, number, number, unknown[]]> {
  return prisma.$transaction([
    prisma.request.count({ where: { company_id: { in: companyIds } } }),
    prisma.store.count({ where: { company_id: { in: companyIds }, deleted: 0 } }),
    prisma.note.count({ where: { company_id: { in: companyIds } } }),
    prisma.request.findMany({
      where: { company_id: { in: companyIds } },
      orderBy: { request_created_datetime: "desc" },
      take: 6,
      select: {
        request_uuid: true,
        request_position_title: true,
        request_status: true,
        request_number_of_employees: true,
        request_created_datetime: true,
        company: { select: { company_name: true } },
      },
    }),
  ]);
}

// ---------------------------------------------------------------------------
// updateContactByUuid
// ---------------------------------------------------------------------------

/**
 * Update a contact's fields by UUID.
 * Raw Prisma wrapper — caller constructs the update payload.
 * Returns the updated row (only contact_uuid selected).
 */
export async function updateContactByUuid(
  contactUuid: string,
  data: Record<string, unknown>,
): Promise<ContactUpdateResult> {
  const result = await prisma.contact.update({
    where: { contact_uuid: contactUuid },
    data: data as any,
    select: { contact_uuid: true },
  });

  // Validate output shape
  const outputParsed = contactUpdateResultOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/company/workspace] updateContactByUuid output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
