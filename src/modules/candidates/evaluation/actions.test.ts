import { describe, it, expect } from "vitest";
import {
  listQuestionsSchema,
  createEvaluationSchema,
  listReportsSchema,
  viewReportSchema,
  evalQuestionItemSchema,
  evaluationListItemSchema,
  evaluationDetailSchema,
  evaluationAnswerSchema,
  createEvaluationResultSchema,
  evaluationPdfDataSchema,
  evaluationPdfCandidateSchema,
  evaluationPdfStaffSchema,
  type EvalQuestionItem,
  type EvaluationListItem,
  type CreateEvaluationResult,
} from "./schemas";

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

// ---------------------------------------------------------------------------
// Output validation tests
// ---------------------------------------------------------------------------

describe("evalQuestionItemSchema (output)", () => {
  it("validates complete item", () => {
    const result = evalQuestionItemSchema.safeParse({
      ceq_uuid: "abc-123",
      question: "Communication skills",
    });
    expect(result.success).toBe(true);
  });

  it("validates item with null question", () => {
    const result = evalQuestionItemSchema.safeParse({
      ceq_uuid: "abc-123",
      question: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing ceq_uuid", () => {
    const result = evalQuestionItemSchema.safeParse({
      question: "Test",
    });
    expect(result.success).toBe(false);
  });
});

describe("createEvaluationResultSchema (output)", () => {
  it("validates success result", () => {
    const result = createEvaluationResultSchema.safeParse({
      can_eval_uuid: "can_eval_abc",
      operation: "success",
      message: "Report saved successfully",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing fields", () => {
    const result = createEvaluationResultSchema.safeParse({
      can_eval_uuid: "abc",
    });
    expect(result.success).toBe(false);
  });
});

describe("evaluationListItemSchema (output)", () => {
  it("validates complete item", () => {
    const result = evaluationListItemSchema.safeParse({
      can_eval_uuid: "abc",
      candidate_id: 1,
      dept_id: 2,
      start_date: "2026-01-01T00:00:00.000Z",
      end_date: null,
      staff_id: null,
      created_at: new Date("2026-01-01"),
    });
    expect(result.success).toBe(true);
  });

  it("validates minimal item with all nulls", () => {
    const result = evaluationListItemSchema.safeParse({
      can_eval_uuid: "abc",
      candidate_id: null,
      dept_id: null,
      start_date: null,
      end_date: null,
      staff_id: null,
      created_at: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing can_eval_uuid", () => {
    const result = evaluationListItemSchema.safeParse({
      candidate_id: 1,
    });
    expect(result.success).toBe(false);
  });
});

describe("evaluationDetailSchema (output)", () => {
  it("validates detail without answers", () => {
    const result = evaluationDetailSchema.safeParse({
      can_eval_uuid: "abc",
      candidate_id: 1,
      dept_id: 2,
      start_date: null,
      end_date: null,
      staff_id: null,
      created_at: new Date(),
    });
    expect(result.success).toBe(true);
  });

  it("validates detail with answers", () => {
    const result = evaluationDetailSchema.safeParse({
      can_eval_uuid: "abc",
      candidate_id: 1,
      dept_id: 2,
      start_date: null,
      end_date: null,
      staff_id: null,
      created_at: new Date(),
      answers: [
        {
          ceq_uuid: "q1",
          question: "Communication",
          answer: "Good",
          rating: 4,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("validates detail with null answers fields", () => {
    const result = evaluationDetailSchema.safeParse({
      can_eval_uuid: "abc",
      candidate_id: 1,
      dept_id: 2,
      start_date: null,
      end_date: null,
      staff_id: null,
      created_at: new Date(),
      answers: [
        {
          ceq_uuid: null,
          question: null,
          answer: null,
          rating: null,
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe("evaluationAnswerSchema (output)", () => {
  it("validates complete answer", () => {
    const result = evaluationAnswerSchema.safeParse({
      ceq_uuid: "q1",
      question: "Test",
      answer: "Yes",
      rating: 4,
    });
    expect(result.success).toBe(true);
  });

  it("validates all-null answer", () => {
    const result = evaluationAnswerSchema.safeParse({
      ceq_uuid: null,
      question: null,
      answer: null,
      rating: null,
    });
    expect(result.success).toBe(true);
  });
});

describe("evaluationPdfCandidateSchema", () => {
  it("validates candidate with name and email", () => {
    const result = evaluationPdfCandidateSchema.safeParse({
      candidate_name: "John Doe",
      candidate_email: "john@example.com",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidate_name).toBe("John Doe");
      expect(result.data.candidate_email).toBe("john@example.com");
    }
  });

  it("validates candidate with null values", () => {
    const result = evaluationPdfCandidateSchema.safeParse({
      candidate_name: null,
      candidate_email: null,
    });
    expect(result.success).toBe(true);
  });
});

describe("evaluationPdfStaffSchema", () => {
  it("validates staff with name", () => {
    const result = evaluationPdfStaffSchema.safeParse({
      staff_name: "Jane Smith",
    });
    expect(result.success).toBe(true);
  });

  it("validates staff with null name", () => {
    const result = evaluationPdfStaffSchema.safeParse({
      staff_name: null,
    });
    expect(result.success).toBe(true);
  });
});

describe("evaluationPdfDataSchema (combined)", () => {
  const baseEvaluation = {
    can_eval_uuid: "can_eval_abc123",
    candidate_id: 42,
    dept_id: 1,
    start_date: "2026-01-01T00:00:00.000Z",
    end_date: "2026-01-31T00:00:00.000Z",
    staff_id: 7,
    created_at: new Date("2026-06-01"),
    answers: [
      { ceq_uuid: "q1", question: "Performance?", answer: "Good", rating: 4 },
    ],
  };

  it("validates complete PDF data with candidate and staff", () => {
    const result = evaluationPdfDataSchema.safeParse({
      ...baseEvaluation,
      candidate: { candidate_name: "John Doe", candidate_email: "john@example.com" },
      staff: { staff_name: "Jane Smith" },
    });
    expect(result.success).toBe(true);
  });

  it("validates PDF data with null candidate and staff", () => {
    const result = evaluationPdfDataSchema.safeParse({
      ...baseEvaluation,
      candidate: null,
      staff: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing candidate field", () => {
    const result = evaluationPdfDataSchema.safeParse({
      ...baseEvaluation,
      staff: { staff_name: "Jane Smith" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing staff field", () => {
    const result = evaluationPdfDataSchema.safeParse({
      ...baseEvaluation,
      candidate: { candidate_name: "John Doe", candidate_email: "john@example.com" },
    });
    expect(result.success).toBe(false);
  });
});
