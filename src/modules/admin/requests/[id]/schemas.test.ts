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
// getRequestDetailSchema
// ---------------------------------------------------------------------------
describe("getRequestDetailSchema", () => {
  it("accepts valid request UUID", () => {
    const r = getRequestDetailSchema.safeParse({ requestUuid: "abc-123" });
    expect(r.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(getRequestDetailSchema.safeParse({ requestUuid: "" }).success).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(getRequestDetailSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// approveRequestSchema
// ---------------------------------------------------------------------------
describe("approveRequestSchema", () => {
  const valid = { requestUuid: "abc-123", reason: "Looks good" };

  it("accepts valid input", () => {
    expect(approveRequestSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects empty reason", () => {
    expect(
      approveRequestSchema.safeParse({ requestUuid: "abc-123", reason: "" }).success
    ).toBe(false);
  });

  it("rejects missing requestUuid", () => {
    expect(approveRequestSchema.safeParse({ reason: "ok" }).success).toBe(false);
  });

  it("rejects reason over 500 chars", () => {
    expect(
      approveRequestSchema.safeParse({
        requestUuid: "abc-123",
        reason: "x".repeat(501),
      }).success
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// rejectRequestSchema
// ---------------------------------------------------------------------------
describe("rejectRequestSchema", () => {
  const valid = { requestUuid: "abc-123", reason: "Missing documents" };

  it("accepts valid input", () => {
    expect(rejectRequestSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects empty reason", () => {
    expect(
      rejectRequestSchema.safeParse({ requestUuid: "abc-123", reason: "" }).success
    ).toBe(false);
  });

  it("rejects missing requestUuid", () => {
    expect(rejectRequestSchema.safeParse({ reason: "no" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// addCommentSchema
// ---------------------------------------------------------------------------
describe("addCommentSchema", () => {
  const valid = { requestUuid: "abc-123", comment: "Please check this" };

  it("accepts valid input", () => {
    expect(addCommentSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects empty comment", () => {
    expect(
      addCommentSchema.safeParse({ requestUuid: "abc-123", comment: "" }).success
    ).toBe(false);
  });

  it("rejects missing requestUuid", () => {
    expect(addCommentSchema.safeParse({ comment: "test" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// requestExistenceSchema
// ---------------------------------------------------------------------------
describe("requestExistenceSchema", () => {
  it("accepts valid existence", () => {
    const r = requestExistenceSchema.safeParse({ request_uuid: "abc-123" });
    expect(r.success).toBe(true);
  });

  it("accepts null (request not found)", () => {
    expect(requestExistenceSchema.safeParse(null).success).toBe(true);
  });

  it("rejects empty uuid", () => {
    expect(requestExistenceSchema.safeParse({ request_uuid: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// addCommentResultSchema
// ---------------------------------------------------------------------------
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
      }).success
    ).toBe(false);
  });
});