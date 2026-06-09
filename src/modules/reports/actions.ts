"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ReportType = "recruiter-daily" | "invitation-summary";

export type ReportTypeInfo = {
  type: ReportType;
  name: string;
  description: string;
};

export type ReportStaffBreakdown = {
  staffId: number;
  staffName: string;
  staffEmail: string;
  totalAssigned: number;
  totalRequests: number;
  totalNotes: number;
  totalStories: number;
  totalInvitations: number;
  totalAcceptedInvitations: number;
  totalRejectedInvitations: number;
  totalSuggestions: number;
  totalCompletedStories: number;
  totalStoryEmployees: number;
};

export type RecruiterReport = {
  date: string;
  totalRecruiters: number;
  breakdown: ReportStaffBreakdown[];
};

export type ListReportsResult = {
  reports: ReportTypeInfo[];
};

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const reportTypeEnum = z.enum(["recruiter-daily", "invitation-summary"]);

const listReportsSchema = z.object({
  type: reportTypeEnum.optional(),
});

const getRecruiterReportSchema = z.object({
  date: z.string().optional(),
  staffId: z.number().int().positive().optional(),
});

export type ListReportsInput = z.input<typeof listReportsSchema>;
export type GetRecruiterReportInput = z.input<typeof getRecruiterReportSchema>;

export { listReportsSchema, getRecruiterReportSchema };

// ---------------------------------------------------------------------------
// Report catalog
// ---------------------------------------------------------------------------

const REPORT_CATALOG: ReportTypeInfo[] = [
  {
    type: "recruiter-daily",
    name: "Recruiter Daily Report",
    description:
      "Daily recruiter activity breakdown — shows assigned candidates, requests, notes, stories, and invitations per staff member.",
  },
  {
    type: "invitation-summary",
    name: "Invitation Summary",
    description:
      "Summary of invitation activity for the selected period.",
  },
];

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List available report types, optionally filtered by type slug.
 * Mirrors the legacy report catalog.
 */
export async function listReports(
  params: ListReportsInput = {},
): Promise<ListReportsResult> {
  await requireCapability("reports.view");

  const parsed = listReportsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid params");
  }

  const { type } = parsed.data;

  const reports = type
    ? REPORT_CATALOG.filter((r) => r.type === type)
    : REPORT_CATALOG;

  return { reports };
}

/**
 * Get a daily recruiter activity report with staff-level breakdown.
 * Mirrors the legacy console ReportController::actionRecruiter().
 */
export async function getRecruiterReport(
  params: GetRecruiterReportInput = {},
): Promise<RecruiterReport> {
  await requireCapability("reports.view");

  const parsed = getRecruiterReportSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid params");
  }

  const { date, staffId } = parsed.data;
  const targetDate = date ?? new Date().toISOString().split("T")[0];

  // Build date boundaries for the target date
  const dateStart = new Date(`${targetDate}T00:00:00Z`);
  const dateEnd = new Date(`${targetDate}T23:59:59Z`);

  // Fetch recruiters (staff_role = true indicates active recruiter in this system)
  const whereStaff: Record<string, unknown> = {
    staff_role: true,
    deleted: 0,
  };
  if (staffId) {
    whereStaff.staff_id = staffId;
  }

  const recruiters = await prisma.staff.findMany({
    where: whereStaff as any,
    select: {
      staff_id: true,
      staff_name: true,
      staff_email: true,
    },
    orderBy: { staff_name: "asc" },
  });

  // Build per-staff breakdown using Prisma aggregation queries
  const breakdown: ReportStaffBreakdown[] = await Promise.all(
    recruiters.map(async (staff) => {
      const staffIdNum = staff.staff_id;

      // For simplicity and performance, use raw counts with Prisma
      const [assignedCount, requestCount, noteCount, storyCount] =
        await Promise.all([
          // Total assigned — count candidates linked to this staff
          prisma.candidate.count({
            where: {
              candidate_certificate: {
                some: { staff_id: staffIdNum },
              },
              // Filter by assignment date if available
              created_at: { gte: dateStart, lte: dateEnd },
            } as any,
          }),

          // Total requests created by or assigned to this staff
          prisma.request.count({
            where: {
              request_created_by: staffIdNum,
              request_created_datetime: {
                gte: dateStart,
                lte: dateEnd,
              },
            } as any,
          }),

          // Total notes created by this staff
          prisma.note.count({
            where: {
              created_by: staffIdNum,
              note_created_datetime: {
                gte: dateStart,
                lte: dateEnd,
              },
            } as any,
          }),

          // Total stories assigned to this staff
          prisma.story.count({
            where: {
              staff_id: staffIdNum,
              story_created_at: {
                gte: dateStart,
                lte: dateEnd,
              },
            } as any,
          }),
        ]);

      const [invitations, notesCount, suggestionsCount] = await Promise.all([
        // Invitations created by this staff
        prisma.invitation.findMany({
          where: {
            invitation_created_by_staff: staffIdNum,
            invitation_created_at: {
              gte: dateStart,
              lte: dateEnd,
            },
          } as any,
          select: {
            invitation_status: true,
          },
        }),

        // Note count per staff for suggestions context
        Promise.resolve(noteCount),

        // Suggestions count — linked to notes created by this staff
        prisma.suggestion.count({
          where: {
            note: {
              some: { created_by: staffIdNum },
            },
            suggestion_created_at: {
              gte: dateStart,
              lte: dateEnd,
            },
          } as any,
        }),
      ]);

      // Categorise invitations by status
      // Invitation statuses: 0=pending, 1=accepted, 2=rejected, etc.
      const totalInvitations = invitations.length;
      const totalAccepted = invitations.filter(
        (i) => i.invitation_status === 1,
      ).length;
      const totalRejected = invitations.filter(
        (i) => i.invitation_status === 2,
      ).length;

      // Completed stories — stories with story_status indicating completion
      const completedStoriesCount = await prisma.story.count({
        where: {
          staff_id: staffIdNum,
          story_status: { gte: 3 }, // Completed/inactive status
          story_created_at: {
            gte: dateStart,
            lte: dateEnd,
          },
        } as any,
      });

      // Story employees — total employees placed via this staff's stories
      const storyEmployeesResult = await prisma.story.aggregate({
        where: {
          staff_id: staffIdNum,
          story_created_at: {
            gte: dateStart,
            lte: dateEnd,
          },
        } as any,
        _sum: { number_of_employees: true },
      });

      return {
        staffId: staffIdNum,
        staffName: staff.staff_name,
        staffEmail: staff.staff_email,
        totalAssigned: assignedCount,
        totalRequests: requestCount,
        totalNotes: notesCount,
        totalStories: storyCount,
        totalInvitations,
        totalAcceptedInvitations: totalAccepted,
        totalRejectedInvitations: totalRejected,
        totalSuggestions: suggestionsCount,
        totalCompletedStories: completedStoriesCount,
        totalStoryEmployees:
          storyEmployeesResult._sum.number_of_employees ?? 0,
      };
    }),
  );

  return {
    date: targetDate,
    totalRecruiters: recruiters.length,
    breakdown,
  };
}

// ---------------------------------------------------------------------------
// Public exports
// ---------------------------------------------------------------------------

export { reportTypeEnum };
