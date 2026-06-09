import { describe, it, expect } from "vitest";
import {
  listScheduleSchema,
  getScheduleItemSchema,
  updateScheduleStatusSchema,
} from "./actions";

// ---------------------------------------------------------------------------
// listScheduleSchema
// ---------------------------------------------------------------------------

describe("listScheduleSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listScheduleSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.date).toBeUndefined();
    }
  });

  it("accepts pagination params", () => {
    const result = listScheduleSchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("accepts date filter", () => {
    const result = listScheduleSchema.safeParse({ date: "2026-06-01" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.date).toBe("2026-06-01");
    }
  });

  it("rejects limit over 100", () => {
    const result = listScheduleSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listScheduleSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getScheduleItemSchema
// ---------------------------------------------------------------------------

describe("getScheduleItemSchema", () => {
  it("accepts a valid UUID", () => {
    const result = getScheduleItemSchema.safeParse({
      cwdUuid: "abc-123-def-456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cwdUuid).toBe("abc-123-def-456");
    }
  });

  it("rejects empty UUID", () => {
    const result = getScheduleItemSchema.safeParse({ cwdUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getScheduleItemSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateScheduleStatusSchema
// ---------------------------------------------------------------------------

describe("updateScheduleStatusSchema", () => {
  it("accepts valid update params", () => {
    const result = updateScheduleStatusSchema.safeParse({
      cwdUuid: "abc-123-def-456",
      status: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cwdUuid).toBe("abc-123-def-456");
      expect(result.data.status).toBe(1);
    }
  });

  it("accepts status 0 (Pending)", () => {
    const result = updateScheduleStatusSchema.safeParse({
      cwdUuid: "abc-123-def-456",
      status: 0,
    });
    expect(result.success).toBe(true);
  });

  it("accepts status 2 (Cancelled)", () => {
    const result = updateScheduleStatusSchema.safeParse({
      cwdUuid: "abc-123-def-456",
      status: 2,
    });
    expect(result.success).toBe(true);
  });

  it("accepts status 3 (Completed)", () => {
    const result = updateScheduleStatusSchema.safeParse({
      cwdUuid: "abc-123-def-456",
      status: 3,
    });
    expect(result.success).toBe(true);
  });

  it("rejects status out of range (negative)", () => {
    const result = updateScheduleStatusSchema.safeParse({
      cwdUuid: "abc-123-def-456",
      status: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects status out of range (>3)", () => {
    const result = updateScheduleStatusSchema.safeParse({
      cwdUuid: "abc-123-def-456",
      status: 99,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = updateScheduleStatusSchema.safeParse({ status: 1 });
    expect(result.success).toBe(false);
  });

  it("rejects missing status", () => {
    const result = updateScheduleStatusSchema.safeParse({
      cwdUuid: "abc-123-def-456",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

type ScheduleItem = {
  cwd_uuid: string;
  date: Date;
  start_time: Date;
  end_time: Date | null;
  total_time: number | null;
  status: number | null;
  store_name: string | null;
  company_name: string | null;
  created_at: Date | null;
  updated_at: Date | null;
};

type ListScheduleResult = {
  items: ScheduleItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

describe("ScheduleItem shape", () => {
  it("defines the expected fields", () => {
    const mock: ScheduleItem = {
      cwd_uuid: "abc-123",
      date: new Date("2026-06-15"),
      start_time: new Date("2026-06-15T08:00:00"),
      end_time: new Date("2026-06-15T16:00:00"),
      total_time: 480,
      status: 1,
      store_name: "Main Store",
      company_name: "Test Company",
      created_at: null,
      updated_at: null,
    };
    expect(mock.cwd_uuid).toBe("abc-123");
    expect(mock.status).toBe(1);
    expect(mock.store_name).toBe("Main Store");
  });
});

describe("ListScheduleResult shape", () => {
  it("accepts a valid result set", () => {
    const result: ListScheduleResult = {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.items).toHaveLength(0);
  });
});
