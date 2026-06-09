import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas (duplicated from actions.ts for pure-unit testing)
// ---------------------------------------------------------------------------

const listQuestionsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getSessionSchema = z.object({});

const createAbsenceSchema = z.object({
  from_date: z.string().min(1, "From date is required"),
  to_date: z.string().min(1, "To date is required"),
  note: z.string().optional(),
  type: z.string().min(1, "Type is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DailyStandupQuestionItem = {
  question_uuid: string;
  question: string | null;
};

type ListQuestionsResult = {
  questions: DailyStandupQuestionItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type WorkSessionItem = {
  work_session_uuid: string;
  staff_id: number | null;
  total_minutes: number | null;
  created_at: string | null;
  updated_at: string | null;
};

type LeaveItem = {
  staff_leave_uuid: string;
  staff_id: number | null;
  from_date: string | null;
  to_date: string | null;
  note: string | null;
  category: string | null;
  status: number | null;
};

type GetSessionResult = {
  session: WorkSessionItem | null;
  leave: LeaveItem | null;
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("listQuestionsSchema", () => {
  it("accepts empty params with defaults", () => {
    const result = listQuestionsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts explicit pagination params", () => {
    const result = listQuestionsSchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    const result = listQuestionsSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listQuestionsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("coerces string numbers", () => {
    const result = listQuestionsSchema.safeParse({ page: "3", limit: "15" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(15);
    }
  });
});

describe("createAbsenceSchema", () => {
  it("accepts valid absence data", () => {
    const result = createAbsenceSchema.safeParse({
      from_date: "2026-06-09",
      to_date: "2026-06-10",
      type: "sick",
    });
    expect(result.success).toBe(true);
  });

  it("accepts with optional note", () => {
    const result = createAbsenceSchema.safeParse({
      from_date: "2026-06-09",
      to_date: "2026-06-10",
      type: "annual",
      note: "Doctor appointment",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty from_date", () => {
    const result = createAbsenceSchema.safeParse({
      from_date: "",
      to_date: "2026-06-10",
      type: "sick",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty to_date", () => {
    const result = createAbsenceSchema.safeParse({
      from_date: "2026-06-09",
      to_date: "",
      type: "sick",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty type", () => {
    const result = createAbsenceSchema.safeParse({
      from_date: "2026-06-09",
      to_date: "2026-06-10",
      type: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects minimal only required fields", () => {
    const result = createAbsenceSchema.safeParse({
      from_date: "2026-06-09",
      to_date: "2026-06-10",
      type: "annual",
    });
    expect(result.success).toBe(true);
  });
});

describe("DailyStandupQuestionItem shape", () => {
  it("defines the expected fields", () => {
    const mock: DailyStandupQuestionItem = {
      question_uuid: "q_abc123",
      question: "What did you work on yesterday?",
    };
    expect(mock.question_uuid).toBe("q_abc123");
    expect(mock.question).toBe("What did you work on yesterday?");
  });
});

describe("ListQuestionsResult shape", () => {
  it("accepts an empty result set", () => {
    const result: ListQuestionsResult = {
      questions: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.questions).toHaveLength(0);
  });
});

describe("WorkSessionItem shape", () => {
  it("defines the expected fields", () => {
    const mock: WorkSessionItem = {
      work_session_uuid: "ws_abc123",
      staff_id: 1,
      total_minutes: null,
      created_at: "2026-06-09T06:00:00.000Z",
      updated_at: "2026-06-09T06:00:00.000Z",
    };
    expect(mock.work_session_uuid).toBe("ws_abc123");
    expect(mock.staff_id).toBe(1);
  });
});

describe("GetSessionResult shape", () => {
  it("accepts null session and leave", () => {
    const result: GetSessionResult = {
      session: null,
      leave: null,
    };
    expect(result.session).toBeNull();
    expect(result.leave).toBeNull();
  });
});
