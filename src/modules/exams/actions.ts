"use server";

// ---------------------------------------------------------------------------
// Exams — server actions for exam, exam_question, exam_question_answer, exam_question_choice
// ---------------------------------------------------------------------------
// Ported from Yii2 models: Exam, ExamQuestion, ExamQuestionAnswer, ExamQuestionChoice
//
// Actions:
//   - listExams           — paginated listing with optional search
//   - getExam             — single exam with questions and choices
//   - createExam          — create exam with optional questions and choices
//   - updateExam          — update exam metadata
//   - deleteExam          — soft-delete an exam
//   - listCandidateExams  — list exams assigned to a candidate
//   - submitExamAnswers   — candidate submits answers for an exam
//   - assignExamToCandidate — staff assigns an exam to a candidate
// ---------------------------------------------------------------------------

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability, requireRoleCapability } from "@/modules/auth/session";
import {
  listExamsSchema,
  getExamSchema,
  createExamSchema,
  updateExamSchema,
  deleteExamSchema,
  listCandidateExamsSchema,
  submitExamAnswersSchema,
  assignExamToCandidateSchema,
  examRowSchema,
  examDetailSchema,
  listExamsResultSchema,
  examActionResponseSchema,
  submitExamAnswersResultSchema,
  listCandidateExamsResultSchema,
  type ListExamsInput,
  type GetExamInput,
  type CreateExamInput,
  type UpdateExamInput,
  type DeleteExamInput,
  type ListCandidateExamsInput,
  type SubmitExamAnswersInput,
  type AssignExamToCandidateInput,
  type ExamRow,
  type ExamDetail,
  type ExamActionResponse,
  type SubmitExamAnswersResult,
  type ListCandidateExamsResult,
} from "./schemas";

// ===========================================================================
// listExams
// ===========================================================================

/**
 * List all exams with pagination and optional search by title.
 * Requires admin.read capability.
 */
