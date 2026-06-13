"use server";

import { revalidatePath } from "next/cache";
import {
  listBusinessDevelopments as moduleListBusinessDevelopments,
  getBusinessDevelopment as moduleGetBusinessDevelopment,
  createBusinessDevelopment as moduleCreateBusinessDevelopment,
  updateBusinessDevelopment as moduleUpdateBusinessDevelopment,
  deleteBusinessDevelopment as moduleDeleteBusinessDevelopment,
} from "@/modules/business-development/actions";
import {
  listBusinessDevelopmentSchema,
  getBusinessDevelopmentSchema,
  createBusinessDevelopmentSchema,
  updateBusinessDevelopmentSchema,
  deleteBusinessDevelopmentSchema,
  listBusinessDevelopmentResultOutputSchema,
  businessDevelopmentItemOutputSchema,
  businessDevelopmentActionResultOutputSchema,
  type ListBusinessDevelopmentParams,
  type CreateBusinessDevelopmentParams,
  type UpdateBusinessDevelopmentParams,
  type DeleteBusinessDevelopmentParams,
} from "./schemas";

// Re-export types from module
import type {
  BusinessDevelopmentItem,
  ListBusinessDevelopmentsResult,
  BusinessDevelopmentActionResult,
} from "@/modules/business-development/schemas";
export type {
  BusinessDevelopmentItem,
  ListBusinessDevelopmentsResult,
  BusinessDevelopmentActionResult,
};

// ---------------------------------------------------------------------------
// Delegating Server Actions
// ---------------------------------------------------------------------------

/**
 * List business development records (company requests) for the current candidate.
 */
export async function listBusinessDevelopment(
  params: FormData | ListBusinessDevelopmentParams = {},
): Promise<ListBusinessDevelopmentsResult> {
  const parsed = typeof params === "object" && !(params instanceof FormData)
    ? listBusinessDevelopmentSchema.safeParse(params)
    : listBusinessDevelopmentSchema.safeParse({});

  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const result = await moduleListBusinessDevelopments(parsed.data);

  // Validate output shape
  const outputParsed = listBusinessDevelopmentResultOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/business-development] listBusinessDevelopment output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get a single business development record by UUID.
 */
export async function getBusinessDevelopment(
  uuid: string,
): Promise<BusinessDevelopmentItem | null> {
  const parsed = getBusinessDevelopmentSchema.safeParse({ uuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid UUID");
  }

  const result = await moduleGetBusinessDevelopment(parsed.data.uuid);

  // Validate output shape
  const outputParsed = businessDevelopmentItemOutputSchema.nullable().safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/business-development] getBusinessDevelopment output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Create a new business development record (company request).
 */
export async function createBusinessDevelopment(
  data: CreateBusinessDevelopmentParams,
): Promise<BusinessDevelopmentActionResult> {
  const parsed = createBusinessDevelopmentSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const result = await moduleCreateBusinessDevelopment(parsed.data);

  // Validate output shape
  const outputParsed = businessDevelopmentActionResultOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/business-development] createBusinessDevelopment output validation failed:",
      outputParsed.error.issues,
    );
  }

  if (result.success) {
    revalidatePath("/candidate/business-development");
  }

  return result;
}

/**
 * Update an existing business development record.
 */
export async function updateBusinessDevelopment(
  data: UpdateBusinessDevelopmentParams,
): Promise<BusinessDevelopmentActionResult> {
  const parsed = updateBusinessDevelopmentSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const result = await moduleUpdateBusinessDevelopment(parsed.data);

  // Validate output shape
  const outputParsed = businessDevelopmentActionResultOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/business-development] updateBusinessDevelopment output validation failed:",
      outputParsed.error.issues,
    );
  }

  if (result.success) {
    revalidatePath("/candidate/business-development");
  }

  return result;
}

/**
 * Soft-delete (cancel) a business development record.
 */
export async function deleteBusinessDevelopment(
  data: DeleteBusinessDevelopmentParams,
): Promise<BusinessDevelopmentActionResult> {
  const parsed = deleteBusinessDevelopmentSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid UUID",
    };
  }

  const result = await moduleDeleteBusinessDevelopment(parsed.data);

  // Validate output shape
  const outputParsed = businessDevelopmentActionResultOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/business-development] deleteBusinessDevelopment output validation failed:",
      outputParsed.error.issues,
    );
  }

  if (result.success) {
    revalidatePath("/candidate/business-development");
  }

  return result;
}
