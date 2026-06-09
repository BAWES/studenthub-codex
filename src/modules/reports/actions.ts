"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listReportsSchema = z.object({
  type: z.string().optional(),
  date: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getRecruiterReportSchema = z.object({
  date: z.string().optional(),
  staffEmail: z.string().email().optional(),
});

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

export type ListReportsResult = {
  reports: ReportTypeItem[];
  total: number;
};

export type GetRecruiterReportResult = {
  date: string;
  reports: RecruiterStaffReport[];
  total: number;
};

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
  staffRows: {
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
  }[],
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
  input?: z.input<typeof listReportsSchema>,
): Promise<ListReportsResult> {
  await requireCapability("admin.read");

  const params = listReportsSchema.parse(input ?? {});
  const filtered = filterReportTypes(params.type);

  return {
    reports: filtered.slice(0, params.limit),
    total: filtered.length,
  };
}

/**
 * Get the daily recruiter report.
 * Queries recruiter staff activity for the given date (defaults to today).
 * Optionally filter by specific staff email.
 */
export async function getRecruiterReport(
  input?: z.input<typeof getRecruiterReportSchema>,
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
        // totalAssigned: requests assigned to this staff today
        prisma.request.count({
          where: {
            staff_id: staffId,
            request_assigned_at: { gte: dayStart, lte: dayEnd },
          },
        }),
        // totalRequests: requests created by this staff today
        prisma.request.count({
          where: {
            request_created_by: staffId,
            request_created_datetime: { gte: dayStart, lte: dayEnd },
          },
        }),
        // totalNotes: notes created by this staff today
        prisma.note.count({
          where: {
            created_by: staffId,
            note_created_datetime: { gte: dayStart, lte: dayEnd },
          },
        }),
        // totalStories: stories created by this staff today
        prisma.story.count({
          where: {
            staff_id: staffId,
            story_created_at: { gte: dayStart, lte: dayEnd },
          },
        }),
        // totalAcceptedInvitations: invitations accepted (status=1) created today
        prisma.invitation.count({
          where: {
            invitation_created_by_staff: staffId,
            invitation_status: 1,
            invitation_created_at: { gte: dayStart, lte: dayEnd },
          },
        }),
        // totalRejectedInvitations: invitations rejected (status=2) created today
        prisma.invitation.count({
          where: {
            invitation_created_by_staff: staffId,
            invitation_status: 2,
            invitation_created_at: { gte: dayStart, lte: dayEnd },
          },
        }),
        // totalSuggestions: candidate notes created by this staff today
        prisma.candidate_note.count({
          where: {
            created_by: staffId,
            note_created_datetime: { gte: dayStart, lte: dayEnd },
          },
        }),
        // totalInvitations: all invitations created today
        prisma.invitation.count({
          where: {
            invitation_created_by_staff: staffId,
            invitation_created_at: { gte: dayStart, lte: dayEnd },
          },
        }),
        // totalCompletedStories: stories with status completed (2) today
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

  return {
    date: reportDate,
    reports,
    total: reports.length,
  };
}