export async function listExams(
  input: ListExamsInput = {},
): Promise<{
  exams: ExamRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  await requireCapability("admin.read");

  const parsed = listExamsSchema.safeParse(input);
  if (!parsed.success) {
    return { exams: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, q, staffId } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { is_deleted: false };
  if (q && q.trim().length > 0) {
    where.OR = [
      { title_en: { contains: q.trim() } },
      { title_ar: { contains: q.trim() } },
    ];
  }
  if (staffId !== undefined) {
    where.staff_id = staffId;
  }

  const [exams, total] = await Promise.all([
    prisma.exam.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
      include: {
        _count: { select: { exam_question: true } },
      },
    }),
    prisma.exam.count({ where: where as any }),
  ]);

  const result = {
    exams: exams.map((e): ExamRow => ({
      exam_uuid: e.exam_uuid,
      title_en: e.title_en,
      title_ar: e.title_ar ?? null,
      description_en: e.description_en ?? null,
      description_ar: e.description_ar ?? null,
      staff_id: e.staff_id ?? null,
      is_deleted: e.is_deleted ?? null,
      created_at: e.created_at?.toISOString() ?? null,
      updated_at: e.updated_at?.toISOString() ?? null,
      question_count: e._count?.exam_question ?? 0,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listExamsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[modules/exams] listExams output validation failed:", outputParsed.error.issues);
  }

  return result;
}

// ===========================================================================
// getExam
// ===========================================================================

/**
 * Get a single exam by UUID with its questions and choices.
 * Requires admin.read capability.
 */
export async function getExam(examUuid: string): Promise<ExamDetail | null> {
  await requireCapability("admin.read");

  const parsed = getExamSchema.safeParse({ examUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid exam UUID");
  }

  const exam = await prisma.exam.findUnique({
    where: { exam_uuid: parsed.data.examUuid },
    include: {
      exam_question: {
        where: { is_deleted: false },
        orderBy: { question_sort_order: "asc" },
        include: {
          exam_question_choice: {
            where: { is_deleted: false },
            orderBy: { choice_sort_order: "asc" },
          },
        },
      },
    },
  });

  if (!exam) return null;

  const detailResult: ExamDetail = {
    exam_uuid: exam.exam_uuid,
    title_en: exam.title_en,
    title_ar: exam.title_ar ?? null,
    description_en: exam.description_en ?? null,
    description_ar: exam.description_ar ?? null,
    staff_id: exam.staff_id ?? null,
    is_deleted: exam.is_deleted ?? null,
    created_at: exam.created_at?.toISOString() ?? null,
    updated_at: exam.updated_at?.toISOString() ?? null,
    questions: exam.exam_question.map((q) => ({
      question_uuid: q.question_uuid,
      question_type: q.question_type ?? null,
      question_en: q.question_en,
      question_ar: q.question_ar ?? null,
      question_file_extensions: q.question_file_extensions ?? null,
      question_file_maxsize: q.question_file_maxsize ?? null,
      question_sort_order: q.question_sort_order ?? null,
      choices: q.exam_question_choice.map((c) => ({
        choice_uuid: c.choice_uuid,
        choice_value_en: c.choice_value_en,
        choice_value_ar: c.choice_value_ar ?? null,
        choice_sort_order: c.choice_sort_order ?? null,
      })),
    })),
  };

  const outputParsed = examDetailSchema.safeParse(detailResult);
  if (!outputParsed.success) {
    console.error("[modules/exams] getExam output validation failed:", outputParsed.error.issues);
  }

  return detailResult;
}

// ===========================================================================
// createExam
// ===========================================================================

/**
 * Create a new exam with optional questions and choices.
 * Requires admin.write capability.
 */
export async function createExam(input: CreateExamInput): Promise<ExamActionResponse> {
  await requireCapability("admin.write");

  const parsed = createExamSchema.safeParse(input);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    const now = new Date();
    const examUuid = crypto.randomUUID();

    const exam = await prisma.exam.create({
      data: {
        exam_uuid: examUuid,
        title_en: parsed.data.titleEn,
        title_ar: parsed.data.titleAr ?? null,
        description_en: parsed.data.descriptionEn ?? null,
        description_ar: parsed.data.descriptionAr ?? null,
        staff_id: parsed.data.staffId ?? null,
        created_at: now,
        updated_at: now,
      },
      include: {
        _count: { select: { exam_question: true } },
      },
    });

    // Create questions and choices if provided
    if (parsed.data.questions.length > 0) {
      for (const q of parsed.data.questions) {
        const questionUuid = crypto.randomUUID();
        await prisma.exam_question.create({
          data: {
            question_uuid: questionUuid,
            exam_uuid: examUuid,
            question_type: q.questionType ?? null,
            question_en: q.questionEn,
            question_ar: q.questionAr ?? null,
            question_file_extensions: q.questionFileExtensions ?? null,
            question_file_maxsize: q.questionFileMaxsize ?? null,
            question_sort_order: q.questionSortOrder ?? null,
            created_at: now,
            updated_at: now,
          },
        });

        if (q.choices.length > 0) {
          await prisma.exam_question_choice.createMany({
            data: q.choices.map((c) => ({
              choice_uuid: crypto.randomUUID(),
              question_uuid: questionUuid,
              choice_value_en: c.choiceValueEn,
              choice_value_ar: c.choiceValueAr ?? null,
              choice_sort_order: c.choiceSortOrder ?? null,
              created_at: now,
              updated_at: now,
            })),
          });
        }
      }
    }

    revalidatePath("/admin/exams");

    const successResult: ExamActionResponse = {
      operation: "success",
      message: `Exam "${exam.title_en}" created with ${parsed.data.questions.length} question(s)`,
      data: {
        exam_uuid: exam.exam_uuid,
        title_en: exam.title_en,
        title_ar: exam.title_ar ?? null,
        description_en: exam.description_en ?? null,
        description_ar: exam.description_ar ?? null,
        staff_id: exam.staff_id ?? null,
        is_deleted: exam.is_deleted ?? null,
        created_at: exam.created_at?.toISOString() ?? null,
        updated_at: exam.updated_at?.toISOString() ?? null,
        question_count: exam._count?.exam_question ?? 0,
      },
    };

    const outputParsed = examActionResponseSchema.safeParse(successResult);
    if (!outputParsed.success) {
      console.error("[modules/exams] createExam output validation failed:", outputParsed.error.issues);
    }

    return successResult;
  } catch (err) {
    const errorResult: ExamActionResponse = {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to create exam",
    };

    const outputParsed = examActionResponseSchema.safeParse(errorResult);
    if (!outputParsed.success) {
      console.error("[modules/exams] createExam (error) output failed:", outputParsed.error.issues);
    }

    return errorResult;
  }
}

// ===========================================================================
// updateExam
// ===========================================================================

/**
 * Update exam metadata. Only provided fields are modified.
 * Requires admin.write capability.
 */
export async function updateExam(input: UpdateExamInput): Promise<ExamActionResponse> {
  await requireCapability("admin.write");

  const parsed = updateExamSchema.safeParse(input);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const existing = await prisma.exam.findUnique({
    where: { exam_uuid: parsed.data.examUuid, is_deleted: false },
    select: { exam_uuid: true, title_en: true },
  });

  if (!existing) {
    return { operation: "error", message: "Exam not found" };
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date(),
  };

  if (parsed.data.titleEn !== undefined) updateData.title_en = parsed.data.titleEn;
  if (parsed.data.titleAr !== undefined) updateData.title_ar = parsed.data.titleAr;
  if (parsed.data.descriptionEn !== undefined) updateData.description_en = parsed.data.descriptionEn;
  if (parsed.data.descriptionAr !== undefined) updateData.description_ar = parsed.data.descriptionAr;

  try {
    const exam = await prisma.exam.update({
      where: { exam_uuid: parsed.data.examUuid },
      data: updateData as any,
      include: {
        _count: { select: { exam_question: true } },
      },
    });

    revalidatePath("/admin/exams");
    revalidatePath(`/admin/exams/${parsed.data.examUuid}`);

    const successResult: ExamActionResponse = {
      operation: "success",
      message: `Exam "${exam.title_en}" updated`,
      data: {
        exam_uuid: exam.exam_uuid,
        title_en: exam.title_en,
        title_ar: exam.title_ar ?? null,
        description_en: exam.description_en ?? null,
        description_ar: exam.description_ar ?? null,
        staff_id: exam.staff_id ?? null,
        is_deleted: exam.is_deleted ?? null,
        created_at: exam.created_at?.toISOString() ?? null,
        updated_at: exam.updated_at?.toISOString() ?? null,
        question_count: exam._count?.exam_question ?? 0,
      },
    };

    const outputParsed = examActionResponseSchema.safeParse(successResult);
    if (!outputParsed.success) {
      console.error("[modules/exams] updateExam output failed:", outputParsed.error.issues);
    }

    return successResult;
  } catch (err) {
    const errorResult: ExamActionResponse = {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to update exam",
    };

    const outputParsed = examActionResponseSchema.safeParse(errorResult);
    if (!outputParsed.success) {
      console.error("[modules/exams] updateExam (error) output failed:", outputParsed.error.issues);
    }

    return errorResult;
  }
}

// ===========================================================================
// deleteExam (soft delete)
// ===========================================================================

/**
 * Soft-delete an exam. Only succeeds if the exam exists and is not already deleted.
 * Requires admin.write capability.
 */
export async function deleteExam(input: DeleteExamInput): Promise<ExamActionResponse> {
  await requireCapability("admin.write");

  const parsed = deleteExamSchema.safeParse(input);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const existing = await prisma.exam.findUnique({
    where: { exam_uuid: parsed.data.examUuid },
    select: { exam_uuid: true, title_en: true, is_deleted: true },
  });

  if (!existing) {
    return { operation: "error", message: "Exam not found" };
  }

  if (existing.is_deleted) {
    return { operation: "error", message: "Exam is already deleted" };
  }

  try {
    await prisma.exam.update({
      where: { exam_uuid: parsed.data.examUuid },
      data: { is_deleted: true, updated_at: new Date() },
    });

    revalidatePath("/admin/exams");

    return { operation: "success", message: `Exam "${existing.title_en}" deleted` };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to delete exam",
    };
  }
}

// ===========================================================================
// listCandidateExams
// ===========================================================================

/**
 * List exams that have been assigned to a specific candidate (via exam_question_answer entries).
 * Requires candidate.read capability.
 */
export async function listCandidateExams(
  input: ListCandidateExamsInput,
): Promise<ListCandidateExamsResult> {
  await requireRoleCapability("candidate", "candidate.read");

  const parsed = listCandidateExamsSchema.safeParse(input);
  if (!parsed.success) {
    return { exams: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { candidateId, page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  // Find exams that have answer records for this candidate
  const answeredExamUuids = await prisma.exam_question_answer.findMany({
    where: { candidate_id: candidateId, is_deleted: false },
    select: { exam_uuid: true },
    distinct: ["exam_uuid"],
  });

  const examUuids = answeredExamUuids
    .map((e) => e.exam_uuid)
    .filter((uuid): uuid is string => uuid !== null);

  const where = examUuids.length > 0
    ? { exam_uuid: { in: examUuids as string[] }, is_deleted: false }
    : { is_deleted: false };

  const [exams, total] = await Promise.all([
    prisma.exam.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
      include: {
        _count: { select: { exam_question: true } },
      },
    }),
    prisma.exam.count({ where: where as any }),
  ]);

  const result = {
    exams: exams.map((e): ExamRow => ({
      exam_uuid: e.exam_uuid,
      title_en: e.title_en,
      title_ar: e.title_ar ?? null,
      description_en: e.description_en ?? null,
      description_ar: e.description_ar ?? null,
      staff_id: e.staff_id ?? null,
      is_deleted: e.is_deleted ?? null,
      created_at: e.created_at?.toISOString() ?? null,
      updated_at: e.updated_at?.toISOString() ?? null,
      question_count: e._count?.exam_question ?? 0,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listCandidateExamsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[modules/exams] listCandidateExams output failed:", outputParsed.error.issues);
  }

  return result;
}

// ===========================================================================
// submitExamAnswers
// ===========================================================================

/**
 * Submit a candidate's answers for an exam.
 * Requires candidate.write capability.
 * Creates exam_question_answer records for each answer.
 */
export async function submitExamAnswers(
  input: SubmitExamAnswersInput,
): Promise<SubmitExamAnswersResult> {
  await requireRoleCapability("candidate", "candidate.write");

  const parsed = submitExamAnswersSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { examUuid, candidateId, answers } = parsed.data;
  const now = new Date();

  // Verify the exam exists
  const exam = await prisma.exam.findUnique({
    where: { exam_uuid: examUuid, is_deleted: false },
    select: { exam_uuid: true },
  });

  if (!exam) {
    throw new Error("Exam not found or has been deleted");
  }

  // Verify questions belong to this exam and fetch their metadata
  const questionUuids = answers.map((a) => a.questionUuid);
  const questions = await prisma.exam_question.findMany({
    where: { question_uuid: { in: questionUuids }, exam_uuid: examUuid },
    select: { question_uuid: true, question_type: true, question_en: true, question_ar: true },
  });

  const questionMap = new Map(questions.map((q) => [q.question_uuid, q]));

  // Create answer records
  const answerRecords = answers.map((a) => {
    const q = questionMap.get(a.questionUuid);
    if (!q) {
      throw new Error(`Question ${a.questionUuid} not found in exam ${examUuid}`);
    }
    return {
      answer_uuid: crypto.randomUUID(),
      exam_uuid: examUuid,
      candidate_id: candidateId,
      question_uuid: a.questionUuid,
      question_type: q.question_type ?? null,
      question_en: q.question_en,
      question_ar: q.question_ar ?? null,
      answer: a.answer ?? null,
      created_at: now,
      updated_at: now,
    };
  });

  await prisma.exam_question_answer.createMany({ data: answerRecords });

  revalidatePath(`/candidate/exams/${examUuid}`);

  const result: SubmitExamAnswersResult = {
    answerCount: answerRecords.length,
    examUuid,
  };

  const outputParsed = submitExamAnswersResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[modules/exams] submitExamAnswers output failed:", outputParsed.error.issues);
  }

  return result;
}

// ===========================================================================
// assignExamToCandidate
// ===========================================================================

/**
 * Assign an exam to a candidate by pre-creating empty answer placeholders.
 * Requires staff-level capability.
 */
export async function assignExamToCandidate(
  input: AssignExamToCandidateInput,
): Promise<ExamActionResponse> {
  await requireCapability("request.suggest");

  const parsed = assignExamToCandidateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { examUuid, candidateId } = parsed.data;

  // Verify the exam exists and is not deleted
  const exam = await prisma.exam.findUnique({
    where: { exam_uuid: examUuid, is_deleted: false },
    select: {
      exam_uuid: true,
      title_en: true,
      exam_question: {
        where: { is_deleted: false },
        select: { question_uuid: true, question_type: true, question_en: true, question_ar: true },
      },
    },
  });

  if (!exam) {
    return { operation: "error", message: "Exam not found or has been deleted" };
  }

  try {
    const now = new Date();
    const answerRecords = exam.exam_question.map((q) => ({
      answer_uuid: crypto.randomUUID(),
      exam_uuid: examUuid,
      candidate_id: candidateId,
      question_uuid: q.question_uuid,
      question_type: q.question_type ?? null,
      question_en: q.question_en,
      question_ar: q.question_ar ?? null,
      answer: null,
      created_at: now,
      updated_at: now,
    }));

    await prisma.exam_question_answer.createMany({ data: answerRecords });

    return {
      operation: "success",
      message: `Exam "${exam.title_en}" assigned to candidate ${candidateId} with ${answerRecords.length} question(s)`,
    };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to assign exam",
    };
  }
}
