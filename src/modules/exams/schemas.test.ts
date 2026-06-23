import { describe, it, expect } from "vitest";
import {
  examRowSchema,
  examDetailSchema,
  listExamsResultSchema,
  examActionResponseSchema,
  submitExamAnswersResultSchema,
  listCandidateExamsResultSchema,
  examGradeResultSchema,
  examChoiceRowSchema,
  examQuestionRowSchema,
  examAnswerRowSchema,
} from "./schemas";

const validExamRow = () => ({
  exam_uuid: "abc-123",
  title_en: "Midterm",
  title_ar: "منتصف الفصل",
  description_en: null,
  description_ar: null,
  staff_id: null,
  is_deleted: false,
  created_at: "2026-06-01T00:00:00.000Z",
  updated_at: null,
  question_count: 5,
});

const validExamRowMinimal = () => ({
  exam_uuid: "exam-001",
  title_en: "Final",
  title_ar: null,
  description_en: null,
  description_ar: null,
  staff_id: null,
  is_deleted: null,
  created_at: null,
  updated_at: null,
  question_count: 0,
});

const validChoiceRow = () => ({
  choice_uuid: "choice-1",
  choice_value_en: "Option A",
  choice_value_ar: null,
  choice_sort_order: null,
});

const validQuestionRow = () => ({
  question_uuid: "q-1",
  question_type: null,
  question_en: "What is 2+2?",
  question_ar: null,
  question_file_extensions: null,
  question_file_maxsize: null,
  question_sort_order: null,
  choices: [validChoiceRow()],
});

const validAnswerRow = () => ({
  answer_uuid: "ans-1",
  question_uuid: "q-1",
  question_en: "What is 2+2?",
  answer: "4",
  created_at: null,
});

// ---------------------------------------------------------------------------
// examChoiceRowSchema
// ---------------------------------------------------------------------------

describe("examChoiceRowSchema", () => {
  it("accepts a valid choice row", () => {
    const r = examChoiceRowSchema.safeParse(validChoiceRow());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = examChoiceRowSchema.safeParse({
      choice_uuid: "c-1",
      choice_value_en: "B",
      choice_value_ar: null,
      choice_sort_order: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing choice_uuid", () => {
    const { choice_uuid: _, ...rest } = validChoiceRow();
    expect(examChoiceRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-string choice_value_en", () => {
    expect(examChoiceRowSchema.safeParse({ ...validChoiceRow(), choice_value_en: 42 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// examQuestionRowSchema
// ---------------------------------------------------------------------------

describe("examQuestionRowSchema", () => {
  it("accepts a valid question row", () => {
    const r = examQuestionRowSchema.safeParse(validQuestionRow());
    expect(r.success).toBe(true);
  });

  it("accepts empty choices array", () => {
    const r = examQuestionRowSchema.safeParse({
      ...validQuestionRow(),
      choices: [],
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing question_en", () => {
    const { question_en: _, ...rest } = validQuestionRow();
    expect(examQuestionRowSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// examRowSchema
// ---------------------------------------------------------------------------

describe("examRowSchema", () => {
  it("accepts a valid exam row", () => {
    const r = examRowSchema.safeParse(validExamRow());
    expect(r.success).toBe(true);
  });

  it("accepts a minimal exam row", () => {
    const r = examRowSchema.safeParse(validExamRowMinimal());
    expect(r.success).toBe(true);
  });

  it("rejects missing exam_uuid", () => {
    const { exam_uuid: _, ...rest } = validExamRow();
    expect(examRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-string title_en", () => {
    expect(examRowSchema.safeParse({ ...validExamRow(), title_en: 123 }).success).toBe(false);
  });

  it("rejects negative question_count", () => {
    expect(examRowSchema.safeParse({ ...validExamRow(), question_count: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// examDetailSchema
// ---------------------------------------------------------------------------

describe("examDetailSchema", () => {
  it("accepts a valid exam detail", () => {
    const r = examDetailSchema.safeParse({
      ...validExamRow(),
      questions: [validQuestionRow()],
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing questions array", () => {
    const { questions: _, ...rest } = { ...validExamRow(), questions: [validQuestionRow()] };
    expect(examDetailSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listExamsResultSchema
// ---------------------------------------------------------------------------

describe("listExamsResultSchema", () => {
  it("accepts a full paginated result", () => {
    const r = listExamsResultSchema.safeParse({
      exams: [validExamRow(), validExamRowMinimal()],
      total: 42,
      page: 1,
      limit: 20,
      totalPages: 3,
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty exams array", () => {
    const r = listExamsResultSchema.safeParse({
      exams: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listExamsResultSchema.safeParse({
        exams: [],
        total: -1,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(
      listExamsResultSchema.safeParse({
        exams: [],
        total: 0,
        page: 0,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// examActionResponseSchema
// ---------------------------------------------------------------------------

describe("examActionResponseSchema", () => {
  it("accepts success operation", () => {
    const r = examActionResponseSchema.safeParse({ operation: "success", message: "Done" });
    expect(r.success).toBe(true);
  });

  it("accepts error operation", () => {
    const r = examActionResponseSchema.safeParse({ operation: "error", message: "Failed" });
    expect(r.success).toBe(true);
  });

  it("rejects invalid operation", () => {
    expect(examActionResponseSchema.safeParse({ operation: "invalid", message: "Bad" }).success).toBe(false);
  });

  it("rejects missing message", () => {
    expect(examActionResponseSchema.safeParse({ operation: "success" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// submitExamAnswersResultSchema
// ---------------------------------------------------------------------------

describe("submitExamAnswersResultSchema", () => {
  it("accepts a valid result", () => {
    const r = submitExamAnswersResultSchema.safeParse({ answerCount: 10, examUuid: "exam-001" });
    expect(r.success).toBe(true);
  });

  it("rejects negative answerCount", () => {
    expect(submitExamAnswersResultSchema.safeParse({ answerCount: -1, examUuid: "exam-001" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// examAnswerRowSchema
// ---------------------------------------------------------------------------

describe("examAnswerRowSchema", () => {
  it("accepts a valid answer row", () => {
    const r = examAnswerRowSchema.safeParse(validAnswerRow());
    expect(r.success).toBe(true);
  });

  it("rejects missing question_en", () => {
    const { question_en: _, ...rest } = validAnswerRow();
    expect(examAnswerRowSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCandidateExamsResultSchema
// ---------------------------------------------------------------------------

describe("listCandidateExamsResultSchema", () => {
  it("accepts a valid result", () => {
    const r = listCandidateExamsResultSchema.safeParse({
      exams: [validExamRow()],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// examGradeResultSchema
// ---------------------------------------------------------------------------

describe("examGradeResultSchema", () => {
  const valid = () => ({ answer_uuid: "ans-1", candidate_id: 42, question_en: "Q1", answer: "4" });

  it("accepts a valid grade result", () => {
    const r = examGradeResultSchema.safeParse(valid());
    expect(r.success).toBe(true);
  });

  it("accepts null answer", () => {
    const r = examGradeResultSchema.safeParse({ ...valid(), answer: null });
    expect(r.success).toBe(true);
  });
});
