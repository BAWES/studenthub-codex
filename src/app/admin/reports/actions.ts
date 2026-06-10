"use server";

// ---------------------------------------------------------------------------
// Admin Reports — server actions
// ---------------------------------------------------------------------------
// Provides the admin reports page data: listing report types, fetching a
// specific generated report, and generating new reports.
//
// Actions:
//   - listReports       — list available report types with pagination
//   - getReport         — fetch a single generated report by ID and type
//   - generateReport    — generate a new report
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listReportsSchema,
  getReportSchema,
  generateReportSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ReportTypeItem = {
  type: string;
  label: string;
  description: string;
};

export type RecruiterStaffReport = {
  staffEmail: string;
  staffName: string;
  totalAssigned: number;
  totalRequests: number;
  totalNotes: number;
  totalStories: number;
  totalAcceptedInvitations: number;
  totalRejectedInvitations: number;
  totalSuggestions: number;
  totalInvitations: number;
  totalCompletedStories: number;
};

export type GetRecruiterReportResult = {
  date: string;
  reports: RecruiterStaffReport[];
  total: number;
};

export type ListReportsInput = z.input<typeof listReportsSchema>;
export type GetReportInput = z.input<typeof getReportSchema>;
export type GenerateReportInput = z.input<typeof generateReportSchema>;

