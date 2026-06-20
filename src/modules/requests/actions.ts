"use server";

import crypto from "node:crypto";
import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  requestListItemSchema,
  listRequestsResultSchema,
  requestUuidResultSchema,
  requestDetailSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listRequestsSchema = z.object({
  status: z
    .enum(["pending", "started", "delivered", "cancelled", "finished_by_recruitment", "re_work"])
    .optional(),
  positionType: z.coerce.number().int().positive().optional(),
  companyId: z.coerce.number().int().positive().optional(),
  contactUuid: z.string().optional(),
  candidateId: z.coerce.number().int().positive().optional(),
  query: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getRequestSchema = z.object({
  requestUuid: z.string().min(1, "Request UUID is required"),
});

const createRequestSchema = z.object({
  companyId: z.number().int().positive(),
  contactUuid: z.string().optional(),
  positionType: z.number().int().positive(),
  positionTitle: z.string().min(1, "Position title is required"),
  numberOfEmployees: z.number().int().positive().optional(),
  location: z.string().optional(),
  additionalInfo: z.string().optional(),
  jobDescription: z.string().min(1, "Job description is required"),
  compensation: z.string().optional(),
  noOfEmployeesPerStory: z.number().int().positive().optional().default(1),
  gender: z.boolean().optional(),
  nationalityId: z.number().int().positive().optional(),
  ourFeesUnit: z.string().optional(),
  ourFees: z.number().optional(),
});

const updateRequestSchema = z.object({
  requestUuid: z.string().min(1, "Request UUID is required"),
  positionType: z.number().int().positive().optional(),
  positionTitle: z.string().optional(),
  numberOfEmployees: z.number().int().positive().optional(),
  location: z.string().optional(),
  additionalInfo: z.string().optional(),
  jobDescription: z.string().optional(),
  compensation: z.string().optional(),
  requestStatus: z
    .enum(["pending", "started", "delivered", "cancelled", "finished_by_recruitment", "re_work"])
    .optional(),
  noOfEmployeesPerStory: z.number().int().positive().optional(),
  gender: z.boolean().optional(),
  nationalityId: z.number().int().positive().optional(),
  ourFeesUnit: z.string().optional(),
  ourFees: z.number().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListRequestsInput = z.input<typeof listRequestsSchema>;
export type CreateRequestInput = z.input<typeof createRequestSchema>;
export type UpdateRequestInput = z.input<typeof updateRequestSchema>;

export type RequestListItem = {
  request_uuid: string;
  company_id: number | null;
  contact_uuid: string | null;
  staff_id: number | null;
  request_position_type: number | null;
  request_position_title: string | null;
  request_job_description: string;
  request_compensation: string;
  request_number_of_employees: number | null;
  no_of_employees_per_story: number;
  request_location: string | null;
  request_additional_info: string | null;
  request_status: string | null;
  request_priority: number | null;
  gender: boolean;
  nationality_id: number | null;
  request_created_datetime: Date;
  request_updated_datetime: Date;
};

export type RequestDetail = {
  request_uuid: string;
  company_id: number | null;
  contact_uuid: string | null;
  staff_id: number | null;
  request_created_by: number | null;
  request_updated_by: number | null;
  request_position_type: number | null;
  request_position_title: string | null;
  request_job_description: string;
  request_compensation: string;
  request_number_of_employees: number | null;
  no_of_employees_per_story: number;
  request_location: string | null;
  request_additional_info: string | null;
  request_status: string | null;
  request_feedback: string | null;
  request_priority: number | null;
  gender: boolean;
  nationality_id: number | null;
  our_fees: number | null;
  our_fees_unit: string | null;
  request_created_datetime: Date;
  request_updated_datetime: Date;
};

export type ListRequestsResult = {
  requests: RequestListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Exported schemas (for shared validation)
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// listRequests
// ---------------------------------------------------------------------------

/**
 * List requests with optional filters, search query, and pagination.
 *
 * Mirrors the legacy Yii2 RequestController::actionList:
 * - Filters by status, position_type, company_id, contact_uuid, candidate_id
 * - Supports full-text search on position title / job description
 * - Excludes hidden_at (soft-deleted) requests
 * - Paginated with configurable page/limit
 */
export async function listRequests(
  params: FormData | ListRequestsInput = {},
): Promise<ListRequestsResult> {
  await requireCapability("request.suggest");

  const raw =
    params instanceof FormData
      ? {
          status: params.get("status"),
          positionType: params.get("positionType"),
          companyId: params.get("companyId"),
          contactUuid: params.get("contactUuid"),
          candidateId: params.get("candidateId"),
          query: params.get("query"),
          page: params.get("page"),
          limit: params.get("limit"),
        }
      : params;

  const parsed = listRequestsSchema.safeParse(raw);
  if (!parsed.success) {
    return { requests: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { status, positionType, companyId, contactUuid, candidateId, query, page, limit } =
    parsed.data;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Record<string, unknown> = { hidden_at: null };

  if (status) {
    where.request_status = status;
  }
  if (positionType !== undefined) {
    where.request_position_type = positionType;
  }
  if (companyId !== undefined) {
    where.company_id = companyId;
  }
  if (contactUuid !== undefined) {
    where.contact_uuid = contactUuid;
  }
  if (candidateId !== undefined) {
    // When filtering by candidate_id, join through suggestions or request_applications
    where.suggestion = { some: { candidate_id: candidateId } };
  }
  if (query) {
    where.OR = [
      { request_position_title: { contains: query, mode: "insensitive" } },
      { request_job_description: { contains: query, mode: "insensitive" } },
    ];
  }

  const [requests, total] = await Promise.all([
    prisma.request.findMany({
      where: where as any,
      orderBy: { request_created_datetime: "desc" },
      skip,
      take: limit,
    }),
    prisma.request.count({ where: where as any }),
  ]);

  const result: ListRequestsResult = {
    requests: requests.map((r: Record<string, unknown>): RequestListItem => {
      const raw = r as any;
      return {
        request_uuid: raw.request_uuid,
        company_id: raw.company_id ?? null,
        contact_uuid: raw.contact_uuid ?? null,
        staff_id: raw.staff_id ?? null,
        request_position_type: raw.request_position_type ?? null,
        request_position_title: raw.request_position_title ?? null,
        request_job_description: raw.request_job_description,
        request_compensation: raw.request_compensation,
        request_number_of_employees: raw.request_number_of_employees ?? null,
        no_of_employees_per_story: raw.no_of_employees_per_story,
        request_location: raw.request_location ?? null,
        request_additional_info: raw.request_additional_info ?? null,
        request_status: raw.request_status ?? null,
        request_priority: raw.request_priority ?? null,
        gender: raw.gender ?? false,
        nationality_id: raw.nationality_id ?? null,
        request_created_datetime: raw.request_created_datetime,
        request_updated_datetime: raw.request_updated_datetime,
      };
    }),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const parsedOutput = listRequestsResultSchema.safeParse(result);
  if (!parsedOutput.success) {
    console.error(
      "[modules/requests] listRequests output validation failed:",
      parsedOutput.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getRequest
// ---------------------------------------------------------------------------

/**
 * Get a single request by UUID with full detail fields.
 * Returns null if not found or soft-deleted (hidden_at set).
 */
export async function getRequest(
  requestUuid: string,
): Promise<RequestDetail | null> {
  await requireCapability("request.suggest");

  const parsed = getRequestSchema.safeParse({ requestUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid request UUID");
  }

  const request = await prisma.request.findFirst({
    where: {
      request_uuid: parsed.data.requestUuid,
    },
  });

  if (!request) return null;

  const raw = request as any;
  const result: RequestDetail = {
    request_uuid: raw.request_uuid,
    company_id: raw.company_id ?? null,
    contact_uuid: raw.contact_uuid ?? null,
    staff_id: raw.staff_id ?? null,
    request_created_by: raw.request_created_by ?? null,
    request_updated_by: raw.request_updated_by ?? null,
    request_position_type: raw.request_position_type ?? null,
    request_position_title: raw.request_position_title ?? null,
    request_job_description: raw.request_job_description,
    request_compensation: raw.request_compensation,
    request_number_of_employees: raw.request_number_of_employees ?? null,
    no_of_employees_per_story: raw.no_of_employees_per_story,
    request_location: raw.request_location ?? null,
    request_additional_info: raw.request_additional_info ?? null,
    request_status: raw.request_status ?? null,
    request_feedback: raw.request_feedback ?? null,
    request_priority: raw.request_priority ?? null,
    gender: raw.gender ?? false,
    nationality_id: raw.nationality_id ?? null,
    our_fees: raw.our_fees ? Number(raw.our_fees) : null,
    our_fees_unit: raw.our_fees_unit ?? null,
    request_created_datetime: raw.request_created_datetime,
    request_updated_datetime: raw.request_updated_datetime,
  };

  // Validate output shape
  const parsedOutput = requestDetailSchema.safeParse(result);
  if (!parsedOutput.success) {
    console.error(
      "[modules/requests] getRequest output validation failed:",
      parsedOutput.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// createRequest
// ---------------------------------------------------------------------------

/**
 * Create a new staffing request.
 *
 * Mirrors the legacy Yii2 RequestController::actionCreate.
 * Generates a request_uuid and sets staff_id from the session.
 */
export async function createRequest(
  data: CreateRequestInput,
): Promise<{ request_uuid: string }> {
  await requireCapability("request.write");

  const parsed = createRequestSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid request data");
  }

  const {
    companyId,
    contactUuid,
    positionType,
    positionTitle,
    numberOfEmployees,
    location,
    additionalInfo,
    jobDescription,
    compensation,
    noOfEmployeesPerStory,
    gender,
    nationalityId,
    ourFeesUnit,
    ourFees,
  } = parsed.data;

  const now = new Date();

  const request = await prisma.request.create({
    data: {
      request_uuid: `req_${crypto.randomUUID()}`,
      company_id: companyId,
      contact_uuid: contactUuid ?? null,
      request_position_type: positionType,
      request_position_title: positionTitle,
      request_job_description: jobDescription,
      request_compensation: compensation ?? "",
      request_number_of_employees: numberOfEmployees ?? null,
      no_of_employees_per_story: noOfEmployeesPerStory ?? 1,
      request_location: location ?? null,
      request_additional_info: additionalInfo ?? null,
      request_status: "pending",
      gender: gender ?? false,
      nationality_id: nationalityId ?? null,
      our_fees: ourFees ?? null,
      our_fees_unit: ourFeesUnit ?? null,
      request_created_datetime: now,
      request_updated_datetime: now,
    } as any,
  });

  revalidatePath("/staff/requests");
  revalidatePath("/admin/requests");

  const result = { request_uuid: request.request_uuid };

  // Validate output shape
  const parsedOutput = requestUuidResultSchema.safeParse(result);
  if (!parsedOutput.success) {
    console.error(
      "[modules/requests] createRequest output validation failed:",
      parsedOutput.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// updateRequest
// ---------------------------------------------------------------------------

/**
 * Update an existing staffing request.
 * Only provided fields are updated — partial update semantics.
 * Throws if the request is not found or soft-deleted.
 */
export async function updateRequest(
  data: UpdateRequestInput,
): Promise<{ request_uuid: string }> {
  await requireCapability("request.write");

  const parsed = updateRequestSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid request data");
  }

  const { requestUuid, ...fields } = parsed.data;

  // Verify the record exists and is not soft-deleted
  const existing = await prisma.request.findFirst({
    where: { request_uuid: requestUuid },
    select: { request_uuid: true },
  });
  if (!existing) {
    throw new Error("Request not found");
  }

  // Build update payload with only provided fields
  const updateData: Record<string, unknown> = {};
  if (fields.positionType !== undefined) updateData.request_position_type = fields.positionType;
  if (fields.positionTitle !== undefined) updateData.request_position_title = fields.positionTitle;
  if (fields.numberOfEmployees !== undefined) updateData.request_number_of_employees = fields.numberOfEmployees;
  if (fields.location !== undefined) updateData.request_location = fields.location;
  if (fields.additionalInfo !== undefined) updateData.request_additional_info = fields.additionalInfo;
  if (fields.jobDescription !== undefined) updateData.request_job_description = fields.jobDescription;
  if (fields.compensation !== undefined) updateData.request_compensation = fields.compensation;
  if (fields.requestStatus !== undefined) updateData.request_status = fields.requestStatus;
  if (fields.noOfEmployeesPerStory !== undefined) updateData.no_of_employees_per_story = fields.noOfEmployeesPerStory;
  if (fields.gender !== undefined) updateData.gender = fields.gender;
  if (fields.nationalityId !== undefined) updateData.nationality_id = fields.nationalityId;
  if (fields.ourFeesUnit !== undefined) updateData.our_fees_unit = fields.ourFeesUnit;
  if (fields.ourFees !== undefined) updateData.our_fees = fields.ourFees;
  updateData.request_updated_datetime = new Date();

  await prisma.request.update({
    where: { request_uuid: requestUuid },
    data: updateData as any,
  });

  revalidatePath("/staff/requests");
  revalidatePath("/admin/requests");

  const result = { request_uuid: requestUuid };

  // Validate output shape
  const parsedOutput = requestUuidResultSchema.safeParse(result);
  if (!parsedOutput.success) {
    console.error(
      "[modules/requests] updateRequest output validation failed:",
      parsedOutput.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// Existing actions (from legacy scaffolding)
// ---------------------------------------------------------------------------

export async function addCandidateSuggestionAction(formData: FormData) {
  const session = await requireCapability("request.suggest");

  const requestUuid = String(formData.get("request_uuid") ?? "");
  const candidateId = Number(formData.get("candidate_id"));
  const reason = String(formData.get("reason") ?? "").trim();
  const basePath = session.role === "admin" ? "/admin/requests" : "/staff/requests";
  const detailPath = `${basePath}/${requestUuid}`;

  if (!requestUuid || !Number.isInteger(candidateId) || candidateId <= 0 || !reason) {
    redirect(`${detailPath}?notice=missing-suggestion` as Route);
  }

  const request = await prisma.request.findFirst({
    where: session.role === "staff" ? { request_uuid: requestUuid, staff_id: Number(session.id) } : { request_uuid: requestUuid },
    select: { request_uuid: true, company_id: true, contact_uuid: true }
  });

  const candidate = await prisma.candidate.findFirst({
    where: { candidate_id: candidateId, deleted: 0 },
    select: { candidate_id: true }
  });

  if (!request || !candidate) {
    redirect(`${detailPath}?notice=not-found` as Route);
  }

  const duplicate = await prisma.suggestion.findFirst({
    where: { request_uuid: requestUuid, candidate_id: candidateId, suggestion_status: 1 },
    select: { suggestion_uuid: true }
  });

  if (duplicate) {
    redirect(`${detailPath}?notice=duplicate-suggestion` as Route);
  }

  const now = new Date();
  const noteUuid = `note_${crypto.randomUUID()}`;
  const suggestionUuid = `suggestion_${crypto.randomUUID()}`;
  const staffId = session.role === "staff" ? Number(session.id) : null;

  await prisma.$transaction([
    prisma.note.create({
      data: {
        note_uuid: noteUuid,
        company_id: request.company_id,
        candidate_id: candidateId,
        request_uuid: requestUuid,
        contact_uuid: request.contact_uuid,
        note_type: "Suggestion",
        note_text: reason,
        created_by: staffId,
        updated_by: staffId,
        note_created_datetime: now,
        note_updated_datetime: now
      }
    }),
    prisma.suggestion.create({
      data: {
        suggestion_uuid: suggestionUuid,
        request_uuid: requestUuid,
        candidate_id: candidateId,
        note_uuid: noteUuid,
        suggestion_status: 1,
        suggestion_datetime: now
      }
    }),
    prisma.note.update({
      where: { note_uuid: noteUuid },
      data: { suggestion_uuid: suggestionUuid }
    }),
    prisma.request.update({
      where: { request_uuid: requestUuid },
      data: { request_updated_datetime: now }
    })
  ]);

  revalidatePath(detailPath);
  revalidatePath(basePath);
  redirect(`${detailPath}?notice=suggestion-added` as Route);
}
