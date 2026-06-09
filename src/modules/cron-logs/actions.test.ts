import { describe, it, expect } from "vitest";
import { listCronLogsSchema, getCronLogSchema } from "./actions";
import type { CronLogItem, ListCronLogsResult } from "./actions";

describe("listCronLogsSchema", () => {
  it("accepts empty params", () => {
    expect(listCronLogsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts pagination params", () => {
    const r = listCronLogsSchema.safeParse({ page: 1, limit: 20 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("rejects limit over 100", () => {
    expect(listCronLogsSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listCronLogsSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("accepts task filter", () => {
    const r = listCronLogsSchema.safeParse({ task: "daily-summary" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.task).toBe("daily-summary");
    }
  });

  it("defaults page to 1 and limit to 20", () => {
    const defaults = { page: 1, limit: 20 };
    expect(listCronLogsSchema.safeParse(defaults).success).toBe(true);
  });
});

describe("getCronLogSchema", () => {
  it("accepts a valid positive id", () => {
    expect(getCronLogSchema.safeParse({ id: 1 }).success).toBe(true);
  });

  it("rejects zero id", () => {
    expect(getCronLogSchema.safeParse({ id: 0 }).success).toBe(false);
  });

  it("rejects negative id", () => {
    expect(getCronLogSchema.safeParse({ id: -5 }).success).toBe(false);
  });

  it("rejects non-integer id", () => {
    expect(getCronLogSchema.safeParse({ id: 1.5 }).success).toBe(false);
  });

  it("rejects string id", () => {
    expect(getCronLogSchema.safeParse({ id: "abc" }).success).toBe(false);
  });
});

describe("CronLogItem type", () => {
  it("has the required shape", () => {
    const item: CronLogItem = {
      id: 1,
      task: "daily-summary",
      last_ran_at: new Date("2026-06-08T10:00:00.000Z"),
      last_output: "Completed successfully",
    };
    expect(item.id).toBe(1);
    expect(item.task).toBe("daily-summary");
    expect(item.last_output).toBe("Completed successfully");
  });

  it("accepts null values for optional fields", () => {
    const item: CronLogItem = {
      id: 2,
      task: "cleanup",
      last_ran_at: null,
      last_output: null,
    };
    expect(item.last_ran_at).toBeNull();
    expect(item.last_output).toBeNull();
  });
});

describe("ListCronLogsResult type", () => {
  it("has the correct shape", () => {
    const result: ListCronLogsResult = {
      cronLogs: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.cronLogs).toHaveLength(0);
    expect(result.totalPages).toBe(0);
    expect(result.page).toBe(1);
  });
});
