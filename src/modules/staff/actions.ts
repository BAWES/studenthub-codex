"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

import {
  staffListItemSchema,
  listStaffResultSchema,
  getStaffWorkspaceSchema,
  staffWorkspaceOutputSchema,
} from "./schemas";
import type { StaffListItem, StaffListResult, StaffWorkspaceData } from "./schemas";
import { formatDate, formatMoney } from "@/modules/workspace/format";

function logOutputError(source: string, error: unknown): void {
  console.error(`[modules/staff] ${source} output validation failed:`, error);
}

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listStaffSchema = z.object({
  role: z.boolean().optional(),
  jobTitle: z.string().optional(),
  status: z.number().int().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export type ListStaffParams = z.input<typeof listStaffSchema>;

const getStaffSchema = z.object({
  id: z.number().int().positive(),
});

export type GetStaffParams = z.input<typeof getStaffSchema>;

// ---------------------------------------------------------------------------
// Filter builder
// ---------------------------------------------------------------------------

type StaffWhereInput = {
  deleted: number;
  staff_role?: boolean;
  staff_job_title?: { contains: string; mode?: "insensitive" };
  staff_status?: number;
};

function buildStaffFilter(params: {
  role?: boolean;
  jobTitle?: string;
  status?: number;
}): StaffWhereInput {
  const where: StaffWhereInput = { deleted: 0 };

  if (params.role !== undefined) {
    where.staff_role = params.role;
  }

  if (params.jobTitle && params.jobTitle.trim()) {
    where.staff_job_title = { contains: params.jobTitle, mode: "insensitive" };
  }

  if (params.status !== undefined) {
    where.staff_status = params.status;
  }

  return where;
}

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List staff members with optional filters (role, jobTitle, status) and
 * pagination. Excludes soft-deleted staff (deleted=0).
 * Mirrors the legacy Yii2 admin StaffController::actionList().
 *
 * @param params - Optional filter and pagination parameters
 * @returns Paginated staff list with total count
 */
export async function listStaff(
  params: ListStaffParams = {},
): Promise<StaffListResult> {
  await requireCapability("staff.read");

  const parsed = listStaffSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { role, jobTitle, status, page = 1, limit = 20 } = parsed.data;

  const where = buildStaffFilter({ role, jobTitle, status });

  const [staff, total] = await Promise.all([
    prisma.staff.findMany({
      where: where as any,
      orderBy: [{ staff_status: "desc" }, { staff_name: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        staff_id: true,
        staff_name: true,
        staff_job_title: true,
        staff_email: true,
        staff_role: true,
        staff_status: true,
        staff_created_at: true,
      },
    }),
    prisma.staff.count({ where: where as any }),
  ]);

  const result: StaffListResult = {
    staff: staff as StaffListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listStaffResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listStaff", outputParsed.error.issues);
  }

  return result;
}

/**
 * Get a single staff member by ID. Returns null if not found or soft-deleted.
 * Mirrors the legacy Yii2 StaffController::actionView($id).
 *
 * @param params - Object with `id` (positive integer)
 * @returns The staff record, or null if not found
 */
export async function getStaff(params: GetStaffParams): Promise<StaffListItem | null> {
  await requireCapability("staff.read");

  const parsed = getStaffSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid staff ID");
  }

  const { id } = parsed.data;

  const staff = await prisma.staff.findFirst({
    where: {
      staff_id: id,
      deleted: 0,
    },
    select: {
      staff_id: true,
      staff_name: true,
      staff_job_title: true,
      staff_email: true,
      staff_role: true,
      staff_status: true,
      staff_created_at: true,
    },
  });

  const outputParsed = staffListItemSchema.safeParse(staff);
  if (staff !== null && !outputParsed.success) {
    logOutputError("getStaff", outputParsed.error.issues);
  }

  return staff;
}

// ---------------------------------------------------------------------------
// Staff workspace
// ---------------------------------------------------------------------------

/**
 * Fetch the staff workspace dashboard data for a given staff account.
 * Returns staff info, aggregate metrics, recent requests, and recent stories.
 */
export async function getStaffWorkspace(
  staffId: number,
): Promise<StaffWorkspaceData> {
  await requireCapability("request.read.assigned");

  const parsed = getStaffWorkspaceSchema.safeParse({ staffId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid staff ID");
  }

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
