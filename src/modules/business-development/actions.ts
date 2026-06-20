"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  businessDevelopmentActionResultSchema,
  businessDevelopmentItemSchema,
  listBusinessDevelopmentsResultSchema,
} from "./schemas";
import type {
  BusinessDevelopmentActionResult,
  BusinessDevelopmentItem,
  ListBusinessDevelopmentsResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

const listBusinessDevelopmentsInputSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getBusinessDevelopmentInputSchema = z.object({
  uuid: z.string().min(1, "UUID is required"),
});

const createBusinessDevelopmentInputSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  company_email: z.string().email("Invalid email format"),
  contact_name: z.string().min(1, "Contact name is required"),
  contact_position: z.string().optional().default(""),
  phone_number: z.string().optional().default(""),
  requesting_for: z.string().optional().default(""),
  country_id: z.coerce.number().int().positive().optional(),
  currency_code: z.string().length(3).optional().default("KWD"),
  notes: z.string().optional().default(""),
});

const updateBusinessDevelopmentInputSchema = z.object({
  uuid: z.string().min(1, "UUID is required"),
  company_name: z.string().min(1).optional(),
  company_email: z.string().email("Invalid email format").optional(),
  contact_name: z.string().min(1).optional(),
  contact_position: z.string().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  requesting_for: z.string().optional().nullable(),
  country_id: z.coerce.number().int().positive().optional().nullable(),
  currency_code: z.string().length(3).optional(),
  notes: z.string().optional().nullable(),
});

