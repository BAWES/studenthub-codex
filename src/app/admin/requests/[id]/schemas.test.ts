import { describe, it, expect } from "vitest";
import {
  getRequestDetailSchema,
  approveRequestSchema,
  rejectRequestSchema,
  addCommentSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// getRequestDetailSchema
// ---------------------------------------------------------------------------
describe("getRequestDetailSchema", () => {
  it("accepts valid input", () => {
    expect(getRequestDetailSchema.safeParse({ requestUuid: "req-123" }).success).toBe(true);
  });

  it("rejects missing requestUuid", () => {
    expect(getRequestDetailSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty requestUuid", () => {
    expect(getRequestDetailSchema.safeParse({ requestUuid: "" }).success).toBe(false);
  });

  it("rejects wrong type", () => {
    expect(getRequestDetailSchema.safeParse({ requestUuid: 123 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// approveRequestSchema
// ---------------------------------------------------------------------------
describe("approveRequestSchema", () => {
  const validInput = { requestUuid: "req-123", reason: "Approved by manager" };

  it("accepts valid input", () => {
    expect(approveRequestSchema.safeParse(validInput).success).toBe(true);
  });

  it("rejects missing requestUuid", () => {
    expect(approveRequestSchema.safeParse({ reason: "Approved" }).success).toBe(false);
  });

  it("rejects empty requestUuid", () => {
    expect(approveRequestSchema.safeParse({ requestUuid: "", reason: "Approved" }).success).toBe(false);
  });

  it("rejects missing reason", () => {
    expect(approveRequestSchema.safeParse({ requestUuid: "req-1" }).success).toBe(false);
  });

  it("rejects empty reason", () => {
    expect(approveRequestSchema.safeParse({ requestUuid: "req-1", reason: "" }).success).toBe(false);
  });

  it("rejects reason exceeding 500 chars", () => {
    expect(
      approveRequestSchema.safeParse({ requestUuid: "req-1", reason: "x".repeat(501) }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// rejectRequestSchema
// ---------------------------------------------------------------------------
describe("rejectRequestSchema", () => {
  const validInput = { requestUuid: "req-123", reason: "Missing documentation" };

  it("accepts valid input", () => {
    expect(rejectRequestSchema.safeParse(validInput).success).toBe(true);
  });

  it("rejects missing requestUuid", () => {
    expect(rejectRequestSchema.safeParse({ reason: "No" }).success).toBe(false);
  });

  it("rejects empty requestUuid", () => {
    expect(rejectRequestSchema.safeParse({ requestUuid: "", reason: "No" }).success).toBe(false);
  });

  it("rejects missing reason", () => {
    expect(rejectRequestSchema.safeParse({ requestUuid: "req-1" }).success).toBe(false);
  });

  it("rejects empty reason", () => {
    expect(rejectRequestSchema.safeParse({ requestUuid: "req-1", reason: "" }).success).toBe(false);
  });

  it("rejects reason exceeding 500 chars", () => {
    expect(
      rejectRequestSchema.safeParse({ requestUuid: "req-1", reason: "x".repeat(501) }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// addCommentSchema
// ---------------------------------------------------------------------------
describe("addCommentSchema", () => {
  const validInput = { requestUuid: "req-123", comment: "Please review the attached files" };

  it("accepts valid input", () => {
    expect(addCommentSchema.safeParse(validInput).success).toBe(true);
  });

  it("rejects missing requestUuid", () => {
    expect(addCommentSchema.safeParse({ comment: "Review please" }).success).toBe(false);
  });

  it("rejects empty requestUuid", () => {
    expect(addCommentSchema.safeParse({ requestUuid: "", comment: "Review" }).success).toBe(false);
  });

  it("rejects missing comment", () => {
    expect(addCommentSchema.safeParse({ requestUuid: "req-1" }).success).toBe(false);
  });

  it("rejects empty comment", () => {
    expect(addCommentSchema.safeParse({ requestUuid: "req-1", comment: "" }).success).toBe(false);
  });

  it("rejects comment exceeding 2000 chars", () => {
    expect(
      addCommentSchema.safeParse({ requestUuid: "req-1", comment: "x".repeat(2001) }).success,
    ).toBe(false);
  });
});
