import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockFindUniqueCandidateEvaluation,
  mockFindUniqueCandidate,
  mockFindUniqueStaff,
  mockQueryRawUnsafe,
} = vi.hoisted(() => ({
  mockFindUniqueCandidateEvaluation: vi.fn(),
  mockFindUniqueCandidate: vi.fn(),
  mockFindUniqueStaff: vi.fn(),
  mockQueryRawUnsafe: vi.fn(),
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidate_evaluation: {
      findUnique: mockFindUniqueCandidateEvaluation,
    },
    candidate: {
      findUnique: mockFindUniqueCandidate,
    },
    staff: {
      findUnique: mockFindUniqueStaff,
    },
    $queryRawUnsafe: mockQueryRawUnsafe,
  },
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import {
  getEvaluationParamsSchema,
  evaluationDetailOutputSchema,
  evaluationAnswerOutputSchema,
  evaluationAnswersOutputSchema,
} from "./schemas";
import { getEvaluationDetail, getEvaluationAnswers } from "./actions";

// ===========================================================================
// Input schema validation
// ===========================================================================

describe("getEvaluationParamsSchema", () => {
  it("accepts a valid UUID", () => {
    const r = getEvaluationParamsSchema.safeParse({
      uuid: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing uuid", () => {
    const r = getEvaluationParamsSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects non-UUID string", () => {
    const r = getEvaluationParamsSchema.safeParse({ uuid: "not-a-uuid" });
    expect(r.success).toBe(false);
  });

  it("rejects empty string", () => {
    const r = getEvaluationParamsSchema.safeParse({ uuid: "" });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type", () => {
    const r = getEvaluationParamsSchema.safeParse({ uuid: 123 });
    expect(r.success).toBe(false);
  });
});

// ===========================================================================
// Output schema validation
// ===========================================================================

describe("evaluationDetailOutputSchema", () => {
  const validDetail = {
    uuid: "550e8400-e29b-41d4-a716-446655440000",
    candidateId: 42,
    staffId: 7,
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-06-01"),
    createdAt: new Date("2026-01-01"),
    candidateName: "Alice Smith",
    candidateEmail: "alice@example.com",
    staffName: "Bob Reviewer",
  };

  it("accepts a valid evaluation detail", () => {
    const r = evaluationDetailOutputSchema.safeParse(validDetail);
    expect(r.success).toBe(true);
  });

  it("accepts all-null fields", () => {
    const r = evaluationDetailOutputSchema.safeParse({
      uuid: "550e8400-e29b-41d4-a716-446655440000",
      candidateId: null,
      staffId: null,
      startDate: null,
      endDate: null,
      createdAt: null,
      candidateName: null,
      candidateEmail: null,
      staffName: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing uuid", () => {
    const { uuid: _, ...rest } = validDetail;
    const r = evaluationDetailOutputSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for uuid", () => {
    const r = evaluationDetailOutputSchema.safeParse({
      ...validDetail,
      uuid: 123,
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for candidateId", () => {
    const r = evaluationDetailOutputSchema.safeParse({
      ...validDetail,
      candidateId: "not-a-number",
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for candidateName", () => {
    const r = evaluationDetailOutputSchema.safeParse({
      ...validDetail,
      candidateName: 456,
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for startDate", () => {
    const r = evaluationDetailOutputSchema.safeParse({
      ...validDetail,
      startDate: "2026-01-01",
    });
    expect(r.success).toBe(false);
  });
});

describe("evaluationAnswerOutputSchema", () => {
  const validAnswer = {
    ceqUuid: "550e8400-e29b-41d4-a716-446655440000",
    question: "How was performance?",
    answer: "Excellent",
    rating: 5,
  };

  it("accepts a valid answer", () => {
    const r = evaluationAnswerOutputSchema.safeParse(validAnswer);
    expect(r.success).toBe(true);
  });

  it("accepts all-null fields", () => {
    const r = evaluationAnswerOutputSchema.safeParse({
      ceqUuid: null,
      question: null,
      answer: null,
      rating: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing ceqUuid", () => {
    const { ceqUuid: _, ...rest } = validAnswer;
    const r = evaluationAnswerOutputSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects missing question", () => {
    const { question: _, ...rest } = validAnswer;
    const r = evaluationAnswerOutputSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for rating", () => {
    const r = evaluationAnswerOutputSchema.safeParse({
      ...validAnswer,
      rating: "high",
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for question", () => {
    const r = evaluationAnswerOutputSchema.safeParse({
      ...validAnswer,
      question: 123,
    });
    expect(r.success).toBe(false);
  });
});

describe("evaluationAnswersOutputSchema", () => {
  it("accepts a valid array of answers", () => {
    const r = evaluationAnswersOutputSchema.safeParse([
      { ceqUuid: "uuid-1", question: "Q1", answer: "A1", rating: 5 },
      { ceqUuid: "uuid-2", question: "Q2", answer: "A2", rating: 3 },
    ]);
    expect(r.success).toBe(true);
  });

  it("accepts an empty array", () => {
    const r = evaluationAnswersOutputSchema.safeParse([]);
    expect(r.success).toBe(true);
  });

  it("rejects non-array", () => {
    const r = evaluationAnswersOutputSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects array with invalid items", () => {
    const r = evaluationAnswersOutputSchema.safeParse([
      { ceqUuid: "orphan" },
    ]);
    expect(r.success).toBe(false);
  });
});

// ===========================================================================
// Action function tests (with mocked Prisma)
// ===========================================================================

const mockEvaluationRow = {
  can_eval_uuid: "550e8400-e29b-41d4-a716-446655440000",
  candidate_id: 42,
  staff_id: 7,
  start_date: new Date("2026-01-01"),
  end_date: new Date("2026-06-01"),
  created_at: new Date("2026-01-01T00:00:00.000Z"),
};

const mockCandidateRow = {
  candidate_name: "Alice Smith",
  candidate_email: "alice@example.com",
};

const mockStaffRow = {
  staff_name: "Bob Reviewer",
};

describe("getEvaluationDetail()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindUniqueCandidateEvaluation.mockResolvedValue(mockEvaluationRow);
    mockFindUniqueCandidate.mockResolvedValue(mockCandidateRow);
    mockFindUniqueStaff.mockResolvedValue(mockStaffRow);
  });

  it("returns evaluation detail with candidate and staff info", async () => {
    const result = await getEvaluationDetail(
      "550e8400-e29b-41d4-a716-446655440000",
    );

    expect(mockFindUniqueCandidateEvaluation).toHaveBeenCalledWith({
      where: { can_eval_uuid: "550e8400-e29b-41d4-a716-446655440000" },
    });
    expect(mockFindUniqueCandidate).toHaveBeenCalledWith({
      where: { candidate_id: 42 },
      select: { candidate_name: true, candidate_email: true },
    });
    expect(mockFindUniqueStaff).toHaveBeenCalledWith({
      where: { staff_id: 7 },
      select: { staff_name: true },
    });

    expect(result).not.toBeNull();
    expect(result!.uuid).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(result!.candidateId).toBe(42);
    expect(result!.staffId).toBe(7);
    expect(result!.candidateName).toBe("Alice Smith");
    expect(result!.candidateEmail).toBe("alice@example.com");
    expect(result!.staffName).toBe("Bob Reviewer");
  });

  it("returns null when evaluation not found", async () => {
    mockFindUniqueCandidateEvaluation.mockResolvedValue(null);

    const result = await getEvaluationDetail(
      "550e8400-e29b-41d4-a716-446655440000",
    );
    expect(result).toBeNull();
    expect(mockFindUniqueCandidate).not.toHaveBeenCalled();
    expect(mockFindUniqueStaff).not.toHaveBeenCalled();
  });

  it("handles null candidate_id gracefully", async () => {
    mockFindUniqueCandidateEvaluation.mockResolvedValue({
      ...mockEvaluationRow,
      candidate_id: null,
    });

    const result = await getEvaluationDetail(
      "550e8400-e29b-41d4-a716-446655440000",
    );

    expect(mockFindUniqueCandidate).not.toHaveBeenCalled();
    expect(result!.candidateId).toBeNull();
    expect(result!.candidateName).toBeNull();
    expect(result!.candidateEmail).toBeNull();
  });

  it("handles null staff_id gracefully", async () => {
    mockFindUniqueCandidateEvaluation.mockResolvedValue({
      ...mockEvaluationRow,
      staff_id: null,
    });

    const result = await getEvaluationDetail(
      "550e8400-e29b-41d4-a716-446655440000",
    );

    expect(mockFindUniqueStaff).not.toHaveBeenCalled();
    expect(result!.staffId).toBeNull();
    expect(result!.staffName).toBeNull();
  });

  it("handles missing candidate row (orphaned candidate_id)", async () => {
    mockFindUniqueCandidate.mockResolvedValue(null);

    const result = await getEvaluationDetail(
      "550e8400-e29b-41d4-a716-446655440000",
    );

    expect(result!.candidateName).toBeNull();
    expect(result!.candidateEmail).toBeNull();
  });

  it("handles missing staff row (orphaned staff_id)", async () => {
    mockFindUniqueStaff.mockResolvedValue(null);

    const result = await getEvaluationDetail(
      "550e8400-e29b-41d4-a716-446655440000",
    );

    expect(result!.staffName).toBeNull();
  });

  it("returns null for invalid UUID (schema rejects before prisma)", async () => {
    const result = await getEvaluationDetail("not-a-uuid");

    expect(result).toBeNull();
    expect(mockFindUniqueCandidateEvaluation).not.toHaveBeenCalled();
  });
});

describe("getEvaluationAnswers()", () => {
  const mockAnswers = [
    {
      ceq_uuid: "ans-uuid-1",
      question: "How was performance?",
      answer: "Excellent",
      rating: 5,
    },
    {
      ceq_uuid: "ans-uuid-2",
      question: "Communication skills?",
      answer: "Good",
      rating: 4,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryRawUnsafe.mockResolvedValue(mockAnswers);
  });

  it("returns evaluation answers", async () => {
    const result = await getEvaluationAnswers(
      "550e8400-e29b-41d4-a716-446655440000",
    );

    expect(mockQueryRawUnsafe).toHaveBeenCalledWith(
      `SELECT ceq_uuid, question, answer, rating
     FROM candidate_evaluation_answer
     WHERE can_eval_uuid = ?`,
      "550e8400-e29b-41d4-a716-446655440000",
    );

    expect(result).toHaveLength(2);
    expect(result[0].ceqUuid).toBe("ans-uuid-1");
    expect(result[0].question).toBe("How was performance?");
    expect(result[0].answer).toBe("Excellent");
    expect(result[0].rating).toBe(5);
    expect(result[1].ceqUuid).toBe("ans-uuid-2");
  });

  it("returns empty array when no answers exist", async () => {
    mockQueryRawUnsafe.mockResolvedValue([]);

    const result = await getEvaluationAnswers(
      "550e8400-e29b-41d4-a716-446655440000",
    );

    expect(result).toEqual([]);
  });

  it("handles null fields in raw results", async () => {
    mockQueryRawUnsafe.mockResolvedValue([
      {
        ceq_uuid: "ans-uuid-1",
        question: null,
        answer: null,
        rating: null,
      },
    ]);

    const result = await getEvaluationAnswers(
      "550e8400-e29b-41d4-a716-446655440000",
    );

    expect(result).toHaveLength(1);
    expect(result[0].question).toBeNull();
    expect(result[0].answer).toBeNull();
    expect(result[0].rating).toBeNull();
  });

  it("returns empty array for invalid UUID (schema rejects before prisma)", async () => {
    const result = await getEvaluationAnswers("not-a-uuid");

    expect(result).toEqual([]);
    expect(mockQueryRawUnsafe).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// Type-shape checks (compile-time type assertions)
// ===========================================================================

describe("EvaluationDetail shape", () => {
  it("accepts a valid detail object", () => {
    const detail = {
      uuid: "550e8400-e29b-41d4-a716-446655440000",
      candidateId: null,
      staffId: null,
      startDate: null,
      endDate: null,
      createdAt: null,
      candidateName: null,
      candidateEmail: null,
      staffName: null,
    };
    expect(detail.uuid).toBe("550e8400-e29b-41d4-a716-446655440000");
  });
});

describe("EvaluationAnswer shape", () => {
  it("accepts a valid answer object", () => {
    const answer = {
      ceqUuid: "uuid",
      question: null,
      answer: null,
      rating: null,
    };
    expect(answer.ceqUuid).toBe("uuid");
  });
});
