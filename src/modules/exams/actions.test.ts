import { describe, it, expect } from "vitest";
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
  examQuestionRowSchema,
  examChoiceRowSchema,
  examActionResponseSchema,
  listExamsResultSchema,
  submitExamAnswersResultSchema,
  listCandidateExamsResultSchema,
} from "./schemas";

// ===========================================================================
// Input schemas
// ===========================================================================

describe("listExamsSchema", () => {
  it("accepts empty input with defaults", () => {
    const result = listExamsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts custom pagination params", () => {
    const result = listExamsSchema.safeParse({ page: 2, limit: 50, q: "math" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
      expect(result.data.q).toBe("math");
    }
  });

  it("accepts staffId filter", () => {
    const result = listExamsSchema.safeParse({ staffId: 5 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.staffId).toBe(5);
    }
  });

  it("rejects limit over 100", () => {
    const result = listExamsSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listExamsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });
});

describe("getExamSchema", () => {
  it("requires examUuid", () => {
    const result = getExamSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts valid examUuid", () => {
    const result = getExamSchema.safeParse({ examUuid: "abc-123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty examUuid", () => {
    const result = getExamSchema.safeParse({ examUuid: "" });
    expect(result.success).toBe(false);
  });
});

describe("createExamSchema", () => {
  it("requires titleEn", () => {
    const result = createExamSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts valid creation input", () => {
    const result = createExamSchema.safeParse({
      titleEn: "Math Test",
      titleAr: "اختبار الرياضيات",
      descriptionEn: "Basic math assessment",
      staffId: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.titleEn).toBe("Math Test");
      expect(result.data.questions).toEqual([]);
    }
  });

  it("accepts exam with questions and choices", () => {
    const result = createExamSchema.safeParse({
      titleEn: "Science Quiz",
      questions: [
        {
          questionEn: "What is H2O?",
          questionType: 1,
          questionSortOrder: 1,
          choices: [
            { choiceValueEn: "Water", choiceSortOrder: 1 },
            { choiceValueEn: "Fire", choiceSortOrder: 2 },
          ],
        },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.questions).toHaveLength(1);
      expect(result.data.questions[0].choices).toHaveLength(2);
    }
  });

  it("rejects empty titleEn", () => {
    const result = createExamSchema.safeParse({ titleEn: "" });
    expect(result.success).toBe(false);
  });

  it("rejects titleEn over 255 chars", () => {
    const result = createExamSchema.safeParse({ titleEn: "x".repeat(256) });
    expect(result.success).toBe(false);
  });
});

describe("updateExamSchema", () => {
  it("requires examUuid", () => {
    const result = updateExamSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts partial update", () => {
    const result = updateExamSchema.safeParse({
      examUuid: "abc-123",
      titleEn: "Updated Title",
    });
    expect(result.success).toBe(true);
  });

  it("accepts all fields", () => {
    const result = updateExamSchema.safeParse({
      examUuid: "abc-123",
      titleEn: "New Title",
      descriptionEn: "New description",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty examUuid", () => {
    const result = updateExamSchema.safeParse({ examUuid: "" });
    expect(result.success).toBe(false);
  });
});

describe("deleteExamSchema", () => {
  it("requires examUuid", () => {
    const result = deleteExamSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts valid UUID", () => {
    const result = deleteExamSchema.safeParse({ examUuid: "abc-123" });
    expect(result.success).toBe(true);
  });
});

describe("listCandidateExamsSchema", () => {
  it("requires candidateId", () => {
    const result = listCandidateExamsSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts candidateId with defaults", () => {
    const result = listCandidateExamsSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("rejects non-positive candidateId", () => {
    const result = listCandidateExamsSchema.safeParse({ candidateId: 0 });
    expect(result.success).toBe(false);
  });
});

describe("submitExamAnswersSchema", () => {
  it("requires examUuid, candidateId, and answers", () => {
    const result = submitExamAnswersSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts valid answers submission", () => {
    const result = submitExamAnswersSchema.safeParse({
      examUuid: "exam-1",
      candidateId: 42,
      answers: [{ questionUuid: "q-1", answer: "Water" }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.answers).toHaveLength(1);
    }
  });

  it("rejects empty answers array", () => {
    const result = submitExamAnswersSchema.safeParse({
      examUuid: "exam-1",
      candidateId: 42,
      answers: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("assignExamToCandidateSchema", () => {
  it("requires examUuid and candidateId", () => {
    const result = assignExamToCandidateSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts valid input", () => {
    const result = assignExamToCandidateSchema.safeParse({
      examUuid: "exam-1",
      candidateId: 42,
    });
    expect(result.success).toBe(true);
  });
});

// ===========================================================================
// Output schemas
// ===========================================================================

describe("examChoiceRowSchema", () => {
  it("accepts valid choice row", () => {
    const result = examChoiceRowSchema.safeParse({
      choice_uuid: "c-1",
      choice_value_en: "Water",
      choice_value_ar: null,
      choice_sort_order: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing choice_value_en", () => {
    const result = examChoiceRowSchema.safeParse({
      choice_uuid: "c-1",
    });
    expect(result.success).toBe(false);
  });
});

describe("examQuestionRowSchema", () => {
  it("accepts valid question row with choices", () => {
    const result = examQuestionRowSchema.safeParse({
      question_uuid: "q-1",
      question_type: 1,
      question_en: "What is H2O?",
      question_ar: null,
      question_file_extensions: null,
      question_file_maxsize: null,
      question_sort_order: 1,
      choices: [
        { choice_uuid: "c-1", choice_value_en: "Water", choice_value_ar: null, choice_sort_order: 1 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts question with empty choices", () => {
    const result = examQuestionRowSchema.safeParse({
      question_uuid: "q-2",
      question_type: null,
      question_en: "Describe yourself",
      question_ar: null,
      question_file_extensions: null,
      question_file_maxsize: null,
      question_sort_order: 1,
      choices: [],
    });
    expect(result.success).toBe(true);
  });
});

describe("examRowSchema", () => {
  it("accepts valid exam row", () => {
    const result = examRowSchema.safeParse({
      exam_uuid: "exam-1",
      title_en: "Math Test",
      title_ar: null,
      description_en: null,
      description_ar: null,
      staff_id: 1,
      is_deleted: false,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
      question_count: 5,
    });
    expect(result.success).toBe(true);
  });

  it("requires title_en", () => {
    const result = examRowSchema.safeParse({
      exam_uuid: "exam-1",
    });
    expect(result.success).toBe(false);
  });

  it("accepts null staff_id", () => {
    const result = examRowSchema.safeParse({
      exam_uuid: "exam-1",
      title_en: "Test",
      title_ar: null,
      description_en: null,
      description_ar: null,
      staff_id: null,
      is_deleted: false,
      created_at: null,
      updated_at: null,
      question_count: 0,
    });
    expect(result.success).toBe(true);
  });
});

describe("examDetailSchema", () => {
  it("accepts valid exam detail with questions", () => {
    const result = examDetailSchema.safeParse({
      exam_uuid: "exam-1",
      title_en: "Math Test",
      title_ar: null,
      description_en: null,
      description_ar: null,
      staff_id: 1,
      is_deleted: false,
      created_at: null,
      updated_at: null,
      questions: [
        {
          question_uuid: "q-1",
          question_type: 0,
          question_en: "Q1",
          question_ar: null,
          question_file_extensions: null,
          question_file_maxsize: null,
          question_sort_order: 1,
          choices: [],
        },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.questions).toHaveLength(1);
    }
  });

  it("accepts detail with no questions", () => {
    const result = examDetailSchema.safeParse({
      exam_uuid: "exam-1",
      title_en: "Empty Exam",
      title_ar: null,
      description_en: null,
      description_ar: null,
      staff_id: null,
      is_deleted: false,
      created_at: null,
      updated_at: null,
      questions: [],
    });
    expect(result.success).toBe(true);
    expect(result.data!.questions).toEqual([]);
  });
});

describe("examActionResponseSchema", () => {
  it("accepts success response without data", () => {
    const result = examActionResponseSchema.safeParse({
      operation: "success",
      message: "Exam deleted",
    });
    expect(result.success).toBe(true);
  });

  it("accepts success response with data", () => {
    const result = examActionResponseSchema.safeParse({
      operation: "success",
      message: "Exam created",
      data: {
        exam_uuid: "exam-1",
        title_en: "Test",
        title_ar: null,
        description_en: null,
        description_ar: null,
        staff_id: null,
        is_deleted: false,
        created_at: null,
        updated_at: null,
        question_count: 0,
      },
    });
    expect(result.success).toBe(true);
  });

  it("accepts error response", () => {
    const result = examActionResponseSchema.safeParse({
      operation: "error",
      message: "Exam not found",
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown operation", () => {
    const result = examActionResponseSchema.safeParse({
      operation: "unknown",
      message: "test",
    });
    expect(result.success).toBe(false);
  });
});

describe("listExamsResultSchema", () => {
  it("accepts valid paginated result", () => {
    const result = listExamsResultSchema.safeParse({
      exams: [
        {
          exam_uuid: "exam-1",
          title_en: "Test",
          title_ar: null,
          description_en: null,
          description_ar: null,
          staff_id: null,
          is_deleted: false,
          created_at: null,
          updated_at: null,
          question_count: 3,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty result", () => {
    const result = listExamsResultSchema.safeParse({
      exams: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });
});

describe("submitExamAnswersResultSchema", () => {
  it("accepts valid submission result", () => {
    const result = submitExamAnswersResultSchema.safeParse({
      answerCount: 3,
      examUuid: "exam-1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing answerCount", () => {
    const result = submitExamAnswersResultSchema.safeParse({
      examUuid: "exam-1",
    });
    expect(result.success).toBe(false);
  });
});

describe("listCandidateExamsResultSchema", () => {
  it("accepts valid candidate exams list", () => {
    const result = listCandidateExamsResultSchema.safeParse({
      exams: [
        {
          exam_uuid: "exam-1",
          title_en: "Test",
          title_ar: null,
          description_en: null,
          description_ar: null,
          staff_id: null,
          is_deleted: false,
          created_at: null,
          updated_at: null,
          question_count: 0,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });
});

// ===========================================================================
// Type-level edge cases
// ===========================================================================

describe("schema edge cases", () => {
  it("coerces string numbers for page param", () => {
    const result = listExamsSchema.safeParse({ page: "3" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
    }
  });

  it("rejects non-numeric string for page", () => {
    const result = listExamsSchema.safeParse({ page: "abc" });
    expect(result.success).toBe(false);
  });

  it("handles optional Arabic fields correctly", () => {
    const arResult = createExamSchema.safeParse({
      titleEn: "Test",
      titleAr: "اختبار",
    });
    expect(arResult.success).toBe(true);
    if (arResult.success) {
      expect(arResult.data.titleAr).toBe("اختبار");
    }
  });

  it("rejects question without questionEn", () => {
    const result = createExamSchema.safeParse({
      titleEn: "Test",
      questions: [{ questionEn: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts questionSortOrder as optional", () => {
    const result = createExamSchema.safeParse({
      titleEn: "Test",
      questions: [{ questionEn: "Q1" }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.questions[0].questionSortOrder).toBeUndefined();
    }
  });
});
