"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { getReport } from "./[id]/actions";
import {
  listReportsSchema,
  generateReportSchema,
  reportTypeItemSchema,
  listReportsResultSchema,
  generateReportResultSchema,
  type ReportTypeItem,
  type RecruiterStaffReport,
  type GetRecruiterReportResult,
  type ListReportsResult,
  type GenerateReportResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type { ReportTypeItem, RecruiterStaffReport, GetRecruiterReportResult, ListReportsResult, GenerateReportResult };

export type ListReportsInput = z.input<typeof listReportsSchema>;
export type GenerateReportInput = z.input<typeof generateReportSchema>;

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

  const result = {
    reports: paginate(filtered, params.page, params.limit),
    total: filtered.length,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(filtered.length / params.limit),
  };

  // Output validation — log mismatches without throwing
  const outputParsed = listReportsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[admin/reports] listReports output failed:", outputParsed.error.issues);
  }

  return result;
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

      const successResult = {
        operation: "success" as const,
        message: `Recruiter daily report for ${reportDate} generated (${(report.data as GetRecruiterReportResult).total} staff members)`,
        data: report,
      };

      // Output validation — log mismatches without throwing
      const genParsed = generateReportResultSchema.safeParse(successResult);
      if (!genParsed.success) {
        console.error("[admin/reports] generateReport (recruiter-daily) output failed:", genParsed.error.issues);
      }

      return successResult;
    }

    if (parsed.data.type === "invitation-summary") {
      const reportId = `${reportDate}-invitation-summary`;

      const report = await getReport({
        id: reportId,
        type: "invitation-summary",
      });

      revalidatePath("/admin/reports");

      const invSuccessResult = {
        operation: "success" as const,
        message: `Invitation summary for ${reportDate} generated`,
        data: report,
      };

      // Output validation — log mismatches without throwing
      const genInvParsed = generateReportResultSchema.safeParse(invSuccessResult);
      if (!genInvParsed.success) {
        console.error("[admin/reports] generateReport (invitation-summary) output failed:", genInvParsed.error.issues);
      }

      return invSuccessResult;
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
