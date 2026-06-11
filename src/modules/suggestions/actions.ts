"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listSuggestionsResultSchema,
  suggestionActionResultSchema,
  suggestionListItemSchema,
} from "./schemas";
import type {
  SuggestionListItem,
  SuggestionListResult,
  UpdateSuggestionStatusResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listSuggestionsSchema = z.object({
  requestUuid: z.string().max(60).optional(),
  storyUuid: z.string().max(60).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export type ListSuggestionsParams = z.input<typeof listSuggestionsSchema>;

const updateSuggestionStatusSchema = z.object({
  suggestionUuid: z.string().min(1).max(60),
  status: z.number().int().min(0).max(3),
});

export type UpdateSuggestionStatusParams = z.input<
  typeof updateSuggestionStatusSchema
>;

// ---------------------------------------------------------------------------
// Filter builder
// ---------------------------------------------------------------------------

type SuggestionWhereInput = {
  request_uuid?: string;
  story_uuid?: string;
};

function buildSuggestionFilter(params: {
  requestUuid?: string;
  storyUuid?: string;
}): SuggestionWhereInput {
  const where: SuggestionWhereInput = {};

  if (params.requestUuid && params.requestUuid.trim()) {
    where.request_uuid = params.requestUuid;
  }

  if (params.storyUuid && params.storyUuid.trim()) {
    where.story_uuid = params.storyUuid;
  }

  return where;
}

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List suggestions with optional filters (requestUuid, storyUuid) and
 * pagination. Ordered by suggestion_datetime DESC.
 * Mirrors the legacy Yii2 admin SuggestionController::actionList().
 *
 * @param params - Optional filter and pagination parameters
 * @returns Paginated suggestion list with total count
 */
export async function listSuggestions(
  params: ListSuggestionsParams = {},
): Promise<SuggestionListResult> {
  await requireCapability("suggestion.read");

  const parsed = listSuggestionsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid list parameters",
    );
  }

  const { requestUuid, storyUuid, page = 1, limit = 20 } = parsed.data;
  const where = buildSuggestionFilter({ requestUuid, storyUuid });

  const [suggestions, total] = await Promise.all([
    prisma.suggestion.findMany({
      where: where as any,
      orderBy: { suggestion_datetime: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        suggestion_uuid: true,
        request_uuid: true,
        candidate_id: true,
        fulltimer_uuid: true,
        note_uuid: true,
        story_uuid: true,
        suggestion_status: true,
        mail_to_company: true,
        suggestion_datetime: true,
      },
    }),
    prisma.suggestion.count({ where: where as any }),
  ]);

  const result = {
    suggestions: suggestions as SuggestionListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listSuggestionsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/suggestions] listSuggestions output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Update a suggestion's status (pending=0, suggested=1, rejected=2,
 * accepted=3). Mirrors the legacy Yii2 admin
 * SuggestionController::actionChangeStatus($id).
 *
 * @param params - Object with suggestionUuid and status (0-3)
 * @returns Operation result with message
 */
export async function updateSuggestionStatus(
  params: UpdateSuggestionStatusParams,
): Promise<UpdateSuggestionStatusResult> {
  await requireCapability("suggestion.write");

  const parsed = updateSuggestionStatusSchema.safeParse(params);
  if (!parsed.success) {
    const result: UpdateSuggestionStatusResult = {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid parameters",
    };
    const outputParsed = suggestionActionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/suggestions] updateSuggestionStatus output validation failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  }

  const { suggestionUuid, status } = parsed.data;

  const existing = await prisma.suggestion.findUnique({
    where: { suggestion_uuid: suggestionUuid },
    select: { suggestion_uuid: true },
  });

  if (!existing) {
    const result: UpdateSuggestionStatusResult = {
      operation: "error",
      message: "Invalid Suggestion",
    };
    const outputParsed = suggestionActionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/suggestions] updateSuggestionStatus output validation failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  }

  await prisma.suggestion.update({
    where: { suggestion_uuid: suggestionUuid },
    data: { suggestion_status: status },
  });

  revalidatePath("/admin/requests");
  revalidatePath("/staff/requests");

  const result: UpdateSuggestionStatusResult = {
    operation: "success",
    message: "Suggestion status updated successfully",
  };
  const outputParsed = suggestionActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/suggestions] updateSuggestionStatus output validation failed:",
      outputParsed.error.issues,
    );
  }
  return result;
}
