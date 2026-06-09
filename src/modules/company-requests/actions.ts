"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// CompanyRequestController — Admin/staff management of company signup requests
// ---------------------------------------------------------------------------
// Ported from Yii2 staff/modules/v1/controllers/CompanyRequestController.php
// Actions: listCompanyRequests, getCompanyRequest, approveCompanyRequest, rejectCompanyRequest
//
// NOTE: This manages the `company_request` model (companies signing up to platform).
// The `request` model (company contacts requesting staffing) is handled separately
// in src/modules/requests/company-create-actions.ts.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listCompanyRequestsSchema = z.object({
  status: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getCompanyRequestSchema = z.object({
  uuid: z.string().min(1, "Company request UUID is required"),
});

const approveCompanyRequestSchema = z.object({
  uuid: z.string().min(1, "Company request UUID is required"),
});

const rejectCompanyRequestSchema = z.object({
  uuid: z.string().min(1, "Company request UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListCompanyRequestsParams = z.input<typeof listCompanyRequestsSchema>;
export type GetCompanyRequestParams = z.input<typeof getCompanyRequestSchema>;
export type ApproveCompanyRequestParams = z.input<typeof approveCompanyRequestSchema>;
export type RejectCompanyRequestParams = z.input<typeof rejectCompanyRequestSchema>;

export type CompanyRequestItem = {
  company_request_uuid: string;
  company_name: string;
  company_email: string;
  contact_name: string;
  contact_position: string | null;
  phone_number: string | null;
  requesting_for: string | null;
  status: boolean | null;
  currency_code: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ListCompanyRequestsResult = {
  requests: CompanyRequestItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CompanyRequestMutationResult = {
  operation: string;
  message?: string;
};

// ---------------------------------------------------------------------------
// Exported schemas (for shared validation in tests)
// ---------------------------------------------------------------------------

export {
  listCompanyRequestsSchema,
  getCompanyRequestSchema,
  approveCompanyRequestSchema,
  rejectCompanyRequestSchema,
};

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List company signup requests with optional status filter and pagination.
 * Mirrors the legacy CompanyRequestController::actionList.
 * Defaults to showing only pending requests.
 */
export async function listCompanyRequests(
  params: ListCompanyRequestsParams = {},
): Promise<ListCompanyRequestsResult> {
  await requireCapability("admin.read");

  const parsed = listCompanyRequestsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid list parameters",
    );
  }

  const { status, page, limit } = parsed.data;

  const where: Record<string, unknown> = {};
  if (status !== undefined) {
    where.status = status;
  } else {
    where.status = false; // default: pending
  }

  const [requests, total] = await Promise.all([
    prisma.company_request.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.company_request.count({ where: where as any }),
  ]);

  return {
    requests: requests.map((r) => ({
      company_request_uuid: r.company_request_uuid,
      company_name: r.company_name,
      company_email: r.company_email,
      contact_name: r.contact_name,
      contact_position: r.contact_position,
      phone_number: r.phone_number,
      requesting_for: r.requesting_for,
      status: r.status,
      currency_code: r.currency_code,
      created_at: r.created_at?.toISOString() ?? null,
      updated_at: r.updated_at?.toISOString() ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single company signup request by UUID.
 * Mirrors the legacy CompanyRequestController::actionView.
 */
export async function getCompanyRequest(
  params: GetCompanyRequestParams,
): Promise<CompanyRequestItem | null> {
  await requireCapability("admin.read");

  const parsed = getCompanyRequestSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid company request UUID",
    );
  }

  const { uuid } = parsed.data;

  const request = await prisma.company_request.findUnique({
    where: { company_request_uuid: uuid },
  });

  if (!request) return null;

  return {
    company_request_uuid: request.company_request_uuid,
    company_name: request.company_name,
    company_email: request.company_email,
    contact_name: request.contact_name,
    contact_position: request.contact_position,
    phone_number: request.phone_number,
    requesting_for: request.requesting_for,
    status: request.status,
    currency_code: request.currency_code,
    created_at: request.created_at?.toISOString() ?? null,
    updated_at: request.updated_at?.toISOString() ?? null,
  };
}

/**
 * Approve a company signup request.
 * Mirrors the legacy CompanyRequestController::actionApprove.
 */
export async function approveCompanyRequest(
  params: ApproveCompanyRequestParams,
): Promise<CompanyRequestMutationResult> {
  await requireCapability("admin.write");

  const parsed = approveCompanyRequestSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid company request UUID",
    };
  }

  const { uuid } = parsed.data;

  const existing = await prisma.company_request.findUnique({
    where: { company_request_uuid: uuid },
  });

  if (!existing) {
    return { operation: "error", message: "Company request not found" };
  }

  try {
    await prisma.company_request.update({
      where: { company_request_uuid: uuid },
      data: {
        status: true,
        updated_at: new Date(),
      },
    });

    return { operation: "success", message: "Company request approved" };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to approve company request",
    };
  }
}

/**
 * Reject a company signup request.
 * Mirrors the legacy CompanyRequestController::actionReject.
 */
export async function rejectCompanyRequest(
  params: RejectCompanyRequestParams,
): Promise<CompanyRequestMutationResult> {
  await requireCapability("admin.write");

  const parsed = rejectCompanyRequestSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid company request UUID",
    };
  }

  const { uuid } = parsed.data;

  const existing = await prisma.company_request.findUnique({
    where: { company_request_uuid: uuid },
  });

  if (!existing) {
    return { operation: "error", message: "Company request not found" };
  }

  try {
    await prisma.company_request.update({
      where: { company_request_uuid: uuid },
      data: {
        status: false,
        updated_at: new Date(),
      },
    });

    return { operation: "success", message: "Company request rejected" };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to reject company request",
    };
  }
}
