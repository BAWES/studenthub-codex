import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: interview evaluation action schema validation
//
// Testing schemas separately avoids mocking "use server" dependencies
// (prisma, session, next/cache).
// ---------------------------------------------------------------------------

const listInterviewEvaluationsSchema = z.object({
  candidateId: z.coerce.number().int().positive().optional(),
});

const getInterviewEvaluationSchema = z.object({
  uuid: z.string().min(1, "Interview evaluation UUID is required"),
});

describe("listInterviewEvaluationsSchema", () => {
  it("accepts empty params (no filters)", () => {
    const result = listInterviewEvaluationsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBeUndefined();
    }
  });

  it("accepts candidateId filter", () => {
    const result = listInterviewEvaluationsSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
    }
  });

  it("coerces string candidateId to number", () => {
    const result = listInterviewEvaluationsSchema.safeParse({ candidateId: "42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
    }
  });

  it("rejects zero candidateId", () => {
    const result = listInterviewEvaluationsSchema.safeParse({ candidateId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative candidateId", () => {
    const result = listInterviewEvaluationsSchema.safeParse({ candidateId: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric candidateId string", () => {
    const result = listInterviewEvaluationsSchema.safeParse({ candidateId: "abc" });
    expect(result.success).toBe(false);
  });
});

describe("getInterviewEvaluationSchema", () => {
  it("accepts a valid UUID string", () => {
    const result = getInterviewEvaluationSchema.safeParse({ uuid: "abc-123-def-456" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.uuid).toBe("abc-123-def-456");
    }
  });

  it("rejects empty UUID string", () => {
    const result = getInterviewEvaluationSchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing uuid", () => {
    const result = getInterviewEvaluationSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// --- createInterviewEvaluation schema ---

const interviewEvaluationNoteItemSchema = z.object({
  note: z.string().min(1, "Note text is required"),
});

const createInterviewEvaluationSchema = z.object({
  candidateId: z.number().int().positive("Candidate ID is required"),
  staffId: z.number().int().positive().optional(),
  requestUuid: z.string().optional(),
  companyId: z.number().int().positive().optional(),
  interviewEvaluationNotes: z.array(interviewEvaluationNoteItemSchema).optional(),
});

describe("createInterviewEvaluationSchema", () => {
  it("accepts valid params with only candidateId", () => {
    const result = createInterviewEvaluationSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
      expect(result.data.staffId).toBeUndefined();
      expect(result.data.requestUuid).toBeUndefined();
    }
  });

  it("accepts candidateId with staffId", () => {
    const result = createInterviewEvaluationSchema.safeParse({ candidateId: 42, staffId: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.staffId).toBe(10);
    }
  });

  it("accepts candidateId with requestUuid", () => {
    const result = createInterviewEvaluationSchema.safeParse({ candidateId: 42, requestUuid: "req-uuid" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.requestUuid).toBe("req-uuid");
    }
  });

  it("accepts candidateId with companyId", () => {
    const result = createInterviewEvaluationSchema.safeParse({ candidateId: 42, companyId: 513 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(513);
    }
  });

  it("accepts all optional fields", () => {
    const result = createInterviewEvaluationSchema.safeParse({
      candidateId: 42,
      staffId: 10,
      requestUuid: "req-uuid",
      companyId: 513,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing candidateId", () => {
    const result = createInterviewEvaluationSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects zero candidateId", () => {
    const result = createInterviewEvaluationSchema.safeParse({ candidateId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative candidateId", () => {
    const result = createInterviewEvaluationSchema.safeParse({ candidateId: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero staffId", () => {
    const result = createInterviewEvaluationSchema.safeParse({ candidateId: 42, staffId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative staffId", () => {
    const result = createInterviewEvaluationSchema.safeParse({ candidateId: 42, staffId: -5 });
    expect(result.success).toBe(false);
  });

  it("accepts interviewEvaluationNotes as empty array", () => {
    const result = createInterviewEvaluationSchema.safeParse({ candidateId: 42, interviewEvaluationNotes: [] });
    expect(result.success).toBe(true);
  });

  it("accepts interviewEvaluationNotes with valid notes", () => {
    const result = createInterviewEvaluationSchema.safeParse({
      candidateId: 42,
      interviewEvaluationNotes: [{ note: "Great communication skills" }, { note: "Strong technical background" }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.interviewEvaluationNotes).toHaveLength(2);
    }
  });

  it("rejects note with empty string", () => {
    const result = createInterviewEvaluationSchema.safeParse({
      candidateId: 42,
      interviewEvaluationNotes: [{ note: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects note with missing note field", () => {
    const result = createInterviewEvaluationSchema.safeParse({
      candidateId: 42,
      interviewEvaluationNotes: [{}],
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Return type shapes
// ---------------------------------------------------------------------------

type InterviewEvaluationListItem = {
  interview_evaluation_uuid: string;
  request_uuid: string | null;
  company_id: number | null;
  candidate_id: number;
  staff_id: number | null;
  candidate_name: string | null;
  created_at: Date | null;
};

type InterviewEvaluationListResult = {
  evaluations: InterviewEvaluationListItem[];
  total: number;
};

type InterviewEvaluationDetailResult = InterviewEvaluationListItem | null;

describe("InterviewEvaluationListItem shape", () => {
  it("defines the expected fields", () => {
    const mock: InterviewEvaluationListItem = {
      interview_evaluation_uuid: "uuid-1",
      request_uuid: "req-uuid-1",
      company_id: 1,
      candidate_id: 42,
      staff_id: 10,
      candidate_name: "John Doe",
      created_at: new Date("2024-01-01"),
    };
    expect(mock.interview_evaluation_uuid).toBe("uuid-1");
    expect(mock.candidate_id).toBe(42);
    expect(mock.candidate_name).toBe("John Doe");
  });
});

describe("InterviewEvaluationListResult shape", () => {
  it("defines evaluations array and total", () => {
    const mock: InterviewEvaluationListResult = {
      evaluations: [],
      total: 0,
    };
    expect(mock.evaluations).toEqual([]);
    expect(mock.total).toBe(0);
  });
});

describe("InterviewEvaluationDetailResult shape", () => {
  it("can be an evaluation item", () => {
    const mock: InterviewEvaluationDetailResult = {
      interview_evaluation_uuid: "uuid-2",
      request_uuid: null,
      company_id: null,
      candidate_id: 99,
      staff_id: null,
      candidate_name: null,
      created_at: null,
    };
    expect(mock).not.toBeNull();
    expect(mock!.candidate_id).toBe(99);
  });

  it("can be null", () => {
    const result: InterviewEvaluationDetailResult = null;
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// updateInterviewEvaluation schema tests
// ---------------------------------------------------------------------------

const updateInterviewEvaluationSchema = z.object({
  uuid: z.string().min(1, "Interview evaluation UUID is required"),
  requestUuid: z.string().optional(),
  companyId: z.number().int().positive().optional(),
  staffId: z.number().int().positive().optional(),
  interviewEvaluationNotes: z.array(interviewEvaluationNoteItemSchema).optional(),
});

describe("updateInterviewEvaluationSchema", () => {
  it("accepts valid params with uuid only", () => {
    const result = updateInterviewEvaluationSchema.safeParse({ uuid: "eval-uuid-1" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.uuid).toBe("eval-uuid-1");
    }
  });

  it("accepts uuid with optional fields", () => {
    const result = updateInterviewEvaluationSchema.safeParse({
      uuid: "eval-uuid-1",
      requestUuid: "req-uuid",
      companyId: 513,
      staffId: 10,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty uuid", () => {
    const result = updateInterviewEvaluationSchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing uuid", () => {
    const result = updateInterviewEvaluationSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteInterviewEvaluation schema tests
// ---------------------------------------------------------------------------

const deleteInterviewEvaluationSchema = z.object({
  uuid: z.string().min(1, "Interview evaluation UUID is required"),
});

describe("deleteInterviewEvaluationSchema", () => {
  it("accepts a valid UUID string", () => {
    const result = deleteInterviewEvaluationSchema.safeParse({ uuid: "eval-uuid-1" });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID string", () => {
    const result = deleteInterviewEvaluationSchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing uuid", () => {
    const result = deleteInterviewEvaluationSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getInterviewEvaluationVersions schema tests
// ---------------------------------------------------------------------------

const getInterviewEvaluationVersionsSchema = z.object({
  uuid: z.string().min(1, "Interview evaluation UUID is required"),
});

describe("getInterviewEvaluationVersionsSchema", () => {
  it("accepts a valid UUID string", () => {
    const result = getInterviewEvaluationVersionsSchema.safeParse({ uuid: "eval-uuid-1" });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID string", () => {
    const result = getInterviewEvaluationVersionsSchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing uuid", () => {
    const result = getInterviewEvaluationVersionsSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// addInterviewEvaluationNoteVersion schema tests
// ---------------------------------------------------------------------------

const addInterviewEvaluationNoteVersionSchema = z.object({
  uuid: z.string().min(1, "Interview evaluation UUID is required"),
  notes: z.array(interviewEvaluationNoteItemSchema).min(1, "At least one note is required"),
});

describe("addInterviewEvaluationNoteVersionSchema", () => {
  it("accepts valid params", () => {
    const result = addInterviewEvaluationNoteVersionSchema.safeParse({
      uuid: "eval-uuid-1",
      notes: [{ note: "Strong communication" }, { note: "Good technical grasp" }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notes).toHaveLength(2);
    }
  });

  it("rejects empty notes array", () => {
    const result = addInterviewEvaluationNoteVersionSchema.safeParse({
      uuid: "eval-uuid-1",
      notes: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing notes field", () => {
    const result = addInterviewEvaluationNoteVersionSchema.safeParse({
      uuid: "eval-uuid-1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty uuid", () => {
    const result = addInterviewEvaluationNoteVersionSchema.safeParse({
      uuid: "",
      notes: [{ note: "Test note" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects note with empty string", () => {
    const result = addInterviewEvaluationNoteVersionSchema.safeParse({
      uuid: "eval-uuid-1",
      notes: [{ note: "" }],
    });
    expect(result.success).toBe(false);
  });
});
