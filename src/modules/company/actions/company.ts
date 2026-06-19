"use server";

import { z } from "zod";
import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability, requireRoleCapability } from "@/modules/auth/session";
import {
  adminCompanyItemSchema,
  adminListCompaniesResultSchema,
  adminCompanyDetailResultSchema,
  companyActionResultSchema,
  type AdminListCompaniesResult,
  type AdminCompanyDetailResult,
} from "../schemas";

import { formatDate, formatMoney } from "@/modules/workspace/format";
import {
  getCompanyWorkspaceSchema,
  staffWorkspaceOutputSchema,
  workspaceOverviewOutputSchema,
  companyHomeOutputSchema,
} from "../schemas";
import type { StaffWorkspaceData, CompanyWorkspaceData, CompanyHomeData } from "../schemas";
import {
  listCompanyContactsSchema,
  getCompanyContactSchema,
  createCompanyContactSchema,
  updateCompanyContactSchema,
  listCompanyContactsRowsSchema,
  listCompanyContactsResultSchema,
  companyContactDetailSchema,
  companyContactUuidResultSchema,
  companyContactRowSchema,
} from "../schemas";
import type {
  ListCompanyContactsInput,
  CreateCompanyContactInput,
  UpdateCompanyContactInput,
  CompanyContactListItem,
  CompanyContactDetail,
  ListCompanyContactsResult,
  CompanyContactRow,
} from "../schemas";
import {
  listCompanyNotesSchema,
  getCompanyNoteSchema,
  createCompanyNoteSchema,
  updateCompanyNoteSchema,
  deleteCompanyNoteSchema,
  getNoteEntrySchema,
  updateNoteEntrySchema,
  deleteNoteEntrySchema,
  companyNoteListItemSchema,
  listCompanyNotesResultSchema,
  companyNoteDetailSchema,
  companyNoteActionResultSchema,
} from "../schemas";
import type {
  ListCompanyNotesInput,
  CreateCompanyNoteInput,
  UpdateCompanyNoteInput,
  CompanyNoteListItem,
  CompanyNoteDetail,
  ListCompanyNotesResult,
  GetNoteEntryInput,
  UpdateNoteEntryInput,
  DeleteNoteEntryInput,
  NoteEntryResponse,
} from "../schemas";
import type { NoteItem } from "@/modules/admin/note/schemas";

function logOutputError(source: string, error: unknown): void {
  console.error(`[modules/company] ${source} output validation failed:`, error);
}
export type { NoteItem };
import { getRequestDetail as _getRequestDetail } from "@/modules/workspace/request-detail-core";
import {
  findContactByUuid,
  getCompanyLinksForWorkspace,
  getWorkspaceStatsTx,
} from "@/modules/company/workspace/actions";

import {
  listStoresSchema,
  getStoreSchema,
  listStoresRowsSchema,
  listMallsAndBrandsSchema,
  listCompanySelectOptionsSchema,
  listStoresResultOutputSchema,
  storeDetailOutputSchema,
  storeRowOutputSchema,
  mallsAndBrandsResultOutputSchema,
  companySelectOptionOutputSchema,
  companyRequestRowOutputSchema,
} from "../schemas";
import type {
  ListStoresInput,
  StoreListItem,
  StoreDetail,
  ListStoresResult,
  StoreRow,
  MallsAndBrandsResult,
  CompanySelectOption,
} from "../schemas";
import {
  listCompanyRequestsSchema,
  getCompanyRequestDetailSchema,
  createCompanyRequestSchema,
  updateRequestStatusSchema,
  deleteRequestSchema,
  getCompanyListSchema,
  companyRequestActionResultSchema,
  companyRequestListItemSchema,
  listCompanyRequestsResultSchema,
  companyRequestDetailSchema,
  companyRequestCreateResultSchema,
} from "../schemas";
import type {
  ListCompanyRequestsInput,
  CreateCompanyRequestInput,
  UpdateRequestStatusInput,
  DeleteRequestInput,
  GetCompanyListInput,
  CompanyRequestListItem,
  CompanyRequestDetail,
  ListCompanyRequestsResult,
  CompanyRequestActionResult,
  RequestCompanyListItem,
} from "../schemas";

// ---------------------------------------------------------------------------
// Company list/get — admin-level server actions
// Mirrors Yii2 admin CompanyController::actionList and actionView.
// ---------------------------------------------------------------------------

const listCompaniesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  nameFilter: z.string().max(255).optional(),
  status: z.coerce.number().int().min(0).max(3).optional(),
  currencyCode: z.string().length(3).optional(),
});

export type ListCompaniesInput = z.input<typeof listCompaniesSchema>;

const getCompanySchema = z.object({
  companyId: z.coerce.number().int().positive(),
});

export type GetCompanyInput = z.input<typeof getCompanySchema>;

/**
 * List companies with optional name filter and pagination.
 * Mirrors admin CompanyController::actionList.
 * Requires company.read.any capability.
 */
