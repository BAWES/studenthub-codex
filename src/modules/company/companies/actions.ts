// ---------------------------------------------------------------------------
// Module: company/companies/actions
// Raw Prisma wrappers — no auth checks, no revalidation, no output formatting.
// Page-level server actions import these and add auth/validation/revalidation.
// ---------------------------------------------------------------------------

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  companyLinkOutputSchema,
  companyDetailTxOutputSchema,
  companyWithRelationsOutputSchema,
  companyUpdateResultOutputSchema,
} from "./schemas";
import type {
  CompanyLinkOutput as CompanyLink,
  CompanyWithRelationsOutput as CompanyWithRelations,
  CompanyDetailTxOutput as CompanyDetailData,
  CompanyUpdateResultOutput as CompanyUpdateResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// getCompanyLinksByContact
// ---------------------------------------------------------------------------

/**
 * Fetch company IDs linked to a contact.
 * Returns raw Prisma rows — caller does the scoping.
 */
export async function getCompanyLinksByContact(
  contactUuid: string,
): Promise<CompanyLink[]> {
  const result = await prisma.company_contact.findMany({
    where: { contact_uuid: contactUuid, allow_access: true },
    select: { company_id: true },
  });

  // Validate output shape
  const outputParsed = z.array(companyLinkOutputSchema).safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/company/companies] getCompanyLinksByContact output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getCompanyDetailTx
// ---------------------------------------------------------------------------

/**
 * Fetch a company's full detail via a Prisma $transaction:
 * company, requests, contacts, stores, notes.
 * Returns the raw tuple — caller formats + validates.
 */
export async function getCompanyDetailTx(
  companyId: number,
): Promise<readonly [unknown, unknown[], unknown[], unknown[], unknown[]]> {
  const result = await prisma.$transaction([
    prisma.company.findUnique({
      where: { company_id: companyId },
      select: {
        company_id: true,
        company_name: true,
        company_common_name_en: true,
        company_email: true,
        company_website: true,
        company_approved_to_hire: true,
        company_hourly_rate: true,
        currency_code: true,
        no_of_active_requests: true,
        company_created_at: true,
        company_updated_at: true,
        staff: { select: { staff_name: true, staff_email: true } },
        country: { select: { country_name_en: true } },
      },
    }),
    prisma.request.findMany({
      where: { company_id: companyId },
      orderBy: { request_updated_datetime: "desc" },
      take: 8,
      select: {
        request_uuid: true,
        request_position_title: true,
        request_status: true,
        request_number_of_employees: true,
        request_updated_datetime: true,
      },
    }),
    prisma.company_contact.findMany({
      where: { company_id: companyId },
      take: 8,
      select: {
        company_contact_uuid: true,
        contact_position: true,
        allow_access: true,
        contact: { select: { contact_name: true, contact_email: true } },
      },
    }),
    prisma.store.findMany({
      where: { company_id: companyId, deleted: 0 },
      take: 8,
      select: { store_id: true, store_name: true, store_status: true },
    }),
    prisma.note.findMany({
      where: { company_id: companyId },
      orderBy: { note_created_datetime: "desc" },
      take: 6,
      select: {
        note_uuid: true,
        note_type: true,
        note_text: true,
        note_created_datetime: true,
      },
    }),
  ]);

  // Validate output shape
  const outputParsed = companyDetailTxOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/company/companies] getCompanyDetailTx output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// findCompanyById
// ---------------------------------------------------------------------------

/**
 * Find a single company by ID with country, parent company, and staff.
 * Returns raw Prisma row — caller formats + validates.
 */
export async function findCompanyById(
  companyId: number,
): Promise<CompanyWithRelations | null> {
  const result = await prisma.company.findUnique({
    where: { company_id: companyId },
    include: {
      country: { select: { country_name_en: true } },
      company: { select: { company_name: true } },
      staff: { select: { staff_name: true, staff_email: true } },
    },
  });

  // Validate output shape (only when not null)
  if (result !== null) {
    const outputParsed = companyWithRelationsOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/company/companies] findCompanyById output validation failed:",
        outputParsed.error.issues,
      );
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// updateCompanyById
// ---------------------------------------------------------------------------

/**
 * Update a company by ID with the provided fields.
 * Raw Prisma wrapper — caller constructs the update payload.
 * Returns the updated row (only company_id selected).
 */
export async function updateCompanyById(
  companyId: number,
  data: Record<string, unknown>,
): Promise<CompanyUpdateResult> {
  const result = await prisma.company.update({
    where: { company_id: companyId },
    data: data as any,
    select: { company_id: true },
  });

  // Validate output shape
  const outputParsed = companyUpdateResultOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/company/companies] updateCompanyById output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
