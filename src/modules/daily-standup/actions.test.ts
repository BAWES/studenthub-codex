import { describe, it, expect } from "vitest";

import {
  listQuestionsSchema,
  createAbsenceSchema,
  dailyStandupQuestionItemSchema,
  listQuestionsResultSchema,
  workSessionItemSchema,
  leaveItemSchema,
  getSessionResultSchema,
  createAbsenceResultSchema,
  type DailyStandupQuestionItem,
  type ListQuestionsResult,
  type WorkSessionItem,
  type LeaveItem,
  type GetSessionResult,
  type CreateAbsenceResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Tests: input schemas
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

// ---------------------------------------------------------------------------
// Tests: output schemas
// ---------------------------------------------------------------------------

describe("dailyStandupQuestionItemSchema", () => {
  it("accepts a valid question item", () => {
    const result = dailyStandupQuestionItemSchema.safeParse({
      question_uuid: "q_abc123",
      question: "What did you work on yesterday?",
    });
    expect(result.success).toBe(true);
  });

  it("accepts null question", () => {
    const result = dailyStandupQuestionItemSchema.safeParse({
      question_uuid: "q_abc123",
      question: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing question_uuid", () => {
    const result = dailyStandupQuestionItemSchema.safeParse({
      question: "test",
    });
    expect(result.success).toBe(false);
  });
});

describe("listQuestionsResultSchema", () => {
  it("accepts an empty result set", () => {
    const result = listQuestionsResultSchema.safeParse({
      questions: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a populated result set", () => {
    const result = listQuestionsResultSchema.safeParse({
      questions: [
        { question_uuid: "q_1", question: "Yesterday?" },
        { question_uuid: "q_2", question: "Today?" },
      ],
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing fields", () => {
    const result = listQuestionsResultSchema.safeParse({
      questions: [],
      total: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("workSessionItemSchema", () => {
  it("accepts a valid work session item", () => {
    const result = workSessionItemSchema.safeParse({
      work_session_uuid: "ws_abc123",
      staff_id: 1,
      total_minutes: null,
      created_at: "2026-06-09T06:00:00.000Z",
      updated_at: "2026-06-09T06:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing work_session_uuid", () => {
    const result = workSessionItemSchema.safeParse({
      staff_id: 1,
      total_minutes: null,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(false);
  });
});

describe("leaveItemSchema", () => {
  it("accepts a valid leave item", () => {
    const result = leaveItemSchema.safeParse({
      staff_leave_uuid: "lv_abc123",
      staff_id: 1,
      from_date: "2026-06-09T06:00:00.000Z",
      to_date: "2026-06-10T06:00:00.000Z",
      note: "Doctor appointment",
      category: "sick",
      status: 0,
    });
    expect(result.success).toBe(true);
  });

  it("accepts null fields", () => {
    const result = leaveItemSchema.safeParse({
      staff_leave_uuid: "lv_abc123",
      staff_id: null,
      from_date: null,
      to_date: null,
      note: null,
      category: null,
      status: null,
    });
    expect(result.success).toBe(true);
  });
});

describe("getSessionResultSchema", () => {
  it("accepts null session and leave", () => {
    const result = getSessionResultSchema.safeParse({
      session: null,
      leave: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts populated session and null leave", () => {
    const result = getSessionResultSchema.safeParse({
      session: {
        work_session_uuid: "ws_abc",
        staff_id: 1,
        total_minutes: null,
        created_at: "2026-06-09T06:00:00.000Z",
        updated_at: "2026-06-09T06:00:00.000Z",
      },
      leave: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects session with missing fields", () => {
    const result = getSessionResultSchema.safeParse({
      session: { work_session_uuid: "ws_abc" },
      leave: null,
    });
    expect(result.success).toBe(false);
  });
});

describe("createAbsenceResultSchema", () => {
  it("accepts a valid createAbsence result", () => {
    const result = createAbsenceResultSchema.safeParse({
      staff_leave_uuid: "lv_abc123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing staff_leave_uuid", () => {
    const result = createAbsenceResultSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
