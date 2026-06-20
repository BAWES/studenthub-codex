import { describe, it, expect } from "vitest";
import {
  listQuestionsResultSchema,
  getSessionResultSchema,
  createAbsenceResultSchema,
} from "./schemas";
import type {
  DailyStandupQuestionItem,
  WorkSessionItem,
  LeaveItem,
} from "./schemas";

// ---------------------------------------------------------------------------
// listQuestionsResultSchema
// ---------------------------------------------------------------------------
describe("listQuestionsResultSchema", () => {
  const valid = () => ({
    questions: [{ question_uuid: "q-1", question: "What did you work on?" }],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  it("accepts a valid paginated result", () => {
    expect(listQuestionsResultSchema.safeParse(valid()).success).toBe(true);
  });

  it("accepts nullable question", () => {
    expect(
      listQuestionsResultSchema.safeParse({
        ...valid(),
        questions: [{ question_uuid: "q-1", question: null }],
      }).success,
    ).toBe(true);
  });

  it("accepts empty questions array", () => {
    expect(
      listQuestionsResultSchema.safeParse({ ...valid(), questions: [] }).success,
    ).toBe(true);
  });

  it("rejects missing questions", () => {
    const { questions: _, ...rest } = valid();
    expect(listQuestionsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-array questions", () => {
    expect(
      listQuestionsResultSchema.safeParse({ ...valid(), questions: "not-array" }).success,
    ).toBe(false);
  });

  it("rejects non-number total", () => {
    expect(
      listQuestionsResultSchema.safeParse({ ...valid(), total: "ten" }).success,
    ).toBe(false);
  });

  it("rejects missing limit", () => {
    const { limit: _, ...rest } = valid();
    expect(listQuestionsResultSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getSessionResultSchema
// ---------------------------------------------------------------------------
describe("getSessionResultSchema", () => {
  const validSession = {
    session: {
      work_session_uuid: "ws-1",
      staff_id: 1,
      total_minutes: 480,
      created_at: "2026-06-14T05:00:00.000Z",
      updated_at: "2026-06-14T05:00:00.000Z",
    },
    leave: null,
  };

  const validLeave = {
    session: null,
    leave: {
      staff_leave_uuid: "sl-1",
      staff_id: 1,
      from_date: "2026-06-10",
      to_date: "2026-06-12",
      note: "Sick leave",
      category: "sick",
      status: 1,
    },
  };

  it("accepts session with no leave", () => {
    expect(getSessionResultSchema.safeParse(validSession).success).toBe(true);
  });

  it("accepts leave with no session", () => {
    expect(getSessionResultSchema.safeParse(validLeave).success).toBe(true);
  });

  it("accepts both null", () => {
    expect(
      getSessionResultSchema.safeParse({ session: null, leave: null }).success,
    ).toBe(true);
  });

  it("accepts nullable session fields", () => {
    expect(
      getSessionResultSchema.safeParse({
        session: {
          work_session_uuid: "ws-1",
          staff_id: null,
          total_minutes: null,
          created_at: null,
          updated_at: null,
        },
        leave: null,
      }).success,
    ).toBe(true);
  });

  it("accepts nullable leave fields", () => {
    expect(
      getSessionResultSchema.safeParse({
        session: null,
        leave: {
          staff_leave_uuid: "sl-1",
          staff_id: null,
          from_date: null,
          to_date: null,
          note: null,
          category: null,
          status: null,
        },
      }).success,
    ).toBe(true);
  });

  it("rejects missing session and leave", () => {
    expect(getSessionResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-object session", () => {
    expect(
      getSessionResultSchema.safeParse({ session: "invalid", leave: null }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createAbsenceResultSchema
// ---------------------------------------------------------------------------
describe("createAbsenceResultSchema", () => {
  const valid = { staff_leave_uuid: "sl-new-uuid" };

  it("accepts a valid create absence result", () => {
    expect(createAbsenceResultSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing staff_leave_uuid", () => {
    expect(createAbsenceResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-string staff_leave_uuid", () => {
    expect(
      createAbsenceResultSchema.safeParse({ staff_leave_uuid: 123 }).success,
    ).toBe(false);
  });
});
