import { describe, it, expect } from "vitest";
import {
  listQuestionsSchema,
  createAbsenceSchema,
  listQuestionsResultSchema,
  getSessionResultSchema,
  createAbsenceResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests
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
// Output schema tests
// ---------------------------------------------------------------------------

describe("listQuestionsResultSchema", () => {
  it("accepts a valid result with questions", () => {
    const result = listQuestionsResultSchema.safeParse({
      questions: [
        {
          question_uuid: "q_abc123",
          question: "What did you work on yesterday?",
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

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

  it("rejects missing total", () => {
    const result = listQuestionsResultSchema.safeParse({
      questions: [],
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid question shape (missing question)", () => {
    const result = listQuestionsResultSchema.safeParse({
      questions: [{ question_uuid: "q_abc123" }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(false);
  });
});

describe("getSessionResultSchema", () => {
  it("accepts null session and null leave", () => {
    const result = getSessionResultSchema.safeParse({
      session: null,
      leave: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a full session with leave", () => {
    const result = getSessionResultSchema.safeParse({
      session: {
        work_session_uuid: "ws_abc123",
        staff_id: 1,
        total_minutes: null,
        created_at: "2026-06-09T06:00:00.000Z",
        updated_at: "2026-06-09T06:00:00.000Z",
      },
      leave: {
        staff_leave_uuid: "lv_abc123",
        staff_id: 1,
        from_date: "2026-06-09T00:00:00.000Z",
        to_date: "2026-06-10T00:00:00.000Z",
        note: "Feeling unwell",
        category: "sick",
        status: 0,
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects session with missing work_session_uuid", () => {
    const result = getSessionResultSchema.safeParse({
      session: {
        staff_id: 1,
        total_minutes: null,
        created_at: null,
        updated_at: null,
      },
      leave: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects leave with missing staff_leave_uuid", () => {
    const result = getSessionResultSchema.safeParse({
      session: null,
      leave: {
        staff_id: 1,
        from_date: null,
        to_date: null,
        note: null,
        category: null,
        status: null,
      },
    });
    expect(result.success).toBe(false);
  });
});

describe("createAbsenceResultSchema", () => {
  it("accepts a valid absence result", () => {
    const result = createAbsenceResultSchema.safeParse({
      staff_leave_uuid: "lv_abc123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing staff_leave_uuid", () => {
    const result = createAbsenceResultSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-string staff_leave_uuid", () => {
    const result = createAbsenceResultSchema.safeParse({
      staff_leave_uuid: 123,
    });
    expect(result.success).toBe(false);
  });
});
