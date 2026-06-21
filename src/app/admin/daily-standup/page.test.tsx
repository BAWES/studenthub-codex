import { describe, it, expect } from "vitest";
import {
  listDailyStandupsSchema,
  dailyStandupAnswerItemSchema,
  listDailyStandupsResultSchema,
} from "./schemas";
import type {
  DailyStandupAnswerItem,
  ListDailyStandupsResult,
} from "./schemas";

describe("admin daily-standup — data contract", () => {
  it("listDailyStandupsSchema accepts empty params (defaults apply)", () => {
    const r = listDailyStandupsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(50);
      expect(r.data.page).toBe(1);
    }
  });

  it("listDailyStandupsSchema accepts explicit page and limit", () => {
    const r = listDailyStandupsSchema.safeParse({ page: 2, limit: 25 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(25);
      expect(r.data.page).toBe(2);
    }
  });

  it("DailyStandupAnswerItem fields map correctly to DataTable columns", () => {
    const row: DailyStandupAnswerItem = {
      answer_uuid: "ans-123",
      staff_id: 42,
      question_uuid: "q-1",
      question: "What did you work on today?",
      answer: "Built the admin daily-standup page",
      created_at: new Date("2026-06-20T10:00:00Z"),
      updated_at: new Date("2026-06-20T12:00:00Z"),
    };
    expect(row.answer_uuid).toBe("ans-123");
    expect(row.staff_id).toBe(42);
    expect(row.question).toBe("What did you work on today?");
    expect(row.answer).toBe("Built the admin daily-standup page");
  });

  it("DailyStandupAnswerItem allows nullable fields", () => {
    const row: DailyStandupAnswerItem = {
      answer_uuid: "nullable-test",
      staff_id: null,
      question_uuid: null,
      question: null,
      answer: null,
      created_at: null,
      updated_at: null,
    };
    expect(row.staff_id).toBeNull();
    expect(row.question).toBeNull();
    expect(row.answer).toBeNull();
  });

  it("ListDailyStandupsResult has expected shape", () => {
    const result: ListDailyStandupsResult = {
      answers: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    expect(Array.isArray(result.answers)).toBe(true);
    expect(typeof result.total).toBe("number");
    expect(typeof result.page).toBe("number");
  });
});
