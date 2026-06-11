"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  standupQuestionItemSchema,
  listStandupQuestionsResultSchema,
  mutateResultSchema,
  type StandupQuestionItem,
  type ListStandupQuestionsResult,
  type MutateResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listStandupQuestionsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const getStandupQuestionSchema = z.object({
  uuid: z.string().min(1, "UUID is required"),
});

const createStandupQuestionSchema = z.object({
  question: z.string().min(1, "Question text is required").max(255),
});

const updateStandupQuestionSchema = z.object({
  uuid: z.string().min(1, "UUID is required"),
  question: z.string().min(1, "Question text is required").max(255),
});

// ---------------------------------------------------------------------------
// Types (input params)
// ---------------------------------------------------------------------------

export type ListStandupQuestionsParams = z.input<typeof listStandupQuestionsSchema>;
export type GetStandupQuestionParams = z.input<typeof getStandupQuestionSchema>;
export type CreateStandupQuestionParams = z.input<typeof createStandupQuestionSchema>;
export type UpdateStandupQuestionParams = z.input<typeof updateStandupQuestionSchema>;

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List all daily standup questions with pagination.
 * Mirrors the legacy Yii2 Admin DailyStandupQuestionController::actionList().
 */
export async function listStandupQuestions(
  params: ListStandupQuestionsParams = {},
): Promise<ListStandupQuestionsResult> {
  await requireCapability("admin.system");

  const parsed = listStandupQuestionsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { page = 1, limit = 20 } = parsed.data;

  const [standupQuestions, total] = await Promise.all([
    prisma.daily_standup_question.findMany({
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.daily_standup_question.count(),
  ]);

  const result = {
    standupQuestions: standupQuestions as StandupQuestionItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listStandupQuestionsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/standup-questions] listStandupQuestions output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get a single daily standup question by UUID.
 * Mirrors the legacy Yii2 Admin DailyStandupQuestionController::actionView($id).
 */
export async function getStandupQuestion(
  params: GetStandupQuestionParams,
): Promise<StandupQuestionItem> {
  await requireCapability("admin.system");

  const parsed = getStandupQuestionSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid parameters");
  }

  const { uuid } = parsed.data;

  const question = await prisma.daily_standup_question.findUnique({
    where: { question_uuid: uuid },
  });

  if (!question) {
    throw new Error("Standup question not found");
  }

  const result = question as StandupQuestionItem;

  // Validate output shape
  const outputParsed = standupQuestionItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/standup-questions] getStandupQuestion output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Create a new daily standup question.
 * Mirrors the legacy Yii2 Admin DailyStandupQuestionController::actionCreate().
 * Generates a UUID with 'question_' prefix matching the legacy convention.
 */
export async function createStandupQuestion(
  params: CreateStandupQuestionParams,
): Promise<MutateResult> {
  await requireCapability("admin.system");

  const parsed = createStandupQuestionSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid question data",
    };
  }

  const { question } = parsed.data;

  try {
    // Generate UUID matching the legacy 'question_' prefix convention
    const crypto = await import("node:crypto");
    const questionUuid = `question_${crypto.randomUUID()}`;

    await prisma.daily_standup_question.create({
      data: {
        question_uuid: questionUuid,
        question,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return {
      operation: "success",
      message: "Daily standup question created successfully",
    };
  } catch (err) {
    return {
      operation: "error",
      message:
        err instanceof Error ? err.message : "Failed to create standup question",
    };
  }
}

/**
 * Update an existing daily standup question.
 * Mirrors the legacy Yii2 Admin DailyStandupQuestionController::actionUpdate($id).
 */
export async function updateStandupQuestion(
  params: UpdateStandupQuestionParams,
): Promise<MutateResult> {
  await requireCapability("admin.system");

  const parsed = updateStandupQuestionSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid update data",
    };
  }

  const { uuid, question } = parsed.data;

  try {
    const existing = await prisma.daily_standup_question.findUnique({
      where: { question_uuid: uuid },
    });

    if (!existing) {
      return {
        operation: "error",
        message: "Standup question not found",
      };
    }

    await prisma.daily_standup_question.update({
      where: { question_uuid: uuid },
      data: { question },
    });

    return {
      operation: "success",
      message: "Daily standup question updated successfully",
    };
  } catch (err) {
    return {
      operation: "error",
      message:
        err instanceof Error ? err.message : "Failed to update standup question",
    };
  }
}
