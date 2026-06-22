"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listReportsSchema,
  getRecruiterReportSchema,
  listReportsResultSchema,
  getRecruiterReportResultSchema,
} from "./schemas";
import type {
  ListReportsResult,
  GetRecruiterReportResult,
  ReportTypeItem,
  RecruiterStaffReport,
} from "./schemas";

// ---------------------------------------------------------------------------
// Available report types (pure data)
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
// Pure functions
// ---------------------------------------------------------------------------

function filterReportTypes(filter?: string): ReportTypeItem[] {
  if (!filter) return [...reportTypes];
  return reportTypes.filter((r) =>
    r.type.toLowerCase().includes(filter.toLowerCase()),
  );
}

function buildDailyRecruiterReport(
  staffRows: RecruiterStaffReport[],
): RecruiterStaffReport[] {
  return staffRows.map((r) => ({
    staffEmail: r.staffEmail,
    staffName: r.staffName,
    totalAssigned: r.totalAssigned,
    totalRequests: r.totalRequests,
    totalNotes: r.totalNotes,
    totalStories: r.totalStories,
    totalAcceptedInvitations: r.totalAcceptedInvitations,
    totalRejectedInvitations: r.totalRejectedInvitations,
    totalSuggestions: r.totalSuggestions,
    totalInvitations: r.totalInvitations,
    totalCompletedStories: r.totalCompletedStories,
  }));
}

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List available report types.
 * Optionally filter by report type name (e.g. "recruiter" for recruiter reports).
 */
export async function listReports(
  input?: Record<string, unknown>,
): Promise<ListReportsResult> {
  await requireCapability("admin.read");

  const params = listReportsSchema.parse(input ?? {});
  const filtered = filterReportTypes(params.type);

  const result: ListReportsResult = {
    reports: filtered.slice(0, params.limit),
    total: filtered.length,
  };

  // Validate output shape
  const outputParsed = listReportsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/reports] listReports output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get the daily recruiter report.
 * Queries recruiter staff activity for the given date (defaults to today).
 * Optionally filter by specific staff email.
 */
export async function getRecruiterReport(
  input?: Record<string, unknown>,
): Promise<GetRecruiterReportResult> {
  await requireCapability("admin.read");

  const params = getRecruiterReportSchema.parse(input ?? {});
  const reportDate = params.date ?? new Date().toISOString().split("T")[0];

  // Build date boundary (start of day to end of day)
  const dayStart = new Date(`${reportDate}T00:00:00Z`);
  const dayEnd = new Date(`${reportDate}T23:59:59Z`);

  // Fetch recruiter staff (staff_role = true means recruiter)
  const recruiters = await prisma.staff.findMany({
    where: {
      staff_role: true,
      deleted: 0,
      ...(params.staffEmail ? { staff_email: params.staffEmail } : {}),
    },
    select: {
      staff_id: true,
      staff_email: true,
      staff_name: true,
    },
  });

  // For each recruiter, query daily activity counts
  const reports: RecruiterStaffReport[] = [];

  for (const recruiter of recruiters) {
    const staffId = recruiter.staff_id;

    const [totalAssigned, totalRequests, totalNotes, totalStories, acceptedInvitations, rejectedInvitations, totalSuggestions, totalInvitations, completedStories] =
      await Promise.all([
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

    reports.push(
      ...buildDailyRecruiterReport([
        {
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
        },
      ]),
    );
  }

  const result: GetRecruiterReportResult = {
    date: reportDate,
    reports,
    total: reports.length,
  };

  // Validate output shape
  const outputParsed = getRecruiterReportResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/reports] getRecruiterReport output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
