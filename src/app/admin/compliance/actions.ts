"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { formatDate } from "@/modules/workspace/format";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listComplianceRecordsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  q: z.string().optional(),
  type: z.enum(["company", "id_request", "candidate", "all"]).optional().default("all"),
  status: z.string().optional(),
});

export const getComplianceRecordSchema = z.object({
  id: z.string().min(1, "Record ID is required"),
  type: z.enum(["company", "id_request", "candidate"]),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListComplianceRecordsInput = z.input<typeof listComplianceRecordsSchema>;
export type GetComplianceRecordInput = z.input<typeof getComplianceRecordSchema>;

export type ComplianceRow = {
  id: string;
  type: "company" | "id_request" | "candidate";
  title: string;
  subtitle: string;
  status: string;
  updated: string;
};

export type ComplianceSummary = {
  totalCompanies: number;
  unapprovedCompanies: number;
  pendingIdRequests: number;
  unapprovedCandidates: number;
  incompleteCandidates: number;
};

export type CompanyComplianceDetail = {
  type: "company";
  company: {
    company_id: number;
    company_name: string;
    company_email: string | null;
    company_approved_to_hire: boolean | null;
    company_created_at: Date | null;
    company_updated_at: Date | null;
    staff_name: string | null;
    country_name_en: string | null;
    no_of_active_requests: number | null;
  } | null;
  metrics: { label: string; value: string | number; note: string }[];
  idRequests: { id: string; status: string; rejection_reason: string | null; created_at: Date | null }[];
};

export type IdRequestComplianceDetail = {
  type: "id_request";
  record: {
    cir_uuid: string;
    candidate_ids: string | null;
    status: string | null;
    rejection_reason: string | null;
    created_at: Date | null;
    updated_at: Date | null;
  } | null;
  metrics: { label: string; value: string | number; note: string }[];
};

// ---------------------------------------------------------------------------
// listComplianceRecords
// ---------------------------------------------------------------------------

/**
 * List all compliance records across the system.
 * Includes unapproved companies, pending ID requests, and unapproved candidates.
 * Supports pagination, type filtering, and search.
 */
export async function listComplianceRecords(
  input: ListComplianceRecordsInput = {},
): Promise<{
  items: ComplianceRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: ComplianceSummary;
}> {
  await requireCapability("admin.read");

  const parsed = listComplianceRecordsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
      summary: { totalCompanies: 0, unapprovedCompanies: 0, pendingIdRequests: 0, unapprovedCandidates: 0, incompleteCandidates: 0 },
    };
  }

  const { page, limit, q, type, status } = parsed.data;
  const skip = (page - 1) * limit;

  // Gather summary in parallel
  const [
    totalCompanies,
    unapprovedCompanies,
    pendingIdRequests,
    unapprovedCandidates,
    incompleteCandidates,
  ] = await Promise.all([
    prisma.company.count({ where: { deleted: 0 } }),
    prisma.company.count({ where: { deleted: 0, company_approved_to_hire: false } }),
    prisma.candidate_id_request.count({ where: { status: "pending" } }),
    prisma.candidate.count({ where: { deleted: 0, approved: 0 } }),
    prisma.candidate.count({ where: { deleted: 0, is_incomplete_profile: true } }),
  ]);

  // Build composite list
  const items: ComplianceRow[] = [];

  if (type === "all" || type === "company") {
    const companyWhere: Record<string, unknown> = { deleted: 0 };
    if (status === "not_approved") {
      companyWhere.company_approved_to_hire = false;
    }
    if (q && q.trim().length > 0) {
      companyWhere.company_name = { contains: q.trim() };
    }

    const companies = await prisma.company.findMany({
      where: companyWhere as any,
      orderBy: { company_updated_at: "desc" },
      take: type === "company" ? limit : 10,
      skip: type === "company" ? skip : 0,
      select: {
        company_id: true,
        company_name: true,
        company_email: true,
        company_approved_to_hire: true,
        company_updated_at: true,
      },
    });

    for (const c of companies) {
      items.push({
        id: `company-${c.company_id}`,
        type: "company",
        title: c.company_name,
        subtitle: c.company_email ?? "No email",
        status: c.company_approved_to_hire ? "Approved" : "Not approved",
        updated: formatDate(c.company_updated_at),
      });
    }
  }

  if (type === "all" || type === "id_request") {
    const idrWhere: Record<string, unknown> = {};
    if (status && status !== "all") {
      idrWhere.status = status;
    }
    if (status === "pending") {
      idrWhere.status = "pending";
    }

    const idRequests = await prisma.candidate_id_request.findMany({
      where: idrWhere as any,
      orderBy: { created_at: "desc" },
      take: type === "id_request" ? limit : 10,
      skip: type === "id_request" ? skip : 0,
      select: {
        cir_uuid: true,
        candidate_ids: true,
        status: true,
        rejection_reason: true,
        created_at: true,
      },
    });

    for (const r of idRequests) {
      items.push({
        id: `id_request-${r.cir_uuid}`,
        type: "id_request",
        title: `ID Request ${r.cir_uuid.slice(0, 12)}…`,
        subtitle: `Candidates: ${r.candidate_ids ?? "N/A"}`,
        status: r.status ?? "unknown",
        updated: formatDate(r.created_at),
      });
    }
  }

  if (type === "all" || type === "candidate") {
    const candWhere: Record<string, unknown> = { deleted: 0 };
    if (status === "unapproved") {
      candWhere.approved = 0;
    }
    if (q && q.trim().length > 0) {
      candWhere.OR = [
        { candidate_name: { contains: q.trim() } },
        { candidate_email: { contains: q.trim() } },
      ];
    }

    const candidates = await prisma.candidate.findMany({
      where: candWhere as any,
      orderBy: { updated_at: "desc" },
      take: type === "candidate" ? limit : 10,
      skip: type === "candidate" ? skip : 0,
      select: {
        candidate_id: true,
        candidate_name: true,
        candidate_email: true,
        approved: true,
        is_incomplete_profile: true,
        updated_at: true,
      },
    });

    for (const c of candidates) {
      const statusParts: string[] = [];
      if (!c.approved) statusParts.push("Unapproved");
      if (c.is_incomplete_profile) statusParts.push("Incomplete");
      if (statusParts.length === 0) statusParts.push("Approved");

      items.push({
        id: `candidate-${c.candidate_id}`,
        type: "candidate",
        title: c.candidate_name ?? "Unknown candidate",
        subtitle: c.candidate_email ?? "No email",
        status: statusParts.join(", "),
        updated: formatDate(c.updated_at),
      });
    }
  }

  return {
    items,
    total: items.length,
    page,
    limit,
    totalPages: Math.ceil(items.length / limit),
    summary: {
      totalCompanies,
      unapprovedCompanies,
      pendingIdRequests,
      unapprovedCandidates,
      incompleteCandidates,
    },
  };
}

