"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { formatDate, formatMoney } from "@/modules/workspace/format";
import {
  listAdminCompaniesSchema,
  getAdminCompanySchema,
  adminCompanyDetailSchema,
  adminCompanyToggleResponseSchema,
} from "./schemas";
import type {
  ListAdminCompaniesInput,
  CompanyRow,
  CompanyDetail,
} from "./schemas";

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List all companies for the admin view.
 * Paginated with optional search and status filter.
 * Mirrors the legacy getAdminCompanyRows().
 */
export async function listAdminCompanies(
  input: ListAdminCompaniesInput = {},
): Promise<{ items: CompanyRow[]; total: number; page: number; limit: number; totalPages: number }> {
  await requireCapability("company.read.any");

  const parsed = listAdminCompaniesSchema.safeParse(input);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 60, totalPages: 0 };
  }

  const { page, limit, q, status } = parsed.data;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Record<string, unknown> = { deleted: 0 };

  if (status === "approved") {
    where.company_approved_to_hire = true;
  } else if (status === "not_approved") {
    where.company_approved_to_hire = false;
  }

  if (q && q.trim().length > 0) {
    where.OR = [
      { company_name: { contains: q.trim() } },
      { company_email: { contains: q.trim() } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.company.findMany({
      where: where as any,
      orderBy: { company_updated_at: "desc" },
      skip,
      take: limit,
      select: {
        company_id: true,
        company_name: true,
        company_email: true,
        no_of_active_requests: true,
        company_approved_to_hire: true,
        company_hourly_rate: true,
        currency_code: true,
        company_updated_at: true,
        staff: { select: { staff_name: true } },
      },
    }),
    prisma.company.count({ where: where as any }),
  ]);

  const items: CompanyRow[] = rows.map((row) => ({
    id: row.company_id,
    name: row.company_name,
    email: row.company_email ?? "No email",
    owner: row.staff?.staff_name ?? "Unassigned",
    requests: row.no_of_active_requests ?? 0,
    status: row.company_approved_to_hire ? "Approved" : "Not approved",
    rate: formatMoney(row.company_hourly_rate, row.currency_code ?? "KWD"),
    updated: formatDate(row.company_updated_at),
  }));

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single company by ID with full detail.
 * Mirrors the legacy getCompanyDetail().
 */
export async function getAdminCompanyDetail(
  companyId: number,
): Promise<CompanyDetail> {
  await requireCapability("company.read.any");

  const parsed = getAdminCompanySchema.safeParse({ companyId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid company ID");
  }

  const id = parsed.data.companyId;

  const [company, requests, contacts, stores, notes] = await prisma.$transaction([
    prisma.company.findUnique({
      where: { company_id: id },
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
      where: { company_id: id },
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
      where: { company_id: id },
      take: 8,
      select: {
        company_contact_uuid: true,
        contact_position: true,
        allow_access: true,
        contact: { select: { contact_name: true, contact_email: true } },
      },
    }),
    prisma.store.findMany({
      where: { company_id: id, deleted: 0 },
      take: 8,
      select: { store_id: true, store_name: true, store_status: true },
    }),
    prisma.note.findMany({
      where: { company_id: id },
      orderBy: { note_created_datetime: "desc" },
      take: 6,
      select: { note_uuid: true, note_type: true, note_text: true, note_created_datetime: true },
    }),
  ]);

  const result = {
    company: company
      ? {
          company_id: company.company_id,
          company_name: company.company_name,
          company_common_name_en: company.company_common_name_en,
          company_email: company.company_email,
          company_website: company.company_website,
          company_approved_to_hire: company.company_approved_to_hire,
          company_hourly_rate: company.company_hourly_rate?.toNumber() ?? null,
          currency_code: company.currency_code,
          no_of_active_requests: company.no_of_active_requests,
          company_created_at: company.company_created_at,
          company_updated_at: company.company_updated_at,
          staff_name: company.staff?.staff_name ?? null,
          staff_email: company.staff?.staff_email ?? null,
          country_name_en: company.country?.country_name_en ?? null,
        }
      : null,
    metrics: [
      { label: "Active Requests", value: company?.no_of_active_requests ?? requests.length, note: "Legacy active request count" },
      { label: "Approved", value: company?.company_approved_to_hire ? "Yes" : "No", note: "Approved to hire" },
      { label: "Rate", value: formatMoney(company?.company_hourly_rate, company?.currency_code ?? "KWD"), note: "Company hourly rate" },
      { label: "Owner", value: company?.staff?.staff_name ?? "Unassigned", note: company?.staff?.staff_email ?? "No staff email" },
    ],
    requests: requests.map((request) => ({
      id: request.request_uuid,
      title: request.request_position_title ?? "Untitled request",
      subtitle: `${request.request_number_of_employees ?? 0} seats`,
      meta: `${request.request_status ?? "No status"} · ${formatDate(request.request_updated_datetime)}`,
    })),
    contacts: contacts.map((contact) => ({
      id: contact.company_contact_uuid,
      title: contact.contact?.contact_name ?? "Contact",
      subtitle: contact.contact?.contact_email ?? "No email",
      meta: `${contact.contact_position ?? "No position"} · ${contact.allow_access ? "Access allowed" : "Access disabled"}`,
    })),
    stores: stores.map((store) => ({
      id: store.store_id,
      title: store.store_name,
      subtitle: `Status ${store.store_status ?? 0}`,
      meta: "Active store",
    })),
    notes: notes.map((note) => ({
      id: note.note_uuid,
      title: note.note_type ?? "Note",
      subtitle: note.note_text?.slice(0, 180) ?? "Empty note",
      meta: formatDate(note.note_created_datetime),
    })),
  };

  // Validate output shape
  const outputParsed = adminCompanyDetailSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/companies] getAdminCompanyDetail output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
/**
 * Toggle company approved-to-hire status.
 * Admin action — requires admin.write capability.
 */
export async function toggleCompanyApproval(
  companyId: number,
  approved: boolean,
): Promise<{ success: boolean; error?: string }> {
  await requireCapability("admin.write");

  const parsed = getAdminCompanySchema.safeParse({ companyId });
  if (!parsed.success) {
    return { success: false, error: "Invalid company ID" };
  }

  const existing = await prisma.company.findUnique({
    where: { company_id: parsed.data.companyId },
    select: { company_id: true },
  });

  if (!existing) {
    return { success: false, error: "Company not found" };
  }

  await prisma.company.update({
    where: { company_id: parsed.data.companyId },
    data: { company_approved_to_hire: approved },
  });

  revalidatePath("/admin/companies");
  revalidatePath(`/admin/companies/${parsed.data.companyId}`);

  const response = { success: true };

  // Validate output shape
  const outputParsed = adminCompanyToggleResponseSchema.safeParse(response);
  if (!outputParsed.success) {
    console.error(
      "[admin/companies] toggleCompanyApproval output validation failed:",
      outputParsed.error.issues,
    );
  }

  return response;
}