export async function listCompanies(
  params: ListCompaniesInput = {},
): Promise<AdminListCompaniesResult> {
  await requireCapability("company.read.any");

  const parsed = listCompaniesSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { nameFilter, status, currencyCode, page = 1, limit = 20 } = parsed.data;

  const where: Record<string, unknown> = {
    deleted: 0,
  };

  if (nameFilter && nameFilter.trim()) {
    where.OR = [
      { company_name: { contains: nameFilter, mode: "insensitive" } },
      { company_common_name_en: { contains: nameFilter, mode: "insensitive" } },
    ];
  }

  if (currencyCode) {
    where.currency_code = currencyCode;
  }

  if (status === 1) {
    // Active: not deleted, not status_override=false
    where.company_status_override = false;
  } else if (status === 2) {
    // Inactive: status_override=true
    where.company_status_override = true;
  }

  const [rawCompanies, total] = await Promise.all([
    prisma.company.findMany({
      where: where as any,
      orderBy: [{ company_name: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.company.count({ where: where as any }),
  ]);

  const companies = rawCompanies.map((c) => ({
    company_id: c.company_id,
    company_name: c.company_name,
    company_common_name_en: c.company_common_name_en,
    company_common_name_ar: c.company_common_name_ar,
    company_email: c.company_email,
    company_website: c.company_website,
    company_logo: c.company_logo,
    commercial_licence: c.commercial_licence,
    company_hourly_rate: c.company_hourly_rate ? Number(c.company_hourly_rate) : null,
    company_bonus_commission: c.company_bonus_commission ? Number(c.company_bonus_commission) : null,
    company_approved_to_hire: c.company_approved_to_hire ?? false,
    company_status_override: c.company_status_override ?? false,
    company_followup: c.company_followup,
    total_candidate: c.total_candidate,
    no_of_active_requests: c.no_of_active_requests,
    country_id: c.country_id,
    currency_code: c.currency_code,
    parent_company_id: c.parent_company_id,
    staff_id: c.staff_id,
    company_created_at: c.company_created_at,
    company_updated_at: c.company_updated_at,
  }));

  const result = {
    companies,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = adminListCompaniesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listCompanies", outputParsed.error.issues);
  }

  return result;
}

/**
 * Get a single company by ID. Returns null if not found.
 * Mirrors admin CompanyController::actionView.
 * Requires company.read.any capability.
 */
export async function getCompany(params: GetCompanyInput): Promise<AdminCompanyDetailResult> {
  await requireCapability("company.read.any");

  const parsed = getCompanySchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid company ID");
  }

  const { companyId } = parsed.data;

  const c = await prisma.company.findUnique({
    where: { company_id: companyId },
  });

  if (!c) return null;

  const result = {
    company_id: c.company_id,
    company_name: c.company_name,
    company_common_name_en: c.company_common_name_en,
    company_common_name_ar: c.company_common_name_ar,
    company_email: c.company_email,
    company_website: c.company_website,
    company_logo: c.company_logo,
    commercial_licence: c.commercial_licence,
    company_hourly_rate: c.company_hourly_rate ? Number(c.company_hourly_rate) : null,
    company_bonus_commission: c.company_bonus_commission ? Number(c.company_bonus_commission) : null,
    company_approved_to_hire: c.company_approved_to_hire ?? false,
    company_status_override: c.company_status_override ?? false,
    company_followup: c.company_followup,
    total_candidate: c.total_candidate,
    no_of_active_requests: c.no_of_active_requests,
    country_id: c.country_id,
    currency_code: c.currency_code,
    parent_company_id: c.parent_company_id,
    staff_id: c.staff_id,
    company_created_at: c.company_created_at,
    company_updated_at: c.company_updated_at,
  };

  const outputParsed = adminCompanyDetailResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("getCompany", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Staff workspace — server action
// Mirrors the legacy getStaffWorkspace() from @/modules/workspace/data.
// Used by the staff workspace page and StaffHome component.
// ---------------------------------------------------------------------------

type NonTerminalStatus = "pending" | "started" | "re_work";

const nonTerminalStatuses: NonTerminalStatus[] = ["pending", "started", "re_work"];

/**
 * Fetch the staff workspace dashboard data for a given staff account.
 * Returns staff info, aggregate metrics, recent requests, and recent stories.
 */
export async function getStaffWorkspace(
  staffId: number,
): Promise<StaffWorkspaceData> {
  await requireCapability("request.read.assigned");

  const rows = await prisma.candidate_work_history.findMany({
    where: { staff_id: staffId, candidate_id: { not: null } },
    distinct: ["candidate_id"],
    orderBy: { end_date: "desc" },
    take: 500,
    select: { candidate_id: true },
  });
  const ids = rows.map((row) => row.candidate_id).filter((id): id is number => Boolean(id));

  const [staff, productionCandidates, productionCompanies, assignedRequests, workHistories, stories, notes, recentRequests, recentStories] =
    await prisma.$transaction([
      prisma.staff.findUnique({
        where: { staff_id: staffId },
        select: {
          staff_name: true,
          staff_email: true,
          staff_job_title: true,
          staff_salary: true,
          staff_salary_currency: true,
        },
      }),
      prisma.candidate.count({ where: { deleted: 0, candidate_id: { in: ids.length ? ids : [-1] } } }),
      prisma.company.count({ where: { deleted: 0 } }),
      prisma.request.count({ where: { staff_id: staffId } }),
      prisma.candidate_work_history.count({ where: { staff_id: staffId } }),
      prisma.story.count({ where: { staff_id: staffId } }),
      prisma.note.count({ where: { created_by: staffId } }),
      prisma.request.findMany({
        where: { staff_id: staffId },
        orderBy: { request_created_datetime: "desc" },
        take: 6,
        select: {
          request_uuid: true,
          request_position_title: true,
          request_status: true,
          request_created_datetime: true,
          company: { select: { company_name: true } },
        },
      }),
      prisma.story.findMany({
        where: { staff_id: staffId },
        orderBy: { story_last_updated_at: "desc" },
        take: 6,
        select: {
          story_uuid: true,
          story_status: true,
          story_last_updated_at: true,
          request: { select: { request_position_title: true } },
        },
      }),
    ]);

  const result: StaffWorkspaceData = {
    staff: staff
      ? {
          ...staff,
          staff_salary: staff.staff_salary ? Number(staff.staff_salary) : null,
        }
      : null,
    metrics: [
      { label: "Candidates", value: productionCandidates, note: `${workHistories} assigned to this staff account` },
      { label: "Companies", value: productionCompanies, note: "Employer records in the prod clone" },
      { label: "Assigned Requests", value: assignedRequests, note: "Requests owned by this staff member" },
      { label: "Stories", value: stories, note: `${notes} staff notes · ${formatMoney(staff?.staff_salary, staff?.staff_salary_currency ?? "KWD")}` },
    ],
    requests: recentRequests.map((request) => ({
      id: request.request_uuid,
      title: request.request_position_title ?? "Untitled request",
      subtitle: request.company?.company_name ?? "No company",
      meta: `${request.request_status ?? "No status"} · ${formatDate(request.request_created_datetime)}`,
    })),
    stories: recentStories.map((story) => ({
      id: story.story_uuid,
      title: story.request.request_position_title ?? "Story",
      subtitle: `Status ${story.story_status}`,
      meta: formatDate(story.story_last_updated_at),
    })),
  };

  // Validate output shape
  const validated = staffWorkspaceOutputSchema.safeParse(result);
  if (!validated.success) {
    logOutputError("getStaffWorkspace", validated.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// CompanyHome — extended dashboard data
// Provides active requests, positions, and activity for the company dashboard.
// ---------------------------------------------------------------------------

/**
 * Fetch extended CompanyHome dashboard data, including active requests,
 * open positions count, and recent activity.
 */
export async function getCompanyHomeData(
  contactUuid: string,
): Promise<CompanyHomeData> {
  await requireCapability("company.read");

  const parsed = getCompanyWorkspaceSchema.safeParse({ contactUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid contact UUID");
  }

  // Build base workspace data using module-level raw wrappers
  const contact = await findContactByUuid(contactUuid);
  const companyLinks = await getCompanyLinksForWorkspace(contactUuid);

  const companyIds = companyLinks
    .map((link) => link.company?.company_id)
    .filter((id): id is number => Boolean(id));

  const [requests, stores, notes, recentRequests] = companyIds.length > 0
    ? await getWorkspaceStatsTx(companyIds)
    : [0, 0, 0, []] as const;

  const base = {
    contact: contact
      ? { contact_name: contact.contact_name, contact_email: contact.contact_email ?? "" }
      : null,
    metrics: [
      { label: "Companies", value: companyIds.length, note: "Companies linked to this contact" },
      { label: "Requests", value: requests as number, note: "Hiring requests across linked companies" },
      { label: "Stores", value: stores as number, note: "Active stores in the account" },
      { label: "Notes", value: notes as number, note: "Internal/customer notes connected to account" },
    ],
    companies: companyLinks.map((link) => ({
      id: link.company_contact_uuid,
      title: link.company?.company_name ?? "Unknown company",
      subtitle: link.contact_position ?? "Contact",
      meta: link.allow_access ? "Access allowed" : "Access disabled",
    })),
    requests: (recentRequests as any[]).map((request: any) => ({
      id: request.request_uuid,
      title: request.request_position_title ?? "Untitled request",
      subtitle: request.company?.company_name ?? "No company",
      meta: `${request.request_status ?? "No status"} · ${request.request_number_of_employees ?? 0} seats`,
    })),
  };

  if (!companyIds.length) {
    return {
      ...base,
      activeRequestCount: 0,
      pendingRequestCount: 0,
      openPositionsCount: 0,
      activeRequests: [],
      recentActivity: [],
    };
  }

  const [activeRequests, recentActivity] = await prisma.$transaction([
    prisma.request.findMany({
      where: {
        company_id: { in: companyIds },
        request_status: { in: nonTerminalStatuses },
      },
      orderBy: { request_created_datetime: "desc" },
      take: 20,
      select: {
        request_uuid: true,
        request_position_title: true,
        request_status: true,
        request_number_of_employees: true,
        request_created_datetime: true,
        _count: { select: { request_application: true } },
      },
    }),
    prisma.request_activity.findMany({
      where: {
        request: { company_id: { in: companyIds } },
      },
      orderBy: { activity_created_datetime: "desc" },
      take: 30,
      select: {
        activity_uuid: true,
        activity_detail: true,
        activity_created_datetime: true,
        request_uuid: true,
      },
    }),
  ]);

  const activeRequestCount = activeRequests.length;
  const pendingRequestCount = activeRequests.filter(
    (r) => r.request_status === "pending",
  ).length;
  const openPositionsCount = activeRequests.reduce(
    (sum, r) => sum + (r.request_number_of_employees ?? 0),
    0,
  );

  const result: CompanyHomeData = {
    ...base,
    activeRequestCount,
    pendingRequestCount,
    openPositionsCount,
    activeRequests: activeRequests.map((r) => ({
      id: r.request_uuid,
      title: r.request_position_title ?? "Untitled request",
      status: r.request_status ?? "pending",
      candidatesCount: r._count.request_application,
      createdAt: r.request_created_datetime,
    })),
    recentActivity: recentActivity.map((a) => ({
      id: a.activity_uuid,
      type: "request_updated" as const,
      detail: a.activity_detail,
      timestamp: a.activity_created_datetime,
      relatedEntityId: a.request_uuid,
    })),
  };

  // Validate output shape
  const validated = companyHomeOutputSchema.safeParse(result);
  if (!validated.success) {
    logOutputError("getCompanyHomeData", validated.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Company Contacts — server actions
// ---------------------------------------------------------------------------

/**
 * List company contacts with optional company filter and pagination.
 * Mirrors the legacy CompanyContactController::actionList().
 */
export async function listCompanyContacts(
  params: ListCompanyContactsInput = {},
): Promise<ListCompanyContactsResult> {
  await requireCapability("company.read.linked");

  const parsed = listCompanyContactsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { company_id, page = 1, limit = 20 } = parsed.data;

  const where: Record<string, unknown> = {};
  if (company_id !== undefined) {
    where.company_id = company_id;
  }

  const [raw, total] = await Promise.all([
    prisma.company_contact.findMany({
      where: where as any,
      orderBy: { updated_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        company_contact_uuid: true,
        company_id: true,
        contact_position: true,
        allow_access: true,
        contact: {
          select: {
            contact_name: true,
            contact_email: true,
          },
        },
        company: {
          select: {
            company_name: true,
          },
        },
      },
    }),
    prisma.company_contact.count({ where: where as any }),
  ]);

  const contacts: CompanyContactListItem[] = raw.map((c) => ({
    company_contact_uuid: c.company_contact_uuid,
    company_id: c.company_id,
    contact_position: c.contact_position,
    allow_access: c.allow_access,
    contact_name: c.contact?.contact_name ?? null,
    contact_email: c.contact?.contact_email ?? null,
    company_name: c.company?.company_name ?? null,
  }));

  const contactResult = {
    contacts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listCompanyContactsResultSchema.safeParse(contactResult);
  if (!outputParsed.success) {
    logOutputError("listCompanyContacts", outputParsed.error.issues);
  }

  return contactResult;
}

/**
 * Get a single company contact by UUID.
 * Mirrors the legacy CompanyContactController::actionView().
 */
export async function getCompanyContact(
  uuid: string,
): Promise<CompanyContactDetail | null> {
  await requireCapability("company.read.linked");

  const parsed = getCompanyContactSchema.safeParse({ uuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid company contact UUID");
  }

  const raw = await prisma.company_contact.findUnique({
    where: { company_contact_uuid: parsed.data.uuid },
    include: {
      contact: {
        select: {
          contact_name: true,
          contact_email: true,
        },
      },
      company: {
        select: {
          company_name: true,
        },
      },
    },
  });

  if (!raw) return null;

  const result = {
    company_contact_uuid: raw.company_contact_uuid,
    contact_uuid: raw.contact_uuid,
    company_id: raw.company_id,
    contact_position: raw.contact_position,
    allow_access: raw.allow_access,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    contact_name: raw.contact?.contact_name ?? null,
    contact_email: raw.contact?.contact_email ?? null,
    company_name: raw.company?.company_name ?? null,
  };

  // Validate output shape
  const outputParsed = companyContactDetailSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("getCompanyContact", outputParsed.error.issues);
  }

  return result;
}

/**
 * Create a new company contact link.
 * If a contact with the given email doesn't exist, creates one first.
 * Mirrors the legacy CompanyContactController::actionCreate().
 */
export async function createCompanyContact(
  data: CreateCompanyContactInput,
): Promise<{ company_contact_uuid: string }> {
  await requireCapability("company.read.linked");

  const parsed = createCompanyContactSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid company contact data");
  }

  // Find or create the contact record
  let contactUuid: string;

  if (parsed.data.contact_email) {
    const existingContact = await prisma.contact.findUnique({
      where: { contact_email: parsed.data.contact_email },
      select: { contact_uuid: true },
    });

    if (existingContact) {
      contactUuid = existingContact.contact_uuid;
    } else {
      const newContact = await prisma.contact.create({
        data: {
          contact_uuid: crypto.randomUUID(),
          contact_name: parsed.data.contact_name,
          contact_email: parsed.data.contact_email,
          contact_created_at: new Date(),
          contact_updated_at: new Date(),
        },
      });
      contactUuid = newContact.contact_uuid;
    }
  } else {
    // No email provided, create a contact without an email
    const newContact = await prisma.contact.create({
      data: {
        contact_uuid: crypto.randomUUID(),
        contact_name: parsed.data.contact_name,
        contact_created_at: new Date(),
        contact_updated_at: new Date(),
      },
    });
    contactUuid = newContact.contact_uuid;
  }

  const companyContact = await prisma.company_contact.create({
    data: {
      company_contact_uuid: crypto.randomUUID(),
      company_id: parsed.data.company_id,
      contact_uuid: contactUuid,
      contact_position: parsed.data.contact_position ?? null,
      allow_access: parsed.data.allow_access ?? false,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  revalidatePath("/company/contacts");
  const result = { company_contact_uuid: companyContact.company_contact_uuid };

  // Validate output shape
  const outputParsed = companyContactUuidResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("createCompanyContact", outputParsed.error.issues);
  }

  return result;
}

/**
 * Update an existing company contact's position or access settings.
 */
export async function updateCompanyContact(
  data: UpdateCompanyContactInput,
): Promise<{ company_contact_uuid: string }> {
  await requireCapability("company.read.linked");

  const parsed = updateCompanyContactSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid company contact data");
  }

  const updateData: Record<string, unknown> = { updated_at: new Date() };
  if (parsed.data.contact_position !== undefined) {
    updateData.contact_position = parsed.data.contact_position;
  }
  if (parsed.data.allow_access !== undefined) {
    updateData.allow_access = parsed.data.allow_access;
  }

  await prisma.company_contact.update({
    where: { company_contact_uuid: parsed.data.uuid },
    data: updateData as any,
  });

  revalidatePath("/company/contacts");
  const result = { company_contact_uuid: parsed.data.uuid };

  // Validate output shape
  const outputParsed = companyContactUuidResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("updateCompanyContact", outputParsed.error.issues);
  }

  return result;
}

/**
 * List company contacts as flat DataTable rows for the company/contacts page.
 * Mirrors getCompanyContactsRows from @/modules/company/data.
 */
export async function listCompanyContactsRows(
  contactUuid: string,
): Promise<CompanyContactRow[]> {
  await requireCapability("company.read.linked");

  const parsed = listCompanyContactsRowsSchema.safeParse({ contactUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid contact UUID");
  }

  // Get companies linked to this contact
  const linked = await prisma.company_contact.findMany({
    where: { contact_uuid: contactUuid, allow_access: true },
    select: { company_id: true },
  });

  const companyIds = linked
    .filter((l) => l.company_id !== null)
    .map((l) => l.company_id as number);

  if (companyIds.length === 0) return [];

  const contacts = await prisma.company_contact.findMany({
    where: { company_id: { in: companyIds } },
    select: {
      company_contact_uuid: true,
      contact_position: true,
      allow_access: true,
      contact: { select: { contact_name: true, contact_email: true } },
      company: { select: { company_name: true } },
    },
    orderBy: { updated_at: "desc" },
  });

  const result = contacts.map((c) => ({
    id: c.company_contact_uuid,
    name: c.contact?.contact_name ?? "—",
    email: c.contact?.contact_email ?? "—",
    position: c.contact_position ?? "—",
    companyName: c.company?.company_name ?? "—",
    allowAccess: c.allow_access ?? false,
  }));

  // Validate output shape
  const outputParsed = z.array(companyContactRowSchema).safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listCompanyContactsRows", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Company Notes — server actions
// ---------------------------------------------------------------------------

/**
 * List notes for a company with pagination.
 */
export async function listCompanyNotes(
  params: ListCompanyNotesInput = {},
): Promise<ListCompanyNotesResult> {
  await requireCapability("company.read.linked");

  const parsed = listCompanyNotesSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { company_id, page = 1, limit = 20 } = parsed.data;

  const where: Record<string, unknown> = {};
  if (company_id !== undefined) {
    where.company_id = company_id;
  }

  const [raw, total] = await Promise.all([
    prisma.note.findMany({
      where: where as any,
      orderBy: { note_created_datetime: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        note_uuid: true,
        note_text: true,
        note_type: true,
        company_id: true,
        created_by: true,
        note_created_datetime: true,
        note_updated_datetime: true,
        company: {
          select: { company_name: true },
        },
      },
    }),
    prisma.note.count({ where: where as any }),
  ]);

  const notes: CompanyNoteListItem[] = raw.map((n) => ({
    note_uuid: n.note_uuid,
    note_text: n.note_text,
    note_type: n.note_type,
    company_id: n.company_id,
    created_by: n.created_by,
    created_at: n.note_created_datetime?.toISOString() ?? null,
    updated_at: n.note_updated_datetime?.toISOString() ?? null,
    company_name: n.company?.company_name ?? null,
  }));

  const result = {
    notes,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
  const outputParsed = listCompanyNotesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listCompanyNotes", outputParsed.error.issues);
  }
  return result;
}

/**
 * Get a single company note by UUID.
 */
export async function getCompanyNote(
  noteUuid: string,
): Promise<CompanyNoteDetail | null> {
  await requireCapability("company.read.linked");

  const parsed = getCompanyNoteSchema.safeParse({ noteUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid note UUID");
  }

  const raw = await prisma.note.findUnique({
    where: { note_uuid: parsed.data.noteUuid },
    select: {
      note_uuid: true,
      company_id: true,
      note_text: true,
      note_type: true,
      created_by: true,
      updated_by: true,
      note_created_datetime: true,
      note_updated_datetime: true,
      company: {
        select: { company_name: true },
      },
    },
  });

  if (!raw) return null;

  const result = {
    note_uuid: raw.note_uuid,
    company_id: raw.company_id,
    note_text: raw.note_text,
    note_type: raw.note_type,
    created_by: raw.created_by,
    updated_by: raw.updated_by,
    created_at: raw.note_created_datetime?.toISOString() ?? null,
    updated_at: raw.note_updated_datetime?.toISOString() ?? null,
    company_name: raw.company?.company_name ?? null,
  };
  const outputParsed = companyNoteDetailSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("getCompanyNote output validation failed:", outputParsed.error);
  }
  return result;
}

/**
 * Create a new note for a company.
 */
export async function createCompanyNote(
  data: CreateCompanyNoteInput,
): Promise<{ note_uuid: string }> {
  await requireCapability("company.read.linked");

  const parsed = createCompanyNoteSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid note data");
  }

  const note = await prisma.note.create({
    data: {
      note_uuid: crypto.randomUUID(),
      company_id: parsed.data.company_id,
      note_text: parsed.data.note_text,
      note_type: parsed.data.note_type ?? "Internal Note",
      created_by: parsed.data.created_by ?? null,
      note_created_datetime: new Date(),
      note_updated_datetime: new Date(),
    },
  });

  revalidatePath(`/company/notes`);
  const result = { note_uuid: note.note_uuid };
  const outputParsed = companyNoteActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("createCompanyNote output validation failed:", outputParsed.error);
  }
  return result;
}

/**
 * Update an existing company note.
 */
export async function updateCompanyNote(
  data: UpdateCompanyNoteInput,
): Promise<{ note_uuid: string }> {
  await requireCapability("company.read.linked");

  const parsed = updateCompanyNoteSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid note data");
  }

  const updateData: Record<string, unknown> = {
    note_updated_datetime: new Date(),
    updated_by: parsed.data.updated_by ?? null,
  };
  if (parsed.data.note_text !== undefined) {
    updateData.note_text = parsed.data.note_text;
  }
  if (parsed.data.note_type !== undefined) {
    updateData.note_type = parsed.data.note_type;
  }

  await prisma.note.update({
    where: { note_uuid: parsed.data.noteUuid },
    data: updateData as any,
  });

  revalidatePath(`/company/notes`);
  const result = { note_uuid: parsed.data.noteUuid };
  const parsed2 = companyNoteActionResultSchema.safeParse(result);
  if (!parsed2.success) {
    console.error("updateCompanyNote output validation failed:", parsed2.error);
  }
  return result;
}

/**
 * Soft-delete a company note (set null out company_id reference).
 */
export async function deleteCompanyNote(
  noteUuid: string,
): Promise<{ success: boolean }> {
  await requireCapability("company.read.linked");

  const parsed = deleteCompanyNoteSchema.safeParse({ noteUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid note UUID");
  }

  // Soft-delete by removing the company association
  await prisma.note.update({
    where: { note_uuid: parsed.data.noteUuid },
    data: {
      company_id: null,
      note_updated_datetime: new Date(),
    },
  });

  revalidatePath(`/company/notes`);
  const result = { success: true };
  const outputParsed = companyNoteActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("deleteCompanyNote output validation failed:", outputParsed.error);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Company Notes — [id] sub-page server actions
// ---------------------------------------------------------------------------

// NOTE: staff_note_created_byTostaff / staff_note_updated_byTostaff relations
// were removed from the Prisma schema. staff_created/staff_updated are set to null
// until those relations are restored.
const noteSelect = {
  note_uuid: true,
  company_id: true,
  request_uuid: true,
  story_uuid: true,
  note_type: true,
  note_text: true,
  created_by: true,
  updated_by: true,
  note_created_datetime: true,
  note_updated_datetime: true,
} as const;

function mapNote(note: any): NoteItem {
  return {
    note_uuid: note.note_uuid,
    company_id: note.company_id,
    request_uuid: note.request_uuid,
    story_uuid: note.story_uuid,
    note_type: note.note_type,
    note_text: note.note_text,
    created_by: note.created_by,
    updated_by: note.updated_by,
    note_created_datetime: note.note_created_datetime,
    note_updated_datetime: note.note_updated_datetime,
    staff_created: null,
    staff_updated: null,
  };
}

/**
 * Get a single note by UUID with full detail (staff created/updated info).
 * Requires company.read.linked capability.
 */
export async function getNoteEntry(
  noteUuid: string,
): Promise<NoteItem | null> {
  await requireCapability("company.read.linked");

  const parsed = getNoteEntrySchema.safeParse({ noteUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid note entry params");
  }

  const note = await prisma.note.findFirst({
    where: { note_uuid: parsed.data.noteUuid },
    select: noteSelect,
  });

  if (!note) return null;

  return mapNote(note);
}

/**
 * Update an existing note's text content and company association.
 */
export async function updateNoteEntry(
  noteUuid: string,
  noteText: string,
  companyId: number,
): Promise<NoteEntryResponse> {
  await requireCapability("company.write.linked");

  const parsed = updateNoteEntrySchema.safeParse({ noteUuid, noteText, companyId });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  // Verify the note exists
  const existing = await prisma.note.findFirst({
    where: { note_uuid: parsed.data.noteUuid },
    select: { note_uuid: true },
  });

  if (!existing) {
    return { success: false, error: "Note not found" };
  }

  await prisma.note.update({
    where: { note_uuid: parsed.data.noteUuid },
    data: {
      note_text: parsed.data.noteText,
      company_id: parsed.data.companyId,
      note_updated_datetime: new Date(),
    },
  });

  revalidatePath(`/company/notes/${parsed.data.noteUuid}`);
  revalidatePath("/company/notes");

  return { success: true };
}

/**
 * Delete a note by UUID.
 */
export async function deleteNoteEntry(
  noteUuid: string,
): Promise<NoteEntryResponse> {
  await requireCapability("company.write.linked");

  const parsed = deleteNoteEntrySchema.safeParse({ noteUuid });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  // Verify the note exists before deleting
  const existing = await prisma.note.findFirst({
    where: { note_uuid: parsed.data.noteUuid },
    select: { note_uuid: true },
  });

  if (!existing) {
    return { success: false, error: "Note not found" };
  }

  await prisma.note.delete({
    where: { note_uuid: parsed.data.noteUuid },
  });

  revalidatePath("/company/notes");

  return { success: true };
}

// ---------------------------------------------------------------------------
// Company Workspace — cache helpers
// ---------------------------------------------------------------------------

/**
 * Revalidate the company workspace page cache.
 * Called after mutations that affect workspace data.
 */
export async function revalidateWorkspace() {
  revalidatePath("/company/workspace", "page");
}

// ---------------------------------------------------------------------------
// Company Stores — server actions
// ---------------------------------------------------------------------------

function mapStoreStatus(status: number): "active" | "inactive" {
  return status === 10 ? "active" : "inactive";
}

/**
 * List stores with optional company filter, store_status filter, and pagination.
 */
export async function listStores(
  params: ListStoresInput = {},
): Promise<ListStoresResult> {
  await requireCapability("company.read.linked");

  const parsed = listStoresSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { company_id, store_status, page = 1, limit = 20 } = parsed.data;

  const where: Record<string, unknown> = {};
  if (company_id !== undefined) {
    where.company_id = company_id;
  }
  if (store_status !== undefined) {
    where.store_status = store_status;
  }

  const [raw, total] = await Promise.all([
    prisma.store.findMany({
      where: where as any,
      orderBy: { store_updated_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        store_id: true,
        store_name: true,
        store_location: true,
        store_status: true,
        mall: {
          select: {
            mall_name_en: true,
          },
        },
        brand: {
          select: {
            brand_name_en: true,
          },
        },
        contact: {
          select: {
            contact_name: true,
          },
        },
      },
    }),
    prisma.store.count({ where: where as any }),
  ]);

  const stores: StoreListItem[] = raw.map((s) => ({
    store_id: s.store_id,
    store_name: s.store_name,
    store_location: s.store_location,
    store_status: mapStoreStatus(s.store_status),
    mall_name: s.mall?.mall_name_en ?? null,
    brand_name: s.brand?.brand_name_en ?? null,
    manager_name: s.contact?.contact_name ?? null,
  }));

  const result = {
    stores,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listStoresResultOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listStores", outputParsed.error.issues);
  }

  return result;
}

/**
 * Get a single store's details by store_id.
 */
export async function getStoreDetail(
  storeId: number,
): Promise<StoreDetail | null> {
  await requireCapability("company.read.linked");

  const parsed = getStoreSchema.safeParse({ store_id: storeId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid store ID");
  }

  const raw = await prisma.store.findUnique({
    where: { store_id: parsed.data.store_id },
    select: {
      store_id: true,
      store_name: true,
      store_location: true,
      store_status: true,
      company_id: true,
      store_created_at: true,
      store_updated_at: true,
      company: {
        select: {
          company_name: true,
        },
      },
      mall: {
        select: {
          mall_name_en: true,
        },
      },
      brand: {
        select: {
          brand_name_en: true,
        },
      },
      contact: {
        select: {
          contact_name: true,
          contact_email: true,
        },
      },
    },
  });

  if (!raw) return null;

  const result = {
    store_id: raw.store_id,
    store_name: raw.store_name,
    store_location: raw.store_location,
    store_status: mapStoreStatus(raw.store_status),
    company_id: raw.company_id,
    company_name: raw.company?.company_name ?? null,
    mall_name: raw.mall?.mall_name_en ?? null,
    brand_name: raw.brand?.brand_name_en ?? null,
    manager_name: raw.contact?.contact_name ?? null,
    manager_email: raw.contact?.contact_email ?? null,
    created_at: raw.store_created_at.toISOString(),
    updated_at: raw.store_updated_at.toISOString(),
  };

  // Validate output shape
  const outputParsed = storeDetailOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("getStoreDetail", outputParsed.error.issues);
  }

  return result;
}

/**
 * List stores as flat DataTable rows for the company/stores page.
 * Mirrors getCompanyStoresRows from @/modules/company/data.
 */
export async function listStoresRows(
  contactUuid: string,
): Promise<StoreRow[]> {
  await requireCapability("company.read.linked");

  const parsed = listStoresRowsSchema.safeParse({ contactUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid contact UUID");
  }

  // Get companies linked to this contact
  const linked = await prisma.company_contact.findMany({
    where: { contact_uuid: parsed.data.contactUuid, allow_access: true },
    select: { company_id: true },
  });

  const companyIds = linked
    .filter((l) => l.company_id !== null)
    .map((l) => l.company_id as number);

  if (companyIds.length === 0) return [];

  const stores = await prisma.store.findMany({
    where: { company_id: { in: companyIds }, deleted: 0 },
    select: {
      store_id: true,
      store_name: true,
      store_location: true,
      brand: { select: { brand_name_en: true } },
      mall: { select: { mall_name_en: true } },
      company: { select: { company_name: true } },
      contact: { select: { contact_name: true } },
    },
    orderBy: { store_updated_at: "desc" },
  });

  const result = stores.map((s) => ({
    id: s.store_id,
    name: s.store_name,
    location: s.store_location,
    mallName: s.mall?.mall_name_en ?? "—",
    brandName: s.brand?.brand_name_en ?? "—",
    companyName: s.company?.company_name ?? "—",
    managerName: s.contact?.contact_name ?? "—",
  }));

  // Validate output shape
  const outputParsed = z.array(storeRowOutputSchema).safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listStoresRows", outputParsed.error.issues);
  }

  return result;
}

/**
 * Fetch malls and brands for the AddStoreForm dropdowns.
 * Mirrors getCompanyMallsAndBrands from @/modules/company/data.
 */
export async function listMallsAndBrands(
  contactUuid: string,
): Promise<MallsAndBrandsResult> {
  await requireCapability("company.read.linked");

  const parsed = listMallsAndBrandsSchema.safeParse({ contactUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid contact UUID");
  }

  // Get companies linked to this contact
  const linked = await prisma.company_contact.findMany({
    where: { contact_uuid: parsed.data.contactUuid, allow_access: true },
    select: { company_id: true },
  });

  const companyIds = linked
    .filter((l) => l.company_id !== null)
    .map((l) => l.company_id as number);

  const [malls, brands] = await Promise.all([
    prisma.mall.findMany({
      select: { mall_uuid: true, mall_name_en: true },
      orderBy: { mall_name_en: "asc" },
    }),
    prisma.brand.findMany({
      where: companyIds.length > 0 ? { company_id: { in: companyIds } } : undefined,
      select: { brand_uuid: true, brand_name_en: true },
      orderBy: { brand_name_en: "asc" },
    }),
  ]);

  const result = {
    malls: malls.map((m) => ({ uuid: m.mall_uuid, name: m.mall_name_en })),
    brands: brands.map((b) => ({ uuid: b.brand_uuid, name: b.brand_name_en })),
  };

  // Validate output shape
  const outputParsed = mallsAndBrandsResultOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listMallsAndBrands", outputParsed.error.issues);
  }

  return result;
}

/**
 * List company select options for the AddStoreForm dropdown.
 * Mirrors getCompanySelectOptions from @/modules/company/data.
 */
export async function listCompanySelectOptions(
  contactUuid: string,
): Promise<CompanySelectOption[]> {
  await requireCapability("company.read.linked");

  const parsed = listCompanySelectOptionsSchema.safeParse({ contactUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid contact UUID");
  }

  const links = await prisma.company_contact.findMany({
    where: { contact_uuid: parsed.data.contactUuid, allow_access: true },
    select: { company_id: true, company: { select: { company_name: true } } },
  });

  const result = links
    .filter((l) => l.company_id !== null && l.company !== null)
    .map((l) => ({ id: l.company_id as number, name: l.company!.company_name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Validate output shape
  const outputParsed = z.array(companySelectOptionOutputSchema).safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listCompanySelectOptions", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Company Requests — server actions
// ---------------------------------------------------------------------------

/**
 * List company requests with optional company filter and pagination.
 * Mirrors the legacy RequestController::actionList().
 */
export async function listCompanyRequests(
  params: ListCompanyRequestsInput = {},
): Promise<ListCompanyRequestsResult> {
  await requireCapability("request.read.linked");

  const parsed = listCompanyRequestsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { company_id, page = 1, limit = 20 } = parsed.data;

  const where: Record<string, unknown> = {};
  if (company_id !== undefined) {
    where.company_id = company_id;
  }

  const [requests, total] = await Promise.all([
    prisma.request.findMany({
      where,
      select: {
        request_uuid: true,
        company_id: true,
        request_position_title: true,
        request_compensation: true,
        request_number_of_employees: true,
        request_location: true,
        request_status: true,
        request_created_datetime: true,
        request_updated_datetime: true,
        company: { select: { company_name: true } },
      },
      orderBy: { request_created_datetime: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.request.count({ where }),
  ]);

  const result = {
    requests: requests.map((r) => ({
      request_uuid: r.request_uuid,
      company_id: r.company_id,
      request_position_title: r.request_position_title,
      request_compensation: r.request_compensation,
      request_number_of_employees: r.request_number_of_employees,
      request_location: r.request_location,
      request_status: r.request_status,
      request_created_datetime: r.request_created_datetime,
      request_updated_datetime: r.request_updated_datetime,
      company_name: r.company?.company_name ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
  const outputParsed = listCompanyRequestsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("listCompanyRequests output validation failed:", outputParsed.error);
  }
  return result;
}

/**
 * Get a single company request by UUID.
 * Mirrors the legacy RequestController::actionDetail().
 */
export async function getCompanyRequestDetail(
  uuid: string,
): Promise<CompanyRequestDetail | null> {
  await requireCapability("request.read.linked");

  const parsed = getCompanyRequestDetailSchema.safeParse({ uuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid request UUID");
  }

  const request = await prisma.request.findUnique({
    where: { request_uuid: uuid },
    select: {
      request_uuid: true,
      company_id: true,
      contact_uuid: true,
      staff_id: true,
      request_position_title: true,
      request_job_description: true,
      request_compensation: true,
      request_number_of_employees: true,
      request_location: true,
      request_additional_info: true,
      request_status: true,
      request_feedback: true,
      request_created_datetime: true,
      request_updated_datetime: true,
      company: { select: { company_name: true } },
    },
  });

  if (!request) return null;

  const result = {
    request_uuid: request.request_uuid,
    company_id: request.company_id,
    contact_uuid: request.contact_uuid,
    staff_id: request.staff_id,
    request_position_title: request.request_position_title,
    request_job_description: request.request_job_description,
    request_compensation: request.request_compensation,
    request_number_of_employees: request.request_number_of_employees,
    request_location: request.request_location,
    request_additional_info: request.request_additional_info,
    request_status: request.request_status,
    request_feedback: request.request_feedback,
    request_created_datetime: request.request_created_datetime,
    request_updated_datetime: request.request_updated_datetime,
    company_name: request.company?.company_name ?? null,
  };
  const outputParsed = companyRequestDetailSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("getCompanyRequestDetail output validation failed:", outputParsed.error);
  }
  return result;
}

/**
 * Create a new company request.
 * Mirrors the legacy RequestController::actionCreate().
 */
export async function createCompanyRequest(
  data: CreateCompanyRequestInput,
): Promise<{ request_uuid: string }> {
  await requireCapability("request.create");

  const parsed = createCompanyRequestSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid request data");
  }

  const { company_id, position_title, compensation, number_of_employees, location } =
    parsed.data;

  const request = await prisma.request.create({
    data: {
      request_uuid: crypto.randomUUID(),
      company_id,
      request_position_title: position_title,
      request_compensation: compensation ?? "",
      request_number_of_employees: number_of_employees ?? null,
      request_location: location ?? null,
      request_job_description: "",
      request_status: "pending",
      request_created_datetime: new Date(),
      request_updated_datetime: new Date(),
    },
    select: { request_uuid: true },
  });

  revalidatePath("/company/requests");
  const result = { request_uuid: request.request_uuid };
  const outputParsed = companyRequestCreateResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("createCompanyRequest output validation failed:", outputParsed.error);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Row helpers for DataTable pages — replaces imports from @/modules/workspace/data
// ---------------------------------------------------------------------------

type CompanyRequestRow = {
  id: string;
  title: string;
  company: string;
  owner: string;
  seats: number;
  status: string;
  updated: string;
};

/**
 * List company request rows for the DataTable on the company/requests page.
 * Mirrors the legacy getCompanyRequestRows() from @/modules/workspace/data/company.ts.
 */
export async function getCompanyRequestRows(contactUuid: string): Promise<CompanyRequestRow[]> {
  await requireCapability("request.read.linked");

  const companyLinks = await prisma.company_contact.findMany({
    where: { contact_uuid: contactUuid, allow_access: true },
    select: { company_id: true },
  });
  const companyIds = companyLinks.map((l) => l.company_id).filter((id): id is number => Boolean(id));
  if (companyIds.length === 0) return [];

  const rows = await prisma.request.findMany({
    where: { company_id: { in: companyIds } },
    orderBy: { request_updated_datetime: "desc" },
    take: 80,
    select: {
      request_uuid: true,
      request_position_title: true,
      request_status: true,
      request_number_of_employees: true,
      request_updated_datetime: true,
      company: { select: { company_name: true } },
      staff: { select: { staff_name: true } },
    },
  });

  const result = rows.map((row) => ({
    id: row.request_uuid,
    title: row.request_position_title ?? "Untitled request",
    company: row.company?.company_name ?? "No company",
    owner: row.staff?.staff_name ?? "Unassigned",
    seats: row.request_number_of_employees ?? 0,
    status: row.request_status ?? "No status",
    updated: row.request_updated_datetime.toISOString().slice(0, 10).replace(/-/g, "/"),
  }));

  // Validate output shape
  const outputParsed = z.array(companyRequestRowOutputSchema).safeParse(result);
  if (!outputParsed.success) {
    logOutputError("getCompanyRequestRows", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Company Requests — [id] sub-page server actions
// ---------------------------------------------------------------------------

/**
 * Get full request detail including applications, interviews, invitations,
 * matched candidates, and pipeline metrics for the company role.
 *
 * Wraps the shared @/modules/workspace/request-detail-core getRequestDetail as a
 * route-level server action with company-role auth and scope checking.
 */
export async function getCompanyRequestDetailWithScope(
  uuid: string,
): Promise<Awaited<ReturnType<typeof _getRequestDetail>> | null> {
  const session = await requireRoleCapability("company", "request.read.linked");

  const parsed = getCompanyRequestDetailSchema.safeParse({ uuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid request UUID");
  }

  // Scope check: verify contact has access to this request's company
  const contactUuid = session.id;

  const companyLinks = await prisma.company_contact.findMany({
    where: { contact_uuid: contactUuid, allow_access: true },
    select: { company_id: true },
  });

  const accessibleCompanyIds = companyLinks
    .map((l) => l.company_id)
    .filter((id): id is number => id !== null);

  if (accessibleCompanyIds.length === 0) {
    return null;
  }

  const request = await prisma.request.findUnique({
    where: { request_uuid: parsed.data.uuid },
    select: { company_id: true },
  });

  if (!request || request.company_id === null || !accessibleCompanyIds.includes(request.company_id)) {
    return null;
  }

  return _getRequestDetail(parsed.data.uuid);
}

export type GetCompanyRequestDetailResult = Awaited<
  ReturnType<typeof getCompanyRequestDetailWithScope>
>;

/**
 * Update the status of a company request with optional feedback.
 */
export async function updateRequestStatus(
  params: UpdateRequestStatusInput,
): Promise<{ success: true } | { error: string }> {
  await requireRoleCapability("company", "request.write");

  const parsed = updateRequestStatusSchema.safeParse(params);
  if (!parsed.success) {
    const result = { error: parsed.error.issues[0]?.message ?? "Invalid input" };
    const outputParsed = companyRequestActionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[app/company/requests/[id]] updateRequestStatus output validation failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  }

  const { uuid, status, feedback } = parsed.data;

  const existing = await prisma.request.findUnique({
    where: { request_uuid: uuid },
    select: { request_uuid: true, request_status: true },
  });

  if (!existing) {
    const result = { error: "Request not found." };
    const outputParsed = companyRequestActionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[app/company/requests/[id]] updateRequestStatus output validation failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  }

  await prisma.request.update({
    where: { request_uuid: uuid },
    data: {
      request_status: status,
      ...(feedback !== undefined ? { request_feedback: feedback } : {}),
      request_updated_datetime: new Date(),
    },
  });

  revalidatePath(`/company/requests/${uuid}`);
  revalidatePath("/company/requests");

  const result = { success: true } as const;
  const outputParsed = companyRequestActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[app/company/requests/[id]] updateRequestStatus output validation failed:",
      outputParsed.error.issues,
    );
  }
  return result;
}

/**
 * Cancel (soft-delete) a company request by setting status to "cancelled".
 */
export async function deleteRequest(
  params: DeleteRequestInput,
): Promise<{ success: true } | { error: string }> {
  await requireRoleCapability("company", "request.write");

  const parsed = deleteRequestSchema.safeParse(params);
  if (!parsed.success) {
    const result = { error: parsed.error.issues[0]?.message ?? "Invalid input" };
    const outputParsed = companyRequestActionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[app/company/requests/[id]] deleteRequest output validation failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  }

  const { uuid } = parsed.data;

  const existing = await prisma.request.findUnique({
    where: { request_uuid: uuid },
    select: { request_uuid: true, request_status: true },
  });

  if (!existing) {
    const result = { error: "Request not found." };
    const outputParsed = companyRequestActionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[app/company/requests/[id]] deleteRequest output validation failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  }

  if (existing.request_status === "cancelled") {
    const result = { error: "Request is already cancelled." };
    const outputParsed = companyRequestActionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[app/company/requests/[id]] deleteRequest output validation failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  }

  await prisma.request.update({
    where: { request_uuid: uuid },
    data: {
      request_status: "cancelled",
      request_cancelled_at: new Date(),
      request_updated_datetime: new Date(),
    },
  });

  revalidatePath("/company/requests");

  const result = { success: true } as const;
  const outputParsed = companyRequestActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[app/company/requests/[id]] deleteRequest output validation failed:",
      outputParsed.error.issues,
    );
  }
  return result;
}

// ---------------------------------------------------------------------------
// Company Requests — Create sub-page server actions
// ---------------------------------------------------------------------------

/**
 * Get a list of companies accessible by the current contact for the
 * request creation form dropdown.
 */
export async function getCompanyList(
  contactUuid: string,
): Promise<RequestCompanyListItem[]> {
  await requireCapability("request.create");

  const parsed = getCompanyListSchema.safeParse({ contactUuid });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid contact UUID",
    );
  }

  const links = await prisma.company_contact.findMany({
    where: {
      contact_uuid: parsed.data.contactUuid,
      allow_access: true,
    },
    select: {
      company: {
        select: { company_id: true, company_name: true },
      },
    },
    take: 50,
  });

  return links
    .filter((link) => link.company)
    .map((link) => ({
      id: link.company!.company_id,
      name: link.company!.company_name,
    }));
}