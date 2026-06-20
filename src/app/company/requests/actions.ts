"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listCompanyRequestsSchema,
  getCompanyRequestDetailSchema,
  createCompanyRequestSchema,
} from "./schemas";
import type {
  ListCompanyRequestsInput,
  CreateCompanyRequestInput,
  CompanyRequestListItem,
  CompanyRequestDetail,
  ListCompanyRequestsResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List company requests with optional company filter and pagination.
 * Mirrors the legacy RequestController::actionList().
 */
export async function listCompanyRequests(
  params: ListCompanyRequestsInput = {},
): Promise<ListCompanyRequestsResult> {
  await requireCapability("request.read.linked");

  const parsed = listCompanyRequestsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { company_id, page = 1, limit = 20 } = parsed.data;

  const where: Record<string, unknown> = {};
  if (company_id !== undefined) {
    where.company_id = company_id;
  }

  const [requests, total] = await Promise.all([
    prisma.request.findMany({
      where,
      select: {
        request_uuid: true,
        company_id: true,
        request_position_title: true,
        request_compensation: true,
        request_number_of_employees: true,
        request_location: true,
        request_status: true,
        request_created_datetime: true,
        request_updated_datetime: true,
        company: { select: { company_name: true } },
      },
      orderBy: { request_created_datetime: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.request.count({ where }),
  ]);

  return {
    requests: requests.map((r) => ({
      request_uuid: r.request_uuid,
      company_id: r.company_id,
      request_position_title: r.request_position_title,
      request_compensation: r.request_compensation,
      request_number_of_employees: r.request_number_of_employees,
      request_location: r.request_location,
      request_status: r.request_status,
      request_created_datetime: r.request_created_datetime,
      request_updated_datetime: r.request_updated_datetime,
      company_name: r.company?.company_name ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single company request by UUID.
 * Mirrors the legacy RequestController::actionDetail().
 */
export async function getCompanyRequestDetail(
  uuid: string,
): Promise<CompanyRequestDetail | null> {
  await requireCapability("request.read.linked");

  const parsed = getCompanyRequestDetailSchema.safeParse({ uuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid request UUID");
  }

  const request = await prisma.request.findUnique({
    where: { request_uuid: uuid },
    select: {
      request_uuid: true,
      company_id: true,
      contact_uuid: true,
      staff_id: true,
      request_position_title: true,
      request_job_description: true,
      request_compensation: true,
      request_number_of_employees: true,
      request_location: true,
      request_additional_info: true,
      request_status: true,
      request_feedback: true,
      request_created_datetime: true,
      request_updated_datetime: true,
      company: { select: { company_name: true } },
    },
  });

  if (!request) return null;

  return {
    request_uuid: request.request_uuid,
    company_id: request.company_id,
    contact_uuid: request.contact_uuid,
    staff_id: request.staff_id,
    request_position_title: request.request_position_title,
    request_job_description: request.request_job_description,
    request_compensation: request.request_compensation,
    request_number_of_employees: request.request_number_of_employees,
    request_location: request.request_location,
    request_additional_info: request.request_additional_info,
    request_status: request.request_status,
    request_feedback: request.request_feedback,
    request_created_datetime: request.request_created_datetime,
    request_updated_datetime: request.request_updated_datetime,
    company_name: request.company?.company_name ?? null,
  };
}

/**
 * Create a new company request.
 * Mirrors the legacy RequestController::actionCreate().
 */
export async function createCompanyRequest(
  data: CreateCompanyRequestInput,
): Promise<{ request_uuid: string }> {
  await requireCapability("request.create");

  const parsed = createCompanyRequestSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid request data");
  }

  const { company_id, position_title, compensation, number_of_employees, location } =
    parsed.data;

  const request = await prisma.request.create({
    data: {
      request_uuid: crypto.randomUUID(),
      company_id,
      request_position_title: position_title,
      request_compensation: compensation ?? "",
      request_number_of_employees: number_of_employees ?? null,
      request_location: location ?? null,
      request_job_description: "",
      request_status: "pending",
      request_created_datetime: new Date(),
      request_updated_datetime: new Date(),
    },
    select: { request_uuid: true },
  });

  revalidatePath("/company/requests");
  return { request_uuid: request.request_uuid };
}

// ---------------------------------------------------------------------------
// Row helpers for DataTable pages — replaces imports from @/modules/workspace/data
// ---------------------------------------------------------------------------

type CompanyRequestRow = {
  id: string;
  title: string;
  company: string;
  owner: string;
  seats: number;
  status: string;
  updated: string;
};

/**
 * List company request rows for the DataTable on the company/requests page.
 * Mirrors the legacy getCompanyRequestRows() from @/modules/workspace/data/company.ts.
 */
export async function getCompanyRequestRows(contactUuid: string): Promise<CompanyRequestRow[]> {
  await requireCapability("request.read.linked");

  const companyLinks = await prisma.company_contact.findMany({
    where: { contact_uuid: contactUuid, allow_access: true },
    select: { company_id: true },
  });
  const companyIds = companyLinks.map((l) => l.company_id).filter((id): id is number => Boolean(id));
  if (companyIds.length === 0) return [];

  const rows = await prisma.request.findMany({
    where: { company_id: { in: companyIds } },
    orderBy: { request_updated_datetime: "desc" },
    take: 80,
    select: {
      request_uuid: true,
      request_position_title: true,
      request_status: true,
      request_number_of_employees: true,
      request_updated_datetime: true,
      company: { select: { company_name: true } },
      staff: { select: { staff_name: true } },
    },
  });

  return rows.map((row) => ({
    id: row.request_uuid,
    title: row.request_position_title ?? "Untitled request",
    company: row.company?.company_name ?? "No company",
    owner: row.staff?.staff_name ?? "Unassigned",
    seats: row.request_number_of_employees ?? 0,
    status: row.request_status ?? "No status",
    updated: row.request_updated_datetime.toISOString().slice(0, 10).replace(/-/g, "/"),
  }));
}
