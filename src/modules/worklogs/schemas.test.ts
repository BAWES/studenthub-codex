import { describe, it, expect } from "vitest";
import {
  worklogRowSchema,
  worklogStatsSchema,
  workingDateSchema,
  appealDetailSchema,
  listWorklogsResultSchema,
  getWorklogResultSchema,
  getWorklogStatsResultSchema,
  getWorkingDatesResultSchema,
  getAppealDetailResultSchema,
  worklogStateSchema,
  markAppealUpdateReadStateSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validWorklogRow = () => ({
  uuid: "550e8400-e29b-41d4-a716-446655440000",
  date: "2026-06-14",
  startTime: "09:00",
  endTime: "17:00",
  totalTime: 8,
  note: "Worked on feature implementation",
  status: 1,
  via: "mobile",
  storeId: 42,
});

const validWorklogRowMinimal = () => ({
  uuid: "550e8400-e29b-41d4-a716-446655440000",
  date: "2026-06-14",
  startTime: null,
  endTime: null,
  totalTime: null,
  note: null,
  status: 0,
  via: null,
  storeId: null,
});

// ---------------------------------------------------------------------------
// worklogRowSchema
// ---------------------------------------------------------------------------

describe("worklogRowSchema", () => {
  it("accepts a full worklog row", () => {
    const r = worklogRowSchema.safeParse(validWorklogRow());
    expect(r.success).toBe(true);
  });

  it("accepts a minimal worklog row (nullable fields set to null)", () => {
    const r = worklogRowSchema.safeParse(validWorklogRowMinimal());
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = worklogRowSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong types", () => {
    const r = worklogRowSchema.safeParse({
      ...validWorklogRow(),
      uuid: 123,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing uuid", () => {
    const r = worklogRowSchema.safeParse({
      ...validWorklogRow(),
      uuid: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing date", () => {
    const r = worklogRowSchema.safeParse({
      ...validWorklogRow(),
      date: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-number totalTime when provided", () => {
    const r = worklogRowSchema.safeParse({
      ...validWorklogRow(),
      totalTime: "eight",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-string startTime when provided", () => {
    const r = worklogRowSchema.safeParse({
      ...validWorklogRow(),
      startTime: 123,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// worklogStatsSchema
// ---------------------------------------------------------------------------

describe("worklogStatsSchema", () => {
  it("accepts a full stats object", () => {
    const r = worklogStatsSchema.safeParse({
      checkIn: "09:00",
      checkOut: "17:00",
      totalTime: 8,
      status: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts all-null stats", () => {
    const r = worklogStatsSchema.safeParse({
      checkIn: null,
      checkOut: null,
      totalTime: null,
      status: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = worklogStatsSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects non-number totalTime when provided", () => {
    const r = worklogStatsSchema.safeParse({
      checkIn: null,
      checkOut: null,
      totalTime: "eight",
      status: null,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-string checkIn when provided", () => {
    const r = worklogStatsSchema.safeParse({
      checkIn: 123,
      checkOut: null,
      totalTime: null,
      status: null,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// workingDateSchema
// ---------------------------------------------------------------------------

describe("workingDateSchema", () => {
  it("accepts a working date with time", () => {
    const r = workingDateSchema.safeParse({
      date: "2026-06-14",
      totalTime: 8,
    });
    expect(r.success).toBe(true);
  });

  it("accepts a working date with null totalTime", () => {
    const r = workingDateSchema.safeParse({
      date: "2026-06-14",
      totalTime: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = workingDateSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects missing date", () => {
    const r = workingDateSchema.safeParse({ totalTime: 8 });
    expect(r.success).toBe(false);
  });

  it("rejects non-number totalTime when provided", () => {
    const r = workingDateSchema.safeParse({
      date: "2026-06-14",
      totalTime: "eight",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-string date when provided", () => {
    const r = workingDateSchema.safeParse({
      date: 123,
      totalTime: null,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// appealDetailSchema
// ---------------------------------------------------------------------------

describe("appealDetailSchema", () => {
  it("accepts a full appeal detail", () => {
    const r = appealDetailSchema.safeParse({
      appealUuid: "aa0e8400-e29b-41d4-a716-446655440000",
      worklogUuid: "bb0e8400-e29b-41d4-a716-446655440001",
      reason: "Incorrect time record for June 14th",
      status: 1,
      createdAt: "2026-06-15T10:00:00Z",
    });
    expect(r.success).toBe(true);
  });

  it("accepts appeal with null reason", () => {
    const r = appealDetailSchema.safeParse({
      appealUuid: "aa0e8400-e29b-41d4-a716-446655440000",
      worklogUuid: "bb0e8400-e29b-41d4-a716-446655440001",
      reason: null,
      status: 0,
      createdAt: "2026-06-15T10:00:00Z",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = appealDetailSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects missing appealUuid", () => {
    const r = appealDetailSchema.safeParse({
      worklogUuid: "bb0e8400-e29b-41d4-a716-446655440001",
      reason: null,
      status: 0,
      createdAt: "2026-06-15T10:00:00Z",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-number status", () => {
    const r = appealDetailSchema.safeParse({
      appealUuid: "aa0e8400-e29b-41d4-a716-446655440000",
      worklogUuid: "bb0e8400-e29b-41d4-a716-446655440001",
      reason: null,
      status: "pending",
      createdAt: "2026-06-15T10:00:00Z",
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listWorklogsResultSchema
// ---------------------------------------------------------------------------

describe("listWorklogsResultSchema", () => {
  it("accepts a result with worklogs", () => {
    const r = listWorklogsResultSchema.safeParse({
      worklogs: [validWorklogRow(), validWorklogRowMinimal()],
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty worklogs array", () => {
    const r = listWorklogsResultSchema.safeParse({ worklogs: [] });
    expect(r.success).toBe(true);
  });

  it("accepts result with optional error", () => {
    const r = listWorklogsResultSchema.safeParse({
      worklogs: [],
      error: "Something went wrong",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing worklogs field", () => {
    const r = listWorklogsResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects invalid items in worklogs array", () => {
    const r = listWorklogsResultSchema.safeParse({
      worklogs: [{ uuid: 123 }],
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getWorklogResultSchema
// ---------------------------------------------------------------------------

describe("getWorklogResultSchema", () => {
  it("accepts a full worklog result", () => {
    const r = getWorklogResultSchema.safeParse({
      worklog: validWorklogRow(),
    });
    expect(r.success).toBe(true);
  });

  it("accepts nullable worklog", () => {
    const r = getWorklogResultSchema.safeParse({ worklog: null });
    expect(r.success).toBe(true);
  });

  it("accepts result with optional error", () => {
    const r = getWorklogResultSchema.safeParse({
      worklog: null,
      error: "Worklog not found",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing worklog field", () => {
    const r = getWorklogResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getWorklogStatsResultSchema
// ---------------------------------------------------------------------------

describe("getWorklogStatsResultSchema", () => {
  it("accepts a full stats result", () => {
    const r = getWorklogStatsResultSchema.safeParse({
      stats: {
        checkIn: "09:00",
        checkOut: "17:00",
        totalTime: 8,
        status: 1,
      },
    });
    expect(r.success).toBe(true);
  });

  it("accepts nullable stats", () => {
    const r = getWorklogStatsResultSchema.safeParse({ stats: null });
    expect(r.success).toBe(true);
  });

  it("accepts result with optional error", () => {
    const r = getWorklogStatsResultSchema.safeParse({
      stats: null,
      error: "Stats not available",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing stats field", () => {
    const r = getWorklogStatsResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getWorkingDatesResultSchema
// ---------------------------------------------------------------------------

describe("getWorkingDatesResultSchema", () => {
  it("accepts a result with working dates", () => {
    const r = getWorkingDatesResultSchema.safeParse({
      dates: [
        { date: "2026-06-14", totalTime: 8 },
        { date: "2026-06-15", totalTime: 7.5 },
      ],
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty dates array", () => {
    const r = getWorkingDatesResultSchema.safeParse({ dates: [] });
    expect(r.success).toBe(true);
  });

  it("accepts result with optional error", () => {
    const r = getWorkingDatesResultSchema.safeParse({
      dates: [],
      error: "No data for period",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing dates field", () => {
    const r = getWorkingDatesResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects invalid items in dates array", () => {
    const r = getWorkingDatesResultSchema.safeParse({
      dates: [{ date: 123 }],
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getAppealDetailResultSchema
// ---------------------------------------------------------------------------

describe("getAppealDetailResultSchema", () => {
  it("accepts a full appeal result", () => {
    const r = getAppealDetailResultSchema.safeParse({
      appeal: {
        appealUuid: "aa0e8400-e29b-41d4-a716-446655440000",
        worklogUuid: "bb0e8400-e29b-41d4-a716-446655440001",
        reason: "Incorrect time record",
        status: 1,
        createdAt: "2026-06-15T10:00:00Z",
      },
    });
    expect(r.success).toBe(true);
  });

  it("accepts nullable appeal", () => {
    const r = getAppealDetailResultSchema.safeParse({ appeal: null });
    expect(r.success).toBe(true);
  });

  it("accepts result with optional error", () => {
    const r = getAppealDetailResultSchema.safeParse({
      appeal: null,
      error: "Appeal not found",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing appeal field", () => {
    const r = getAppealDetailResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// worklogStateSchema
// ---------------------------------------------------------------------------

describe("worklogStateSchema", () => {
  it("accepts a success state", () => {
    const r = worklogStateSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("accepts a failure state", () => {
    const r = worklogStateSchema.safeParse({ success: false });
    expect(r.success).toBe(true);
  });

  it("accepts state with optional error", () => {
    const r = worklogStateSchema.safeParse({
      success: false,
      error: "Operation failed",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing success field", () => {
    const r = worklogStateSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects non-boolean success", () => {
    const r = worklogStateSchema.safeParse({ success: "yes" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// markAppealUpdateReadStateSchema
// ---------------------------------------------------------------------------

describe("markAppealUpdateReadStateSchema", () => {
  it("accepts a success state", () => {
    const r = markAppealUpdateReadStateSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("accepts a failure state", () => {
    const r = markAppealUpdateReadStateSchema.safeParse({ success: false });
    expect(r.success).toBe(true);
  });

  it("accepts state with optional error", () => {
    const r = markAppealUpdateReadStateSchema.safeParse({
      success: false,
      error: "Update not found",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing success field", () => {
    const r = markAppealUpdateReadStateSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects non-boolean success", () => {
    const r = markAppealUpdateReadStateSchema.safeParse({ success: "yes" });
    expect(r.success).toBe(false);
  });
});
