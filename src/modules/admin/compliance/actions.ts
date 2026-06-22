"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { formatDate } from "@/modules/workspace/format";
import {
  listComplianceRecordsSchema,
  getComplianceRecordSchema,
  approveComplianceSchema,
  denyComplianceSchema,
  createComplianceRecordSchema,
  updateComplianceRecordSchema,
  listComplianceRecordsResponseSchema,
  companyComplianceDetailSchema,
  idRequestComplianceDetailSchema,
  complianceSummarySchema,
  complianceMutationResponseSchema,
  type ListComplianceRecordsInput,
  type GetComplianceRecordInput,
  type ApproveComplianceInput,
  type DenyComplianceInput,
  type CreateComplianceRecordInput,
  type UpdateComplianceRecordInput,
  type ComplianceRow,
  type ComplianceSummary,
  type CompanyComplianceDetail,
  type IdRequestComplianceDetail,
} from "./schemas";

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
      orderBy: { candidate_updated_at: "desc" },
      take: type === "candidate" ? limit : 10,
      skip: type === "candidate" ? skip : 0,
      select: {
        candidate_id: true,
        candidate_name: true,
        candidate_email: true,
        approved: true,
        is_incomplete_profile: true,
        candidate_updated_at: true,
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
        updated: formatDate(c.candidate_updated_at),
      });
    }
  }

  const listResult = {
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

  // Validate output shape
  const outputParsed = listComplianceRecordsResponseSchema.safeParse(listResult);
  if (!outputParsed.success) {
    console.error(
      "[admin/compliance] listComplianceRecords output validation failed:",
      outputParsed.error.issues,
    );
  }

  return listResult;
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

    const idRequests = (await prisma.candidate_id_request.findMany({
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
    })).map((r) => ({
      id: r.cir_uuid,
      status: r.status ?? "pending",
      rejection_reason: r.rejection_reason,
      created_at: r.created_at,
    }));

    const companyResult = {
      type: "company" as const,
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

    // Validate output shape
    const companyOutputParsed = companyComplianceDetailSchema.safeParse(companyResult);
    if (!companyOutputParsed.success) {
      console.error(
        "[admin/compliance] getComplianceRecord (company) output validation failed:",
        companyOutputParsed.error.issues,
      );
    }

    return companyResult;
  }

  if (type === "id_request") {
    const record = await prisma.candidate_id_request.findUnique({
      where: { cir_uuid: id },
    });

    if (!record) return null;

    const idRequestResult = {
      type: "id_request" as const,
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

    // Validate output shape
    const idRequestOutputParsed = idRequestComplianceDetailSchema.safeParse(idRequestResult);
    if (!idRequestOutputParsed.success) {
      console.error(
        "[admin/compliance] getComplianceRecord (id_request) output validation failed:",
        idRequestOutputParsed.error.issues,
      );
    }

    return idRequestResult;
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

  const summaryResult = {
    totalCompanies,
    unapprovedCompanies,
    pendingIdRequests,
    unapprovedCandidates,
    incompleteCandidates,
  };

  // Validate output shape
  const outputParsed = complianceSummarySchema.safeParse(summaryResult);
  if (!outputParsed.success) {
    console.error(
      "[admin/compliance] getComplianceSummary output validation failed:",
      outputParsed.error.issues,
    );
  }

  return summaryResult;
}

// ---------------------------------------------------------------------------
// createComplianceRecord
// ---------------------------------------------------------------------------

/**
 * Create a new compliance record.
 * Currently supports creating a company compliance record (sets initial
 * company compliance status).
 */
export async function createComplianceRecord(
  data: CreateComplianceRecordInput,
): Promise<{ id: string; type: string }> {
  await requireCapability("admin.write");

  const parsed = createComplianceRecordSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid compliance data");
  }

  if (parsed.data.type === "company") {
    const company = await prisma.company.create({
      data: {
        company_name: parsed.data.company_name,
        company_email: parsed.data.company_email ?? null,
        company_approved_to_hire: parsed.data.company_approved_to_hire,
        company_created_at: new Date(),
        company_updated_at: new Date(),
      },
    });
    revalidatePath("/admin/compliance");
    const createResult = { id: `company-${company.company_id}`, type: "company" as const };

    // Validate output shape
    const outputParsed = complianceMutationResponseSchema.safeParse(createResult);
    if (!outputParsed.success) {
      console.error("[admin/compliance] createComplianceRecord output failed:", outputParsed.error.issues);
    }

    return createResult;
  }

  throw new Error(`Unsupported compliance type: ${parsed.data.type}`);
}

// ---------------------------------------------------------------------------
// updateComplianceRecord
// ---------------------------------------------------------------------------

/**
 * Update compliance record fields.
 * Currently supports company compliance updates.
 */
export async function updateComplianceRecord(
  data: UpdateComplianceRecordInput,
): Promise<{ id: string; type: string }> {
  await requireCapability("admin.write");

  const parsed = updateComplianceRecordSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid compliance data");
  }

  const { id, type, ...fields } = parsed.data;

  if (type === "company") {
    const companyId = Number(id);
    if (isNaN(companyId)) throw new Error("Invalid company ID");

    const updateData: Record<string, unknown> = {
      company_updated_at: new Date(),
    };
    if (fields.company_approved_to_hire !== undefined) {
      updateData.company_approved_to_hire = fields.company_approved_to_hire;
    }
    if (fields.company_followup !== undefined) {
      updateData.company_followup = fields.company_followup;
    }
    if (fields.company_status_override !== undefined) {
      updateData.company_status_override = fields.company_status_override;
    }

    await prisma.company.update({
      where: { company_id: companyId },
      data: updateData as any,
    });

    revalidatePath("/admin/compliance");
    const updateResult = { id: `company-${companyId}`, type: "company" as const };

    // Validate output shape
    const outputParsed = complianceMutationResponseSchema.safeParse(updateResult);
    if (!outputParsed.success) {
      console.error("[admin/compliance] updateComplianceRecord output failed:", outputParsed.error.issues);
    }

    return updateResult;
  }

  throw new Error(`Unsupported compliance type: ${type}`);
}

