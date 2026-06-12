"use server";

// ---------------------------------------------------------------------------
// Staff workspace — server actions
// Mirrors the legacy getStaffWorkspace() from @/modules/workspace/data.
// Used by the staff workspace page and StaffHome component.
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { formatDate, formatMoney } from "@/modules/workspace/format";
import {
  getCompanyWorkspaceSchema,
  staffWorkspaceOutputSchema,
  workspaceOverviewOutputSchema,
  companyHomeOutputSchema,
} from "./schemas";
import type { StaffWorkspaceData, CompanyWorkspaceData, CompanyHomeData } from "./schemas";

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

  return staffWorkspaceOutputSchema.parse({
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
  });
}

// ---------------------------------------------------------------------------
// Company workspace — server actions
// Mirrors the legacy getCompanyWorkspace() from @/modules/workspace/data.
// Used by the company workspace page and CompanyHome component.
// ---------------------------------------------------------------------------

// getCompanyWorkspaceSchema is used internally and re-exported from schemas.ts
// (cannot re-export from a "use server" file in Next.js 15)

/**
 * Fetch the company workspace dashboard data for a given contact UUID.
 * Returns contact info, aggregate metrics, linked companies, and recent requests.
 */
export async function getCompanyWorkspace(
  contactUuid: string,
): Promise<CompanyWorkspaceData> {
  await requireCapability("company.read");

  const parsed = getCompanyWorkspaceSchema.safeParse({ contactUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid contact UUID");
  }

  const contact = await prisma.contact.findUnique({
    where: { contact_uuid: contactUuid },
    select: { contact_name: true, contact_email: true },
  });

  const companyLinks = await prisma.company_contact.findMany({
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

  const companyIds = companyLinks
    .map((link) => link.company?.company_id)
    .filter((id): id is number => Boolean(id));

  const [requests, stores, notes, recentRequests] = await prisma.$transaction([
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

  return workspaceOverviewOutputSchema.parse({
    contact: contact ? { contact_name: contact.contact_name, contact_email: contact.contact_email ?? "" } : null,
    metrics: [
      { label: "Companies", value: companyIds.length, note: "Companies linked to this contact" },
      { label: "Requests", value: requests, note: "Hiring requests across linked companies" },
      { label: "Stores", value: stores, note: "Active stores in the account" },
      { label: "Notes", value: notes, note: "Internal/customer notes connected to account" },
    ],
    companies: companyLinks.map((link) => ({
      id: link.company_contact_uuid,
      title: link.company?.company_name ?? "Unknown company",
      subtitle: link.contact_position ?? "Contact",
      meta: link.allow_access ? "Access allowed" : "Access disabled",
    })),
    requests: recentRequests.map((request) => ({
      id: request.request_uuid,
      title: request.request_position_title ?? "Untitled request",
      subtitle: request.company?.company_name ?? "No company",
      meta: `${request.request_status ?? "No status"} · ${request.request_number_of_employees ?? 0} seats`,
    })),
  });
}

// ---------------------------------------------------------------------------
// CompanyHome — extended dashboard data
// Extends getCompanyWorkspace with active requests, positions, and activity.
// ---------------------------------------------------------------------------

type NonTerminalStatus = "pending" | "started" | "re_work";

const nonTerminalStatuses: NonTerminalStatus[] = ["pending", "started", "re_work"];

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

  const base = await getCompanyWorkspace(contactUuid);

  const companyLinks = await prisma.company_contact.findMany({
    where: { contact_uuid: contactUuid },
    select: {
      company: { select: { company_id: true } },
    },
  });

  const companyIds = companyLinks
    .map((link) => link.company?.company_id)
    .filter((id): id is number => Boolean(id));

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

  return companyHomeOutputSchema.parse({
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
  });
}
