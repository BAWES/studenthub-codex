"use server";

import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  approveCompanyRequestSchema,
  companyRequestItemSchema,
  companyRequestMutationResultSchema,
  createCompanyRequestSchema,
  getCompanyRequestSchema,
  listCompanyRequestsResultSchema,
  listCompanyRequestsSchema,
  rejectCompanyRequestSchema,
  updateCompanyRequestSchema,
} from "./schemas";
import type {
  CompanyRequestItem,
  CompanyRequestMutationResult,
  ListCompanyRequestsResult,
} from "./schemas";

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
// Server actions
// ---------------------------------------------------------------------------

/**
 * List company signup requests with optional status filter and pagination.
 * Mirrors the legacy CompanyRequestController::actionList.
 * Defaults to showing only pending requests.
 */
export async function listCompanyRequests(
  params: z.input<typeof listCompanyRequestsSchema> = {},
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

  const result = {
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

  // Validate output shape
  const outputParsed = listCompanyRequestsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/company-requests] listCompanyRequests output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get a single company signup request by UUID.
 * Mirrors the legacy CompanyRequestController::actionView.
 */
export async function getCompanyRequest(
  params: z.input<typeof getCompanyRequestSchema>,
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

  const result = {
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

  // Validate output shape
  const outputParsed = companyRequestItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/company-requests] getCompanyRequest output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Approve a company signup request.
 * Mirrors the legacy CompanyRequestController::actionApprove.
 */
export async function approveCompanyRequest(
  params: z.input<typeof approveCompanyRequestSchema>,
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
  params: z.input<typeof rejectCompanyRequestSchema>,
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

/**
 * Create a new company signup request.
 * Mirrors the legacy CompanyRequestController::actionCreate.
 * Generates UUID and sets default status to pending (false).
 */
export async function createCompanyRequest(
  params: z.input<typeof createCompanyRequestSchema>,
): Promise<CompanyRequestMutationResult & { company_request_uuid?: string }> {
  await requireCapability("admin.write");

  const parsed = createCompanyRequestSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid company request data",
    };
  }

  const {
    company_name,
    company_email,
    contact_name,
    contact_position,
    phone_number,
    requesting_for,
    currency_code,
    country_id,
    contact_receive_email,
  } = parsed.data;

  try {
    const created = await prisma.company_request.create({
      data: {
        company_request_uuid: crypto.randomUUID(),
        company_name,
        company_email,
        contact_name,
        contact_position: contact_position ?? null,
        phone_number: phone_number ?? null,
        requesting_for: requesting_for ?? null,
        currency_code: currency_code ?? "KWD",
        country_id: country_id ?? null,
        contact_receive_email: contact_receive_email ?? true,
        status: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return {
      operation: "success",
      message: "Company request created",
      company_request_uuid: created.company_request_uuid,
    };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to create company request",
    };
  }
}

/**
 * Update an existing company signup request.
 * Mirrors the legacy CompanyRequestController::actionUpdate.
 * Only provided fields are updated.
 */
export async function updateCompanyRequest(
  params: z.input<typeof updateCompanyRequestSchema>,
): Promise<CompanyRequestMutationResult> {
  await requireCapability("admin.write");

  const parsed = updateCompanyRequestSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid update parameters",
    };
  }

  const { uuid, ...fields } = parsed.data;

  const existing = await prisma.company_request.findUnique({
    where: { company_request_uuid: uuid },
  });

  if (!existing) {
    return { operation: "error", message: "Company request not found" };
  }

  try {
    const updateData: Record<string, unknown> = { updated_at: new Date() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updateData[key] = value;
      }
    }

    await prisma.company_request.update({
      where: { company_request_uuid: uuid },
      data: updateData as any,
    });

    return { operation: "success", message: "Company request updated" };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to update company request",
    };
  }
}
