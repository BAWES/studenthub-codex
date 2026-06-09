"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listCompanyRequestsSchema = z.object({
  company_id: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const getCompanyRequestDetailSchema = z.object({
  uuid: z.string().min(1, "Request UUID is required"),
});

export const createCompanyRequestSchema = z.object({
  company_id: z.number({ required_error: "Company ID is required" }).int().positive(),
  position_title: z
    .string({ required_error: "Position title is required" })
    .min(1, "Position title is required")
    .max(255),
  compensation: z.string().max(255).optional(),
  number_of_employees: z.number().int().min(1).max(1000).optional(),
  location: z.string().max(255).optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListCompanyRequestsInput = z.input<typeof listCompanyRequestsSchema>;
export type CreateCompanyRequestInput = z.input<typeof createCompanyRequestSchema>;

export type CompanyRequestListItem = {
  request_uuid: string;
  company_id: number | null;
  request_position_title: string | null;
  request_compensation: string | null;
  request_number_of_employees: number | null;
  request_location: string | null;
  request_status: string | null;
  request_created_datetime: Date;
  request_updated_datetime: Date;
  company_name: string | null;
};

export type CompanyRequestDetail = {
  request_uuid: string;
  company_id: number | null;
  contact_uuid: string | null;
  staff_id: number | null;
  request_position_title: string | null;
  request_job_description: string;
  request_compensation: string;
  request_number_of_employees: number | null;
  request_location: string | null;
  request_additional_info: string | null;
  request_status: string | null;
  request_feedback: string | null;
  request_created_datetime: Date;
  request_updated_datetime: Date;
  company_name: string | null;
};

export type ListCompanyRequestsResult = {
  requests: CompanyRequestListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

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
