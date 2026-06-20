"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { getReportSchema, singleReportSchema } from "./schemas";
import type { GetReportInput, SingleReportResult, RecruiterStaffReport } from "./schemas";

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

    const reportResult = {
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

    // Output validation — log mismatches without throwing
    const recruiterParsed = singleReportSchema.safeParse(reportResult);
    if (!recruiterParsed.success) {
      console.error("[admin/reports/[id]] getReport (recruiter-daily) output failed:", recruiterParsed.error.issues);
    }

    return reportResult;
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

    const invitationResult = {
      id: parsed.id,
      type: parsed.type,
      label: "Invitation Summary",
      data: {
        date: reportDate,
        summary: summaryItems,
      },
      generatedAt: new Date().toISOString(),
    };

    // Output validation — log mismatches without throwing
    const invParsed = singleReportSchema.safeParse(invitationResult);
    if (!invParsed.success) {
      console.error("[admin/reports/[id]] getReport (invitation-summary) output failed:", invParsed.error.issues);
    }

    return invitationResult;
  }

  throw new Error(`Unknown report type: ${parsed.type}`);
}