const deleteBusinessDevelopmentInputSchema = z.object({
  uuid: z.string().min(1, "UUID is required"),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Reusable include for company_request country relation. */
const requestIncludes = {
  country: {
    select: { country_name_en: true, country_name_ar: true },
  },
} as const;

/** Map a company_request row to the API shape. */
function toItem(
  row: Awaited<ReturnType<typeof prisma.company_request.findFirst>>,
): BusinessDevelopmentItem | null {
  if (!row) return null;
  const r = row as typeof row & {
    country?: {
      country_name_en: string | null;
      country_name_ar: string | null;
    } | null;
  };
  return {
    company_request_uuid: r.company_request_uuid,
    company_name: r.company_name,
    company_email: r.company_email,
    contact_name: (r as any).contact_name ?? "",
    contact_position: (r as any).contact_position ?? null,
    phone_number: r.phone_number ?? null,
    requesting_for: r.requesting_for ?? null,
    status: r.status ?? null,
    country_id: r.country_id ?? null,
    currency_code: r.currency_code ?? null,
    country_name_en: r.country?.country_name_en ?? null,
    country_name_ar: r.country?.country_name_ar ?? null,
    created_at: r.created_at?.toISOString() ?? null,
    updated_at: r.updated_at?.toISOString() ?? null,
  };
}

/** Validate a BusinessDevelopmentActionResult with safeParse. */
function validateActionResult(
  result: BusinessDevelopmentActionResult,
  context: string,
): BusinessDevelopmentActionResult {
  const parsed = businessDevelopmentActionResultSchema.safeParse(result);
  if (!parsed.success) {
    console.error(
      `[modules/business-development] ${context} output validation failed:`,
      parsed.error.issues,
    );
  }
  return result;
}

/** Validate a single item with safeParse and log on failure. */
function validateItem(
  item: BusinessDevelopmentItem | null,
  context: string,
): BusinessDevelopmentItem | null {
  const parsed = businessDevelopmentItemSchema.nullable().safeParse(item);
  if (!parsed.success) {
    console.error(
      `[modules/business-development] ${context} item output validation failed:`,
      parsed.error.issues,
    );
  }
  return item;
}

// ---------------------------------------------------------------------------
// listBusinessDevelopments
// ---------------------------------------------------------------------------

/**
 * List business development records (company requests) for the current candidate.
 * Finds company requests linked to the candidate's contact record by email.
 */
export async function listBusinessDevelopments(
  params: FormData | z.input<typeof listBusinessDevelopmentsInputSchema> = {},
): Promise<ListBusinessDevelopmentsResult> {
  const session = await requireCapability("candidate.read.own");

  const raw =
    params instanceof FormData
      ? {
          page: params.get("page"),
          limit: params.get("limit"),
        }
      : params;

  const parsed = listBusinessDevelopmentsInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const candidateEmail = (session as any).email ?? "";

  const where = candidateEmail
    ? {
        contact: {
          contact_email: candidateEmail,
        },
      }
    : {};

  const [rows, total] = await Promise.all([
    prisma.company_request.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
      include: requestIncludes,
    }),
    prisma.company_request.count({ where: where as any }),
  ]);

  const items = rows.map((r) => toItem(r)!);

  const result = {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listBusinessDevelopmentsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/business-development] listBusinessDevelopments output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getBusinessDevelopment
// ---------------------------------------------------------------------------

/**
 * Get a single business development record by UUID.
 */
export async function getBusinessDevelopment(
  uuid: string,
): Promise<BusinessDevelopmentItem | null> {
  await requireCapability("candidate.read.own");

  const parsed = getBusinessDevelopmentInputSchema.safeParse({ uuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid UUID");
  }

  const candidateEmail = ((await requireCapability("candidate.read.own")) as any).email ?? "";

  const row = await prisma.company_request.findFirst({
    where: {
      company_request_uuid: parsed.data.uuid,
      contact: candidateEmail
        ? { contact_email: candidateEmail }
        : undefined,
    } as any,
    include: requestIncludes,
  });

  const result = toItem(row);
  return validateItem(result, "getBusinessDevelopment");
}

// ---------------------------------------------------------------------------
// createBusinessDevelopment
// ---------------------------------------------------------------------------

/**
 * Create a new business development record (company request).
 */
export async function createBusinessDevelopment(
  data: z.input<typeof createBusinessDevelopmentInputSchema>,
): Promise<BusinessDevelopmentActionResult> {
  const session = await requireCapability("candidate.profile.edit");

  const parsed = createBusinessDevelopmentInputSchema.safeParse(data);
  if (!parsed.success) {
    return validateActionResult({
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    }, "createBusinessDevelopment");
  }

  const candidateEmail = (session as any).email ?? "";

  try {
    // Find or create a contact record for this candidate
    let contact = candidateEmail
      ? await prisma.contact.findUnique({
          where: { contact_email: candidateEmail },
        })
      : null;

    if (!contact && candidateEmail) {
      contact = await prisma.contact.create({
        data: {
          contact_uuid: crypto.randomUUID(),
          contact_name: (session as any).name ?? "",
          contact_email: candidateEmail,
          contact_created_at: new Date(),
          contact_updated_at: new Date(),
        },
      });
    }

    const row = await prisma.company_request.create({
      data: {
        company_request_uuid: crypto.randomUUID(),
        company_name: parsed.data.company_name,
        company_email: parsed.data.company_email,
        contact_name: parsed.data.contact_name,
        contact_position: parsed.data.contact_position || null,
        phone_number: parsed.data.phone_number || null,
        requesting_for: parsed.data.requesting_for || null,
        country_id: parsed.data.country_id ?? null,
        currency_code: parsed.data.currency_code || "KWD",
        contact_uuid: contact?.contact_uuid ?? null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    revalidatePath("/candidate/business-development");

    return validateActionResult(
      { success: true, uuid: row.company_request_uuid },
      "createBusinessDevelopment",
    );
  } catch (err) {
    return validateActionResult({
      success: false,
      error: err instanceof Error ? err.message : "Failed to create record",
    }, "createBusinessDevelopment");
  }
}

// ---------------------------------------------------------------------------
// updateBusinessDevelopment
// ---------------------------------------------------------------------------

/**
 * Update an existing business development record.
 */
export async function updateBusinessDevelopment(
  data: z.input<typeof updateBusinessDevelopmentInputSchema>,
): Promise<BusinessDevelopmentActionResult> {
  const session = await requireCapability("candidate.profile.edit");

  const parsed = updateBusinessDevelopmentInputSchema.safeParse(data);
  if (!parsed.success) {
    return validateActionResult({
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    }, "updateBusinessDevelopment");
  }

  const candidateEmail = (session as any).email ?? "";

  try {
    // Verify ownership
    const existing = await prisma.company_request.findFirst({
      where: {
        company_request_uuid: parsed.data.uuid,
        contact: candidateEmail
          ? { contact_email: candidateEmail }
          : undefined,
      } as any,
    });

    if (!existing) {
      return validateActionResult(
        { success: false, error: "Record not found or access denied" },
        "updateBusinessDevelopment",
      );
    }

    const { uuid, ...updates } = parsed.data;

    await prisma.company_request.update({
      where: { company_request_uuid: uuid },
      data: {
        ...(updates.company_name !== undefined && {
          company_name: updates.company_name,
        }),
        ...(updates.company_email !== undefined && {
          company_email: updates.company_email,
        }),
        ...(updates.contact_name !== undefined && {
          contact_name: updates.contact_name,
        }),
        ...(updates.contact_position !== undefined && {
          contact_position: updates.contact_position,
        }),
        ...(updates.phone_number !== undefined && {
          phone_number: updates.phone_number,
        }),
        ...(updates.requesting_for !== undefined && {
          requesting_for: updates.requesting_for,
        }),
        ...(updates.country_id !== undefined && {
          country_id: updates.country_id,
        }),
        ...(updates.currency_code !== undefined && {
          currency_code: updates.currency_code,
        }),
        updated_at: new Date(),
      },
    });

    revalidatePath("/candidate/business-development");

    return validateActionResult(
      { success: true, uuid },
      "updateBusinessDevelopment",
    );
  } catch (err) {
    return validateActionResult({
      success: false,
      error: err instanceof Error ? err.message : "Failed to update record",
    }, "updateBusinessDevelopment");
  }
}

// ---------------------------------------------------------------------------
// deleteBusinessDevelopment
// ---------------------------------------------------------------------------

/**
 * Soft-delete (cancel) a business development record.
 * Since company_request uses a boolean status field, we mark it as cancelled (status=false).
 */
export async function deleteBusinessDevelopment(
  data: z.input<typeof deleteBusinessDevelopmentInputSchema>,
): Promise<BusinessDevelopmentActionResult> {
  await requireCapability("candidate.profile.edit");

  const parsed = deleteBusinessDevelopmentInputSchema.safeParse(data);
  if (!parsed.success) {
    return validateActionResult({
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid UUID",
    }, "deleteBusinessDevelopment");
  }

  const candidateEmail = ((await requireCapability("candidate.profile.edit")) as any).email ?? "";

  try {
    // Verify ownership
    const existing = await prisma.company_request.findFirst({
      where: {
        company_request_uuid: parsed.data.uuid,
        contact: candidateEmail
          ? { contact_email: candidateEmail }
          : undefined,
      } as any,
    });

    if (!existing) {
      return validateActionResult(
        { success: false, error: "Record not found or access denied" },
        "deleteBusinessDevelopment",
      );
    }

    await prisma.company_request.update({
      where: { company_request_uuid: parsed.data.uuid },
      data: {
        status: false,
        updated_at: new Date(),
      },
    });

    revalidatePath("/candidate/business-development");

    return validateActionResult(
      { success: true, uuid: parsed.data.uuid },
      "deleteBusinessDevelopment",
    );
  } catch (err) {
    return validateActionResult({
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete record",
    }, "deleteBusinessDevelopment");
  }
}