export type ListReportsResult = {
  reports: ReportTypeItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type SingleReportResult = {
  id: string;
  type: string;
  label: string;
  data: GetRecruiterReportResult | Record<string, unknown>;
  generatedAt: string;
};

export type GenerateReportResult = {
  operation: "success" | "error";
  message: string;
  data?: SingleReportResult;
};

// ---------------------------------------------------------------------------
// Available report types (static catalog — no DB dependency)
// ---------------------------------------------------------------------------

const reportTypes: ReportTypeItem[] = [
  {
    type: "recruiter-daily",
    label: "Daily Recruiter Report",
    description:
      "Daily activity summary for each recruiter staff member — assignments, requests, notes, stories, and invitations",
  },
  {
    type: "invitation-summary",
    label: "Invitation Summary",
    description:
      "Summary of invitation activity across all staff, including accepted and rejected counts",
  },
];

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

function filterReportTypes(filter?: string): ReportTypeItem[] {
  if (!filter) return [...reportTypes];
  return reportTypes.filter((r) =>
    r.type.toLowerCase().includes(filter.toLowerCase()),
  );
}

function paginate<T>(items: T[], page: number, limit: number): T[] {
  const start = (page - 1) * limit;
  return items.slice(start, start + limit);
}

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List available admin report types with pagination.
 * Optionally filter by type name.
 */
export async function listReports(
  input?: ListReportsInput,
): Promise<ListReportsResult> {
  await requireCapability("admin.read");

  const params = listReportsSchema.parse(input ?? {});
  const filtered = filterReportTypes(params.type);

  return {
    reports: paginate(filtered, params.page, params.limit),
    total: filtered.length,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(filtered.length / params.limit),
  };
}

/**
 * Get a single generated report by type and ID.
 * For recruiter-daily reports, the ID is a composite of date+type.
 * Returns the report data or throws if the type is unknown.
 */
export async function getReport(
  input: GetReportInput,
): Promise<SingleReportResult> {
  await requireCapability("admin.read");

  const parsed = getReportSchema.parse(input);

  if (parsed.type === "recruiter-daily") {
    // Parse date from the ID (e.g. "2026-06-10-recruiter-daily")
    const datePart = parsed.id.replace(/-recruiter-daily$/, "");
    const reportDate =
      datePart && !isNaN(Date.parse(datePart))
        ? datePart
        : new Date().toISOString().split("T")[0];

    const dayStart = new Date(`${reportDate}T00:00:00Z`);
    const dayEnd = new Date(`${reportDate}T23:59:59Z`);

    // Fetch recruiter staff (staff_role = true means recruiter)
    const recruiters = await prisma.staff.findMany({
      where: {
        staff_role: true,
        deleted: 0,
      },
      select: {
        staff_id: true,
        staff_email: true,
        staff_name: true,
      },
    });

    const reportRows: RecruiterStaffReport[] = [];

    for (const recruiter of recruiters) {
      const staffId = recruiter.staff_id;

      const [
        totalAssigned,
        totalRequests,
        totalNotes,
        totalStories,
        acceptedInvitations,
        rejectedInvitations,
        totalSuggestions,
        totalInvitations,
        completedStories,
      ] = await Promise.all([
        prisma.request.count({
          where: {
            staff_id: staffId,
            request_assigned_at: { gte: dayStart, lte: dayEnd },
          },
        }),
        prisma.request.count({
          where: {
            request_created_by: staffId,
            request_created_datetime: { gte: dayStart, lte: dayEnd },
          },
        }),
        prisma.note.count({
          where: {
            created_by: staffId,
            note_created_datetime: { gte: dayStart, lte: dayEnd },
          },
        }),
        prisma.story.count({
          where: {
            staff_id: staffId,
            story_created_at: { gte: dayStart, lte: dayEnd },
          },
        }),
        prisma.invitation.count({
          where: {
            invitation_created_by_staff: staffId,
            invitation_status: 1,
            invitation_created_at: { gte: dayStart, lte: dayEnd },
          },
        }),
        prisma.invitation.count({
          where: {
            invitation_created_by_staff: staffId,
            invitation_status: 2,
            invitation_created_at: { gte: dayStart, lte: dayEnd },
          },
        }),
        prisma.candidate_note.count({
          where: {
            created_by: staffId,
            note_created_datetime: { gte: dayStart, lte: dayEnd },
          },
        }),
        prisma.invitation.count({
          where: {
            invitation_created_by_staff: staffId,
            invitation_created_at: { gte: dayStart, lte: dayEnd },
          },
        }),
        prisma.story.count({
          where: {
            staff_id: staffId,
            story_status: 2,
            story_created_at: { gte: dayStart, lte: dayEnd },
          },
        }),
      ]);

      reportRows.push({
        staffEmail: recruiter.staff_email,
        staffName: recruiter.staff_name,
        totalAssigned,
        totalRequests,
        totalNotes,
        totalStories,
        totalAcceptedInvitations: acceptedInvitations,
        totalRejectedInvitations: rejectedInvitations,
        totalSuggestions,
        totalInvitations,
        totalCompletedStories: completedStories,
      });
    }

    return {
      id: parsed.id,
      type: parsed.type,
      label: "Daily Recruiter Report",
      data: {
        date: reportDate,
        reports: reportRows,
        total: reportRows.length,
      },
      generatedAt: new Date().toISOString(),
    };
  }

  if (parsed.type === "invitation-summary") {
    const reportDate = new Date().toISOString().split("T")[0];

    const summary = await prisma.invitation.groupBy({
      by: ["invitation_status"],
      _count: { _all: true },
    });

    const summaryItems = summary.map((s) => ({
      status: s.invitation_status,
      count: s._count?._all ?? 0,
    }));

    return {
      id: parsed.id,
      type: parsed.type,
      label: "Invitation Summary",
      data: {
        date: reportDate,
        summary: summaryItems,
      },
      generatedAt: new Date().toISOString(),
    };
  }

  throw new Error(`Unknown report type: ${parsed.type}`);
}

/**
 * Generate a new report of the specified type.
 * Returns the generated report data immediately.
 */
export async function generateReport(
  input: GenerateReportInput,
): Promise<GenerateReportResult> {
  await requireCapability("admin.read");

  const parsed = generateReportSchema.safeParse(input);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const reportDate = parsed.data.date ?? new Date().toISOString().split("T")[0];

  try {
    if (parsed.data.type === "recruiter-daily") {
      const reportId = `${reportDate}-recruiter-daily`;

      const report = await getReport({
        id: reportId,
        type: "recruiter-daily",
      });

      return {
        operation: "success",
        message: `Recruiter daily report for ${reportDate} generated (${(report.data as GetRecruiterReportResult).total} staff members)`,
        data: report,
      };
    }

    if (parsed.data.type === "invitation-summary") {
      const reportId = `${reportDate}-invitation-summary`;

      const report = await getReport({
        id: reportId,
        type: "invitation-summary",
      });

      revalidatePath("/admin/reports");

      return {
        operation: "success",
        message: `Invitation summary for ${reportDate} generated`,
        data: report,
      };
    }

    return {
      operation: "error",
      message: `Unknown report type: ${parsed.data.type}`,
    };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to generate report",
    };
  }
}
