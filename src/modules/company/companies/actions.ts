// ---------------------------------------------------------------------------
// Module: company/companies/actions
// Raw Prisma wrappers — no auth checks, no revalidation, no output formatting.
// Page-level server actions import these and add auth/validation/revalidation.
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// getCompanyLinksByContact
// ---------------------------------------------------------------------------

/**
 * Fetch company IDs linked to a contact.
 * Returns raw Prisma rows — caller does the scoping.
 */
export async function getCompanyLinksByContact(
  contactUuid: string,
): Promise<{ company_id: number | null }[]> {
  return prisma.company_contact.findMany({
    where: { contact_uuid: contactUuid, allow_access: true },
    select: { company_id: true },
  });
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
  return prisma.$transaction([
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
): Promise<{
  company_id: number;
  parent_company_id: number | null;
  company_name: string;
  company_common_name_en: string | null;
  company_common_name_ar: string | null;
  company_description_en: string | null;
  company_description_ar: string | null;
  company_website: string | null;
  company_email: string | null;
  company_logo: string | null;
  commercial_licence: string | null;
  company_hourly_rate: unknown | null;
  company_bonus_commission: unknown | null;
  company_followup: boolean | null;
  total_candidate: bigint | number | null;
  no_of_active_requests: number | null;
  is_request_updates_in_30_days: boolean | null;
  company_approved_to_hire: boolean | null;
  company_status_override: boolean | null;
  company_created_at: Date;
  company_updated_at: Date;
  last_request_datetime: Date | null;
  last_payment_datetime: Date | null;
  country_id: number | null;
  currency_code: string | null;
  country: { country_name_en: string } | null;
  company: { company_name: string } | null;
  staff: { staff_name: string } | null;
} | null> {
  return prisma.company.findUnique({
    where: { company_id: companyId },
    include: {
      country: { select: { country_name_en: true } },
      company: { select: { company_name: true } },
      staff: { select: { staff_name: true } },
    },
  });
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
): Promise<{ company_id: number }> {
  return prisma.company.update({
    where: { company_id: companyId },
    data: data as any,
    select: { company_id: true },
  });
}
