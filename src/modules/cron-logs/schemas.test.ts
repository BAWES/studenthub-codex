import { describe, it, expect } from "vitest";
import {
  cronLogItemSchema,
  listCronLogsResultSchema,
  getCronLogResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// cronLogItemSchema
// ---------------------------------------------------------------------------
describe("cronLogItemSchema", () => {
  const valid = {
    id: 1,
    task: "Typesense Index Sync",
    last_ran_at: new Date("2026-06-14T05:00:00"),
    last_output: "Indexing complete",
  };

  it("accepts a valid cron log item", () => {
    expect(cronLogItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(
      cronLogItemSchema.safeParse({
        ...valid,
        last_ran_at: null,
        last_output: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = valid;
    expect(cronLogItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing task", () => {
    const { task: _, ...rest } = valid;
    expect(cronLogItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-number id", () => {
    expect(
      cronLogItemSchema.safeParse({ ...valid, id: "abc" }).success,
    ).toBe(false);
  });

  it("rejects non-date last_ran_at", () => {
    expect(
      cronLogItemSchema.safeParse({ ...valid, last_ran_at: "2026-01-01" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCronLogsResultSchema
// ---------------------------------------------------------------------------
describe("listCronLogsResultSchema", () => {
  const valid = () => ({
    cronLogs: [
      { id: 1, task: "test", last_ran_at: null, last_output: null },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  it("accepts a valid paginated result", () => {
    expect(listCronLogsResultSchema.safeParse(valid()).success).toBe(true);
  });

  it("accepts empty cronLogs array", () => {
    expect(
      listCronLogsResultSchema.safeParse({ ...valid(), cronLogs: [] }).success,
    ).toBe(true);
  });

  it("rejects negative limit", () => {
    expect(
      listCronLogsResultSchema.safeParse({ ...valid(), limit: -5 }).success,
    ).toBe(false);
  });

  it("rejects zero limit", () => {
    expect(
      listCronLogsResultSchema.safeParse({ ...valid(), limit: 0 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getCronLogResultSchema
// ---------------------------------------------------------------------------
describe("getCronLogResultSchema", () => {
  it("accepts a valid cron log result", () => {
    expect(
      getCronLogResultSchema.safeParse({
        cronLog: { id: 1, task: "test", last_ran_at: null, last_output: null },
      }).success,
    ).toBe(true);
  });

  it("accepts null cronLog", () => {
    expect(
      getCronLogResultSchema.safeParse({ cronLog: null }).success,
    ).toBe(true);
  });

  it("rejects missing cronLog", () => {
    expect(getCronLogResultSchema.safeParse({}).success).toBe(false);
  });
});
