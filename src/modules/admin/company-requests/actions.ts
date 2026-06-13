"use server";

// ---------------------------------------------------------------------------
// Admin CompanyRequest — server actions (module level)
// ---------------------------------------------------------------------------
// DB table: company_request
// PK:       company_request_uuid (String @db.Char(60))
// Fields:   company_name, company_email, contact_name, contact_position,
//           phone_number, requesting_for, currency_code, country_id,
//           status (Boolean — 0=pending, 1=approved), created_at, updated_at
//
// Prisma model: company_request (auto-generated from schema)
// Relations:
//   - contact?: contact    @relation(fields: [contact_uuid], references: [contact_uuid])
//   - country?: country    @relation(fields: [country_id], references: [country_id])
//   - campaign?: campaign  @relation(fields: [utm_uuid], references: [utm_uuid])
//
// Actions:
//   - listCompanyRequests       — paginated list with optional filters
//   - getCompanyRequest         — single request detail
//   - updateCompanyRequestStatus — update status (pending/approved)
//
// Capabilities: admin.read, admin.write (same pattern as admin/employees)
// Status enum: pending (0), approved (1)
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listCompanyRequestsSchema,
  getCompanyRequestSchema,
  updateCompanyRequestStatusSchema,
  listCompanyRequestsOutputSchema,
  getCompanyRequestOutputSchema,
  updateCompanyRequestStatusOutputSchema,
  type ListCompanyRequestsInput,
  type GetCompanyRequestInput,
  type UpdateCompanyRequestStatusInput,
  type CompanyRequestRow,
  type CompanyRequestDetail,
  type UpdateCompanyRequestStatusResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map status enum string to integer (Boolean in DB: 0 / 1). */
function statusToInt(status: "pending" | "approved"): number {
  return status === "approved" ? 1 : 0;
}

/** Map integer (Boolean) to status enum string. */
function intToStatus(value: number | null): string {
  if (value === 1) return "approved";
  return "pending";
}

/** Map a Prisma company_request row to the shared row shape. */
function toRow(r: any): CompanyRequestRow {
  return {
    company_request_uuid: r.company_request_uuid,
    company_name: r.company_name ?? null,
    company_email: r.company_email ?? null,
    contact_name: r.contact_name ?? null,
    contact_position: r.contact_position ?? null,
    phone_number: r.phone_number ?? null,
    requesting_for: r.requesting_for ?? null,
    currency_code: r.currency_code ?? null,
    country_id: r.country_id ?? null,
    country_name_en: r.country?.country_name_en ?? null,
    status: r.status !== null ? (r.status ? 1 : 0) : null,
    created_at: r.created_at?.toISOString() ?? null,
    updated_at: r.updated_at?.toISOString() ?? null,
  };
}

// ---------------------------------------------------------------------------
// listCompanyRequests
// ---------------------------------------------------------------------------

/**
 * List all company requests with pagination and optional filters
 * by status (pending/approved) or country ID.
 * Requires admin.read capability.
 */
export async function listCompanyRequests(
  input: ListCompanyRequestsInput = {},
): Promise<{
  items: CompanyRequestRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  await requireCapability("admin.read");

  const parsed = listCompanyRequestsSchema.safeParse(input);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, countryId, status } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (countryId !== undefined) where.country_id = countryId;
  if (status !== undefined) where.status = statusToInt(status);

  const [rows, total] = await Promise.all([
    prisma.company_request.findMany({
      where: where as any,
      orderBy: [{ created_at: { sort: "desc", nulls: "last" } }],
      skip,
      take: limit,
      include: {
        country: { select: { country_name_en: true } },
      },
    }),
    prisma.company_request.count({ where: where as any }),
  ]);

  const result = {
    items: rows.map(toRow),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listCompanyRequestsOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/company-requests] listCompanyRequests output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getCompanyRequest
// ---------------------------------------------------------------------------

/**
 * Get a single company request by UUID with country info.
 * Requires admin.read capability.
 */
export async function getCompanyRequest(
  companyRequestUuid: string,
): Promise<CompanyRequestDetail> {
  await requireCapability("admin.read");

  const parsed = getCompanyRequestSchema.safeParse({ companyRequestUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid company request UUID");
  }

  const row = await prisma.company_request.findFirst({
    where: { company_request_uuid: parsed.data.companyRequestUuid },
    include: {
      country: { select: { country_name_en: true } },
    },
  });

  if (!row) {
    const result = { request: null };

    const outputParsed = getCompanyRequestOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/company-requests] getCompanyRequest (not found) output failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  }

  const result = {
    request: toRow(row),
  };

  const outputParsed = getCompanyRequestOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/company-requests] getCompanyRequest output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// updateCompanyRequestStatus
// ---------------------------------------------------------------------------

/**
 * Update a company request's status (pending <-> approved).
 * Requires admin.write capability.
 *
 * - "pending"  → sets status = 0 (false)
 * - "approved" → sets status = 1 (true)
 */
export async function updateCompanyRequestStatus(
  input: UpdateCompanyRequestStatusInput,
): Promise<UpdateCompanyRequestStatusResult> {
  await requireCapability("admin.write");

  const parsed = updateCompanyRequestStatusSchema.safeParse(input);
  if (!parsed.success) {
    const result: UpdateCompanyRequestStatusResult = {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };

    const outputParsed = updateCompanyRequestStatusOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/company-requests] updateCompanyRequestStatus output failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  }

  const { companyRequestUuid, status } = parsed.data;
  const statusBool = status === "approved";

  // Verify the request exists
  const existing = await prisma.company_request.findUnique({
    where: { company_request_uuid: companyRequestUuid },
    select: { company_request_uuid: true, status: true },
  });

  if (!existing) {
    const result: UpdateCompanyRequestStatusResult = {
      operation: "error",
      message: "Company request not found",
    };

    const outputParsed = updateCompanyRequestStatusOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/company-requests] updateCompanyRequestStatus output failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  }

  try {
    await prisma.company_request.update({
      where: { company_request_uuid: companyRequestUuid },
      data: {
        status: statusBool,
        updated_at: new Date(),
      },
    });

    revalidatePath("/admin/company-requests");

    const result: UpdateCompanyRequestStatusResult = {
      operation: "success",
      message: `Company request status updated to "${status}"`,
    };

    const outputParsed = updateCompanyRequestStatusOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/company-requests] updateCompanyRequestStatus output failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  } catch (err) {
    const result: UpdateCompanyRequestStatusResult = {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to update company request status",
    };

    const outputParsed = updateCompanyRequestStatusOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/company-requests] updateCompanyRequestStatus output failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  }
}
