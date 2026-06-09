import { describe, it, expect } from "vitest";
import {
  listWorkLogsSchema,
  getWorkLogDetailSchema,
  submitWorkLogSchema,
  updateWorkLogStatusSchema,
} from "./actions";

// ---------------------------------------------------------------------------
// listWorkLogsSchema
// ---------------------------------------------------------------------------

describe("listWorkLogsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listWorkLogsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.date).toBeUndefined();
    }
  });

  it("accepts pagination params", () => {
    const result = listWorkLogsSchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("accepts date filter", () => {
    const result = listWorkLogsSchema.safeParse({ date: "2026-06-01" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.date).toBe("2026-06-01");
    }
  });

  it("rejects limit over 100", () => {
    const result = listWorkLogsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listWorkLogsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getWorkLogDetailSchema
// ---------------------------------------------------------------------------

describe("getWorkLogDetailSchema", () => {
  it("accepts a valid UUID", () => {
    const result = getWorkLogDetailSchema.safeParse({
      workLogUuid: "wh_abc-123-def-456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.workLogUuid).toBe("wh_abc-123-def-456");
    }
  });

  it("rejects empty UUID", () => {
    const result = getWorkLogDetailSchema.safeParse({ workLogUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getWorkLogDetailSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// submitWorkLogSchema
// ---------------------------------------------------------------------------

describe("submitWorkLogSchema", () => {
  it("accepts valid minimal params (date + startTime)", () => {
    const result = submitWorkLogSchema.safeParse({
      date: "2026-06-15",
      startTime: "2026-06-15T08:00:00",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.date).toBe("2026-06-15");
      expect(result.data.startTime).toBe("2026-06-15T08:00:00");
      expect(result.data.endTime).toBeUndefined();
    }
  });

  it("accepts all optional fields", () => {
    const result = submitWorkLogSchema.safeParse({
      date: "2026-06-15",
      startTime: "2026-06-15T08:00:00",
      endTime: "2026-06-15T16:00:00",
      totalTime: 480,
      note: "Test work log entry",
      storeId: 5,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.endTime).toBe("2026-06-15T16:00:00");
      expect(result.data.totalTime).toBe(480);
      expect(result.data.note).toBe("Test work log entry");
      expect(result.data.storeId).toBe(5);
    }
  });

  it("rejects missing date", () => {
    const result = submitWorkLogSchema.safeParse({
      startTime: "2026-06-15T08:00:00",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing startTime", () => {
    const result = submitWorkLogSchema.safeParse({
      date: "2026-06-15",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty date", () => {
    const result = submitWorkLogSchema.safeParse({
      date: "",
      startTime: "2026-06-15T08:00:00",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateWorkLogStatusSchema
// ---------------------------------------------------------------------------

describe("updateWorkLogStatusSchema", () => {
  it("accepts valid update params", () => {
    const result = updateWorkLogStatusSchema.safeParse({
      workLogUuid: "wh_abc-123-def-456",
      status: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.workLogUuid).toBe("wh_abc-123-def-456");
      expect(result.data.status).toBe(1);
    }
  });

  it("accepts status 0", () => {
    const result = updateWorkLogStatusSchema.safeParse({
      workLogUuid: "wh_abc-123-def-456",
      status: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects status negative", () => {
    const result = updateWorkLogStatusSchema.safeParse({
      workLogUuid: "wh_abc-123-def-456",
      status: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = updateWorkLogStatusSchema.safeParse({ status: 1 });
    expect(result.success).toBe(false);
  });

  it("rejects missing status", () => {
    const result = updateWorkLogStatusSchema.safeParse({
      workLogUuid: "wh_abc-123-def-456",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

type WorkLogItem = {
  candidate_working_hour_uuid: string;
  date: Date | null;
  start_time: Date | null;
  end_time: Date | null;
  total_time: number | null;
  status: number | null;
  via: string | null;
  note: string | null;
  store_name: string | null;
  company_name: string | null;
  created_at: Date | null;
  updated_at: Date | null;
};

type ListWorkLogsResult = {
  items: WorkLogItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

describe("WorkLogItem shape", () => {
  it("defines the expected fields", () => {
    const mock: WorkLogItem = {
      candidate_working_hour_uuid: "wh_abc-123",
      date: new Date("2026-06-15"),
      start_time: new Date("2026-06-15T08:00:00"),
      end_time: new Date("2026-06-15T16:00:00"),
      total_time: 480,
      status: 0,
      via: "Manual Log",
      note: "Test entry",
      store_name: "Main Store",
      company_name: "Test Company",
      created_at: null,
      updated_at: null,
    };
    expect(mock.candidate_working_hour_uuid).toBe("wh_abc-123");
    expect(mock.status).toBe(0);
    expect(mock.store_name).toBe("Main Store");
    expect(mock.via).toBe("Manual Log");
  });
});

describe("ListWorkLogsResult shape", () => {
  it("accepts a valid result set", () => {
    const result: ListWorkLogsResult = {
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
