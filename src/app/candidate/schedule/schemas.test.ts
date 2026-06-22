import { describe, it, expect } from "vitest";
import {
  listScheduleSchema,
  getScheduleItemSchema,
  getScheduleDetailSchema,
  updateScheduleStatusSchema,
  scheduleItemOutputSchema,
  scheduleStatusResultOutputSchema,
  scheduleDetailOutputSchema,
} from "./schemas";

describe("listScheduleSchema", () => {
  it("accepts empty input (uses defaults)", () => {
    expect(listScheduleSchema.safeParse({}).success).toBe(true);
  });

  it("accepts valid input with all fields", () => {
    expect(
      listScheduleSchema.safeParse({
        page: 1,
        limit: 20,
        dateFrom: "2025-01-01",
        dateTo: "2025-12-31",
      }).success
    ).toBe(true);
  });

  it("rejects page less than 1", () => {
    expect(listScheduleSchema.safeParse({ page: 0 }).success).toBe(false);
    expect(listScheduleSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects limit greater than 100", () => {
    expect(listScheduleSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects limit less than 1", () => {
    expect(listScheduleSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects non-numeric page", () => {
    expect(listScheduleSchema.safeParse({ page: "abc" }).success).toBe(false);
  });
});

describe("getScheduleItemSchema", () => {
  it("accepts valid input", () => {
    expect(
      getScheduleItemSchema.safeParse({ cwd_uuid: "cwd-123" }).success
    ).toBe(true);
  });

  it("rejects empty object", () => {
    expect(getScheduleItemSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty cwd_uuid", () => {
    expect(getScheduleItemSchema.safeParse({ cwd_uuid: "" }).success).toBe(false);
  });

  it("rejects non-string cwd_uuid", () => {
    expect(getScheduleItemSchema.safeParse({ cwd_uuid: 123 }).success).toBe(false);
  });
});

describe("getScheduleDetailSchema", () => {
  it("accepts valid input", () => {
    expect(
      getScheduleDetailSchema.safeParse({ cwd_uuid: "cwd-456" }).success
    ).toBe(true);
  });

  it("rejects empty object", () => {
    expect(getScheduleDetailSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty cwd_uuid", () => {
    expect(getScheduleDetailSchema.safeParse({ cwd_uuid: "" }).success).toBe(false);
  });
});

describe("updateScheduleStatusSchema", () => {
  it("accepts valid status 0 (Pending)", () => {
    expect(
      updateScheduleStatusSchema.safeParse({ cwd_uuid: "cwd-789", status: 0 }).success
    ).toBe(true);
  });

  it("accepts valid status 1 (Confirmed)", () => {
    expect(
      updateScheduleStatusSchema.safeParse({ cwd_uuid: "cwd-789", status: 1 }).success
    ).toBe(true);
  });

  it("accepts valid status 2 (Cancelled)", () => {
    expect(
      updateScheduleStatusSchema.safeParse({ cwd_uuid: "cwd-789", status: 2 }).success
    ).toBe(true);
  });

  it("accepts valid status 3 (Completed)", () => {
    expect(
      updateScheduleStatusSchema.safeParse({ cwd_uuid: "cwd-789", status: 3 }).success
    ).toBe(true);
  });

  it("rejects empty object", () => {
    expect(updateScheduleStatusSchema.safeParse({}).success).toBe(false);
  });

  it("rejects missing cwd_uuid", () => {
    expect(updateScheduleStatusSchema.safeParse({ status: 1 }).success).toBe(false);
  });

  it("rejects missing status", () => {
    expect(
      updateScheduleStatusSchema.safeParse({ cwd_uuid: "cwd-789" }).success
    ).toBe(false);
  });

  it("rejects invalid status value (-1)", () => {
    expect(
      updateScheduleStatusSchema.safeParse({ cwd_uuid: "cwd-789", status: -1 }).success
    ).toBe(false);
  });

  it("rejects invalid status value (4)", () => {
    expect(
      updateScheduleStatusSchema.safeParse({ cwd_uuid: "cwd-789", status: 4 }).success
    ).toBe(false);
  });

  it("rejects non-integer status", () => {
    expect(
      updateScheduleStatusSchema.safeParse({ cwd_uuid: "cwd-789", status: 1.5 }).success
    ).toBe(false);
  });

  it("rejects non-number status", () => {
    expect(
      updateScheduleStatusSchema.safeParse({ cwd_uuid: "cwd-789", status: "abc" }).success
    ).toBe(false);
  });
});

describe("scheduleItemOutputSchema", () => {
  const validOutput = {
    cwd_uuid: "cwd-001",
    date: new Date("2025-06-01"),
    start_time: new Date("2025-06-01T09:00:00"),
    end_time: new Date("2025-06-01T17:00:00"),
    total_time: 8,
    status: 1,
    store_name: "Store A",
    company_name: "Company X",
  };

  it("accepts valid output", () => {
    expect(scheduleItemOutputSchema.safeParse(validOutput).success).toBe(true);
  });

  it("accepts valid output with null end_time", () => {
    expect(
      scheduleItemOutputSchema.safeParse({ ...validOutput, end_time: null }).success
    ).toBe(true);
  });

  it("rejects missing cwd_uuid", () => {
    const { cwd_uuid, ...rest } = validOutput;
    expect(scheduleItemOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects invalid date type", () => {
    expect(
      scheduleItemOutputSchema.safeParse({ ...validOutput, date: "2025-06-01" }).success
    ).toBe(false);
  });
});

describe("scheduleStatusResultOutputSchema", () => {
  it("accepts valid output", () => {
    expect(
      scheduleStatusResultOutputSchema.safeParse({
        cwd_uuid: "cwd-002",
        status: 1,
      }).success
    ).toBe(true);
  });

  it("rejects non-integer status", () => {
    expect(
      scheduleStatusResultOutputSchema.safeParse({
        cwd_uuid: "cwd-002",
        status: 1.5,
      }).success
    ).toBe(false);
  });

  it("rejects missing cwd_uuid", () => {
    expect(
      scheduleStatusResultOutputSchema.safeParse({ status: 1 }).success
    ).toBe(false);
  });
});

describe("scheduleDetailOutputSchema", () => {
  const now = new Date();
  const validDetail = {
    cwd_uuid: "cwd-003",
    date: now,
    start_time: now,
    end_time: now,
    total_time: 8,
    status: 1,
    created_at: now,
    updated_at: now,
    store: {
      store_name: "Store B",
      company: {
        company_name: "Company Y",
      },
    },
  };

  it("accepts valid output with nested store", () => {
    expect(scheduleDetailOutputSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts valid output with nullable store", () => {
    expect(
      scheduleDetailOutputSchema.safeParse({ ...validDetail, store: null }).success
    ).toBe(true);
  });

  it("accepts valid output with nullable company inside store", () => {
    expect(
      scheduleDetailOutputSchema.safeParse({
        ...validDetail,
        store: { store_name: "Store B", company: null },
      }).success
    ).toBe(true);
  });

  it("rejects missing cwd_uuid", () => {
    const { cwd_uuid, ...rest } = validDetail;
    expect(scheduleDetailOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects invalid date for date field", () => {
    expect(
      scheduleDetailOutputSchema.safeParse({ ...validDetail, date: "not-a-date" }).success
    ).toBe(false);
  });
});