// ---------------------------------------------------------------------------
// approveComplianceRecord
// ---------------------------------------------------------------------------

/**
 * Approve a compliance record.
 * For companies: sets company_approved_to_hire=true.
 * For ID requests: sets status to "approved".
 */
export async function approveComplianceRecord(
  data: ApproveComplianceInput,
): Promise<{ id: string; type: string }> {
  await requireCapability("admin.write");

  const parsed = approveComplianceSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { id, type } = parsed.data;

  if (type === "company") {
    const companyId = Number(id);
    if (isNaN(companyId)) throw new Error("Invalid company ID");

    await prisma.company.update({
      where: { company_id: companyId },
      data: {
        company_approved_to_hire: true,
        company_updated_at: new Date(),
      },
    });

    revalidatePath("/admin/compliance");
    const approveCompanyResult = { id: `company-${companyId}`, type: "company" as const };

    // Validate output shape
    const outputParsed = complianceMutationResponseSchema.safeParse(approveCompanyResult);
    if (!outputParsed.success) {
      console.error("[admin/compliance] approveComplianceRecord (company) output failed:", outputParsed.error.issues);
    }

    return approveCompanyResult;
  }

  if (type === "id_request") {
    await prisma.candidate_id_request.update({
      where: { cir_uuid: id },
      data: {
        status: "approved",
      },
    });

    revalidatePath("/admin/compliance");
    const approveIdRequestResult = { id, type: "id_request" as const };

    // Validate output shape
    const outputParsed2 = complianceMutationResponseSchema.safeParse(approveIdRequestResult);
    if (!outputParsed2.success) {
      console.error("[admin/compliance] approveComplianceRecord (id_request) output failed:", outputParsed2.error.issues);
    }

    return approveIdRequestResult;
  }

  throw new Error(`Unsupported compliance type: ${type}`);
}

// ---------------------------------------------------------------------------
// denyComplianceRecord
// ---------------------------------------------------------------------------

/**
 * Deny a compliance record with a required reason.
 * For companies: sets company_approved_to_hire=false.
 * For ID requests: sets status to "rejected" with rejection_reason.
 */
export async function denyComplianceRecord(
  data: DenyComplianceInput,
): Promise<{ id: string; type: string }> {
  await requireCapability("admin.write");

  const parsed = denyComplianceSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { id, type, reason } = parsed.data;

  if (type === "company") {
    const companyId = Number(id);
    if (isNaN(companyId)) throw new Error("Invalid company ID");

    await prisma.company.update({
      where: { company_id: companyId },
      data: {
        company_approved_to_hire: false,
        company_updated_at: new Date(),
      },
    });

    revalidatePath("/admin/compliance");
    const denyCompanyResult = { id: `company-${companyId}`, type: "company" as const };

    // Validate output shape
    const outputParsed = complianceMutationResponseSchema.safeParse(denyCompanyResult);
    if (!outputParsed.success) {
      console.error("[admin/compliance] denyComplianceRecord (company) output failed:", outputParsed.error.issues);
    }

    return denyCompanyResult;
  }

  if (type === "id_request") {
    await prisma.candidate_id_request.update({
      where: { cir_uuid: id },
      data: {
        status: "rejected",
        rejection_reason: reason,
      },
    });

    revalidatePath("/admin/compliance");
    const denyIdRequestResult = { id, type: "id_request" as const };

    // Validate output shape
    const outputParsed2 = complianceMutationResponseSchema.safeParse(denyIdRequestResult);
    if (!outputParsed2.success) {
      console.error("[admin/compliance] denyComplianceRecord (id_request) output failed:", outputParsed2.error.issues);
    }

    return denyIdRequestResult;
  }

  throw new Error(`Unsupported compliance type: ${type}`);
}