// ---------------------------------------------------------------------------
// getComplianceRecord
// ---------------------------------------------------------------------------

/**
 * Get a single compliance record by type and ID.
 */
export async function getComplianceRecord(
  input: GetComplianceRecordInput,
): Promise<CompanyComplianceDetail | IdRequestComplianceDetail | null> {
  await requireCapability("admin.read");

  const parsed = getComplianceRecordSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { id, type } = parsed.data;

  if (type === "company") {
    const companyId = Number(id);
    if (isNaN(companyId)) throw new Error("Invalid company ID");

    const company = await prisma.company.findUnique({
      where: { company_id: companyId },
      select: {
        company_id: true,
        company_name: true,
        company_email: true,
        company_approved_to_hire: true,
        company_created_at: true,
        company_updated_at: true,
        staff: { select: { staff_name: true } },
        country: { select: { country_name_en: true } },
        no_of_active_requests: true,
      },
    });

    if (!company) return null;

    const idRequests = await prisma.candidate_id_request.findMany({
      where: {
        // No direct link — show recent ones as context
        created_at: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { created_at: "desc" },
      take: 5,
      select: {
        cir_uuid: true,
        status: true,
        rejection_reason: true,
        created_at: true,
      },
    });

    return {
      type: "company",
      company: {
        company_id: company.company_id,
        company_name: company.company_name,
        company_email: company.company_email,
        company_approved_to_hire: company.company_approved_to_hire,
        company_created_at: company.company_created_at,
        company_updated_at: company.company_updated_at,
        staff_name: company.staff?.staff_name ?? null,
        country_name_en: company.country?.country_name_en ?? null,
        no_of_active_requests: company.no_of_active_requests,
      },
      metrics: [
        { label: "Approved to Hire", value: company.company_approved_to_hire ? "Yes" : "No", note: "Company compliance status" },
        { label: "Active Requests", value: company.no_of_active_requests ?? 0, note: "Current hiring activity" },
        { label: "Country", value: company.country?.country_name_en ?? "N/A", note: "Registered country" },
      ],
      idRequests,
    };
  }

  if (type === "id_request") {
    const record = await prisma.candidate_id_request.findUnique({
      where: { cir_uuid: id },
    });

    if (!record) return null;

    return {
      type: "id_request",
      record: {
        cir_uuid: record.cir_uuid,
        candidate_ids: record.candidate_ids,
        status: record.status,
        rejection_reason: record.rejection_reason,
        created_at: record.created_at,
        updated_at: record.updated_at,
      },
      metrics: [
        { label: "Status", value: record.status ?? "unknown", note: "Current ID request status" },
        { label: "Candidates", value: record.candidate_ids?.split(",").length ?? 0, note: "Candidates in this batch" },
        { label: "Created", value: formatDate(record.created_at), note: "Request creation date" },
      ],
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// getComplianceSummary
// ---------------------------------------------------------------------------

/**
 * Get a high-level compliance summary for the dashboard.
 * Returns counts of items requiring attention across all compliance categories.
 */
export async function getComplianceSummary(): Promise<ComplianceSummary> {
  await requireCapability("admin.read");

  const [totalCompanies, unapprovedCompanies, pendingIdRequests, unapprovedCandidates, incompleteCandidates] =
    await Promise.all([
      prisma.company.count({ where: { deleted: 0 } }),
      prisma.company.count({ where: { deleted: 0, company_approved_to_hire: false } }),
      prisma.candidate_id_request.count({ where: { status: "pending" } }),
      prisma.candidate.count({ where: { deleted: 0, approved: 0 } }),
      prisma.candidate.count({ where: { deleted: 0, is_incomplete_profile: true } }),
    ]);

  return {
    totalCompanies,
    unapprovedCompanies,
    pendingIdRequests,
    unapprovedCandidates,
    incompleteCandidates,
  };
}
