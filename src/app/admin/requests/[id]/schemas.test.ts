import { describe, it, expect } from "vitest";
import {
  getRequestDetailSchema,
  approveRequestSchema,
  rejectRequestSchema,
  addCommentSchema,
  requestExistenceSchema,
  addCommentResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests
// ---------------------------------------------------------------------------

describe("getRequestDetailSchema", () => {
  it("accepts valid UUID", () => {
    const r = getRequestDetailSchema.safeParse({ requestUuid: "abc-123" });
    expect(r.success).toBe(true);
  });

  it("rejects missing requestUuid", () => {
    expect(getRequestDetailSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty requestUuid", () => {
    expect(getRequestDetailSchema.safeParse({ requestUuid: "" }).success).toBe(false);
  });
});

describe("approveRequestSchema", () => {
  it("accepts valid input", () => {
    const r = approveRequestSchema.safeParse({
      requestUuid: "abc-123",
      reason: "Approved by admin",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing reason", () => {
    expect(
      approveRequestSchema.safeParse({ requestUuid: "abc-123" }).success,
    ).toBe(false);
  });

  it("rejects empty reason", () => {
    expect(
      approveRequestSchema.safeParse({
        requestUuid: "abc-123",
        reason: "",
      }).success,
    ).toBe(false);
  });
});

describe("rejectRequestSchema", () => {
  it("accepts valid input", () => {
    const r = rejectRequestSchema.safeParse({
      requestUuid: "abc-123",
      reason: "Missing documents",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing reason", () => {
    expect(
      rejectRequestSchema.safeParse({ requestUuid: "abc-123" }).success,
    ).toBe(false);
  });

  it("rejects reason over 500 chars", () => {
    expect(
      rejectRequestSchema.safeParse({
        requestUuid: "abc-123",
        reason: "x".repeat(501),
      }).success,
    ).toBe(false);
  });
});

describe("addCommentSchema", () => {
  it("accepts valid comment", () => {
    const r = addCommentSchema.safeParse({
      requestUuid: "abc-123",
      comment: "Need to review documents",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing comment", () => {
    expect(
      addCommentSchema.safeParse({ requestUuid: "abc-123" }).success,
    ).toBe(false);
  });

  it("rejects empty comment", () => {
    expect(
      addCommentSchema.safeParse({
        requestUuid: "abc-123",
        comment: "",
      }).success,
    ).toBe(false);
  });

  it("rejects comment over 2000 chars", () => {
    expect(
      addCommentSchema.safeParse({
        requestUuid: "abc-123",
        comment: "x".repeat(2001),
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("requestExistenceSchema", () => {
  it("accepts valid existence data", () => {
    const r = requestExistenceSchema.safeParse({
      request_uuid: "abc-123",
    });
    expect(r.success).toBe(true);
    expect(r.data).not.toBeNull();
  });

  it("accepts null", () => {
    expect(requestExistenceSchema.safeParse(null).success).toBe(true);
  });

  it("rejects missing request_uuid", () => {
    expect(requestExistenceSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty request_uuid", () => {
    expect(
      requestExistenceSchema.safeParse({ request_uuid: "" }).success,
    ).toBe(false);
  });
});

describe("addCommentResultSchema", () => {
  it("accepts success result", () => {
    const r = addCommentResultSchema.safeParse({
      operation: "success",
      message: "Comment added",
    });
    expect(r.success).toBe(true);
  });

  it("accepts error result", () => {
    const r = addCommentResultSchema.safeParse({
      operation: "error",
      message: "Request not found",
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid operation", () => {
    expect(
      addCommentResultSchema.safeParse({
        operation: "invalid",
        message: "test",
      }).success,
    ).toBe(false);
  });

  it("rejects missing message", () => {
    expect(
      addCommentResultSchema.safeParse({ operation: "success" }).success,
    ).toBe(false);
  });
});
