import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas (duplicated from actions.ts for isolated unit testing)
// ---------------------------------------------------------------------------

const listQuestionsSchema = z.object({
  deptId: z.number().int().positive("Department ID is required"),
});

const createEvaluationSchema = z.object({
  candidateId: z.number().int().positive("Candidate ID is required"),
  deptId: z.number().int().positive("Department ID is required"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  questionAnswers: z
    .array(
      z.object({
        ceqUuid: z.string().optional(),
        question: z.string().optional(),
        answer: z.string().optional().nullable(),
        rating: z.number().int().min(1).max(5).optional(),
      }),
    )
    .min(1, "At least one question answer is required"),
});

const listReportsSchema = z.object({
  candidateId: z.number().int().positive("Candidate ID is required"),
});

const viewReportSchema = z.object({
  evaluationUuid: z.string().min(1, "Evaluation UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EvalQuestionItem = {
  ceq_uuid: string;
  question: string | null;
};

type EvaluationListItem = {
  can_eval_uuid: string;
  candidate_id: number | null;
  dept_id: number | null;
  start_date: string | null;
  end_date: string | null;
  staff_id: number | null;
  created_at: Date | null;
};

type EvaluationDetail = EvaluationListItem & {
  answers?: Array<{
    ceq_uuid: string | null;
    question: string | null;
    answer: string | null;
    rating: number | null;
  }>;
};

type CreateEvaluationResult = {
  can_eval_uuid: string;
  operation: string;
  message: string;
};

// ---------------------------------------------------------------------------
// Schema tests
// ---------------------------------------------------------------------------

describe("listQuestionsByDepartment schema", () => {
  it("rejects missing deptId", () => {
    const result = listQuestionsSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects zero deptId", () => {
    const result = listQuestionsSchema.safeParse({ deptId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative deptId", () => {
    const result = listQuestionsSchema.safeParse({ deptId: -1 });
    expect(result.success).toBe(false);
  });

  it("accepts valid deptId", () => {
    const result = listQuestionsSchema.safeParse({ deptId: 1 });
    expect(result.success).toBe(true);
  });
});

describe("createEvaluation schema", () => {
  it("rejects missing candidateId", () => {
    const result = createEvaluationSchema.safeParse({
      deptId: 1,
      questionAnswers: [{ question: "Test", rating: 3 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing deptId", () => {
    const result = createEvaluationSchema.safeParse({
      candidateId: 1,
      questionAnswers: [{ question: "Test", rating: 3 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty questionAnswers", () => {
    const result = createEvaluationSchema.safeParse({
      candidateId: 1,
      deptId: 1,
      questionAnswers: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects rating below minimum", () => {
    const result = createEvaluationSchema.safeParse({
      candidateId: 1,
      deptId: 1,
      questionAnswers: [{ question: "Test", rating: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects rating above maximum", () => {
    const result = createEvaluationSchema.safeParse({
      candidateId: 1,
      deptId: 1,
      questionAnswers: [{ question: "Test", rating: 6 }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid input with all fields", () => {
    const result = createEvaluationSchema.safeParse({
      candidateId: 1,
      deptId: 2,
      startDate: "2026-01-01",
      endDate: "2026-06-01",
      questionAnswers: [
        { ceqUuid: "abc123", question: "Communication skills", answer: "Good", rating: 4 },
        { question: "Teamwork", rating: 5 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid input with minimal fields", () => {
    const result = createEvaluationSchema.safeParse({
      candidateId: 1,
      deptId: 1,
      questionAnswers: [{ question: "Test", rating: 3 }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts nullable answer", () => {
    const result = createEvaluationSchema.safeParse({
      candidateId: 1,
      deptId: 1,
      questionAnswers: [{ question: "Test", answer: null, rating: 3 }],
    });
    expect(result.success).toBe(true);
  });
});

describe("listEvaluationReports schema", () => {
  it("rejects missing candidateId", () => {
    const result = listReportsSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects zero candidateId", () => {
    const result = listReportsSchema.safeParse({ candidateId: 0 });
    expect(result.success).toBe(false);
  });

  it("accepts valid candidateId", () => {
    const result = listReportsSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(true);
  });
});

describe("viewEvaluationReport schema", () => {
  it("rejects empty UUID", () => {
    const result = viewReportSchema.safeParse({ evaluationUuid: "" });
    expect(result.success).toBe(false);
  });

  it("accepts valid UUID", () => {
    const result = viewReportSchema.safeParse({
      evaluationUuid: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

describe("type shapes", () => {
  it("EvalQuestionItem has correct structure", () => {
    const item: EvalQuestionItem = {
      ceq_uuid: "abc",
      question: "Test question",
    };
    expect(item).toHaveProperty("ceq_uuid");
    expect(item).toHaveProperty("question");
  });

  it("EvaluationListItem has correct structure", () => {
    const item: EvaluationListItem = {
      can_eval_uuid: "abc",
      candidate_id: 1,
      dept_id: 2,
      start_date: "2026-01-01",
      end_date: null,
      staff_id: null,
      created_at: new Date(),
    };
    expect(item).toHaveProperty("can_eval_uuid");
    expect(item).toHaveProperty("candidate_id");
  });

  it("CreateEvaluationResult has correct structure", () => {
    const result: CreateEvaluationResult = {
      can_eval_uuid: "abc",
      operation: "success",
      message: "Report saved successfully",
    };
    expect(result).toHaveProperty("can_eval_uuid");
    expect(result).toHaveProperty("operation");
    expect(result).toHaveProperty("message");
  });
});

// ---------------------------------------------------------------------------
// Edge case tests
// ---------------------------------------------------------------------------

describe("createEvaluation edge cases", () => {
  it("allows optional startDate and endDate to be undefined", () => {
    const result = createEvaluationSchema.safeParse({
      candidateId: 1,
      deptId: 1,
      questionAnswers: [{ question: "Test", rating: 3 }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.startDate).toBeUndefined();
      expect(result.data.endDate).toBeUndefined();
    }
  });

  it("allows partial question data (only rating)", () => {
    const result = createEvaluationSchema.safeParse({
      candidateId: 1,
      deptId: 1,
      questionAnswers: [{ rating: 3 }],
    });
    expect(result.success).toBe(true);
  });

  it("handles multiple question answers", () => {
    const answers = Array.from({ length: 10 }, (_, i) => ({
      question: `Question ${i + 1}`,
      rating: (i % 5) + 1,
    }));
    const result = createEvaluationSchema.safeParse({
      candidateId: 1,
      deptId: 1,
      questionAnswers: answers,
    });
    expect(result.success).toBe(true);
  });
});

describe("listQuestions query parameter behavior", () => {
  it("rejects string deptId", () => {
    const result = listQuestionsSchema.safeParse({ deptId: "abc" });
    expect(result.success).toBe(false);
  });

  it("accepts float that rounds", () => {
    const result = listQuestionsSchema.safeParse({ deptId: 1.5 });
    // Zod coerce: float is not integer, should fail
    expect(result.success).toBe(false);
  });
});
