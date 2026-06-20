import { describe, it, expect } from "vitest";
import {
  listAppealsSchema,
  getAppealSchema,
  createAppealSchema,
  updateAppealStatusSchema,
  listAppealUpdatesSchema,
  createAppealUpdateSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema validation tests for work-log appeal server actions
//
// Testing schemas separately avoids mocking "use server" dependencies
// (prisma, session), following the existing pattern in worklogs/actions.test.ts.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// listAppealsSchema tests
// ---------------------------------------------------------------------------

describe("listAppealsSchema", () => {
  it("accepts empty params", () => {
    const result = listAppealsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts status filter", () => {
    const result = listAppealsSchema.safeParse({ status: 0 });
    expect(result.success).toBe(true);
  });

  it("accepts candidate_id filter", () => {
    const result = listAppealsSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(true);
  });

  it("accepts date range filter", () => {
    const result = listAppealsSchema.safeParse({
      startDate: "2026-06-01",
      endDate: "2026-06-30",
    });
    expect(result.success).toBe(true);
  });

  it("accepts pagination params", () => {
    const result = listAppealsSchema.safeParse({ page: 2, limit: 50 });
    expect(result.success).toBe(true);
  });

  it("accepts all filters combined", () => {
    const result = listAppealsSchema.safeParse({
      candidateId: 42,
      status: 1,
      startDate: "2026-06-01",
      endDate: "2026-06-30",
      page: 1,
      limit: 20,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid date format", () => {
    const result = listAppealsSchema.safeParse({ startDate: "01-06-2026" });
    expect(result.success).toBe(false);
  });

  it("rejects negative limit", () => {
    const result = listAppealsSchema.safeParse({ limit: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listAppealsSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listAppealsSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative candidate ID", () => {
    const result = listAppealsSchema.safeParse({ candidateId: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects negative status", () => {
    const result = listAppealsSchema.safeParse({ status: -1 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getAppealSchema tests
// ---------------------------------------------------------------------------

describe("getAppealSchema", () => {
  it("accepts valid appeal UUID", () => {
    const result = getAppealSchema.safeParse({ appealUuid: "appeal_abc123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = getAppealSchema.safeParse({ appealUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getAppealSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createAppealSchema tests
// ---------------------------------------------------------------------------

describe("createAppealSchema", () => {
  it("accepts valid params with all fields", () => {
    const result = createAppealSchema.safeParse({
      worklogUuid: "wl_abc123",
      reason: "I worked 8 hours but the system shows 4.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing worklog UUID", () => {
    const result = createAppealSchema.safeParse({
      reason: "I worked 8 hours but the system shows 4.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty worklog UUID", () => {
    const result = createAppealSchema.safeParse({
      worklogUuid: "",
      reason: "I worked 8 hours but the system shows 4.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects too-short reason", () => {
    const result = createAppealSchema.safeParse({
      worklogUuid: "wl_abc123",
      reason: "Too short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing reason", () => {
    const result = createAppealSchema.safeParse({
      worklogUuid: "wl_abc123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects too-long reason", () => {
    const result = createAppealSchema.safeParse({
      worklogUuid: "wl_abc123",
      reason: "x".repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateAppealStatusSchema tests
// ---------------------------------------------------------------------------

describe("updateAppealStatusSchema", () => {
  it("accepts valid approve resolution with note", () => {
    const result = updateAppealStatusSchema.safeParse({
      appealUuid: "appeal_abc123",
      resolution: "approve",
      note: "Approved — verified timesheets.",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid reject resolution without note", () => {
    const result = updateAppealStatusSchema.safeParse({
      appealUuid: "appeal_abc123",
      resolution: "reject",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing appeal UUID", () => {
    const result = updateAppealStatusSchema.safeParse({
      resolution: "approve",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty appeal UUID", () => {
    const result = updateAppealStatusSchema.safeParse({
      appealUuid: "",
      resolution: "approve",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid resolution", () => {
    const result = updateAppealStatusSchema.safeParse({
      appealUuid: "appeal_abc123",
      resolution: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing resolution", () => {
    const result = updateAppealStatusSchema.safeParse({
      appealUuid: "appeal_abc123",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listAppealUpdatesSchema tests
// ---------------------------------------------------------------------------

describe("listAppealUpdatesSchema", () => {
  it("accepts valid appeal UUID", () => {
    const result = listAppealUpdatesSchema.safeParse({ appealUuid: "appeal_abc123" });
    expect(result.success).toBe(true);
  });

  it("accepts appeal UUID with pagination", () => {
    const result = listAppealUpdatesSchema.safeParse({
      appealUuid: "appeal_abc123",
      page: 1,
      limit: 10,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = listAppealUpdatesSchema.safeParse({ appealUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = listAppealUpdatesSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createAppealUpdateSchema tests
// ---------------------------------------------------------------------------

describe("createAppealUpdateSchema", () => {
  it("accepts valid params with update and detail", () => {
    const result = createAppealUpdateSchema.safeParse({
      appealUuid: "appeal_abc123",
      update: "Reviewed timesheets",
      detail: "The candidate has submitted valid proof of work.",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid params with only update", () => {
    const result = createAppealUpdateSchema.safeParse({
      appealUuid: "appeal_abc123",
      update: "Reviewed timesheets",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing appeal UUID", () => {
    const result = createAppealUpdateSchema.safeParse({
      update: "Reviewed timesheets",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty appeal UUID", () => {
    const result = createAppealUpdateSchema.safeParse({
      appealUuid: "",
      update: "Reviewed timesheets",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing update text", () => {
    const result = createAppealUpdateSchema.safeParse({
      appealUuid: "appeal_abc123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty update text", () => {
    const result = createAppealUpdateSchema.safeParse({
      appealUuid: "appeal_abc123",
      update: "",
    });
    expect(result.success).toBe(false);
  });
});
