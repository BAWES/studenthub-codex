import { describe, it, expect } from "vitest";
import {
  updateRequestStatusSchema,
  deleteRequestSchema,
  getCompanyRequestDetailSchema,
} from "../schemas";

// ---------------------------------------------------------------------------
// Pure logic: Zod schema validation for company/requests/[id] server actions
//
// updateRequestStatusSchema, deleteRequestSchema, and
// getCompanyRequestDetailSchema are validated here without mocking prisma or
// session infra.
// ---------------------------------------------------------------------------

describe("updateRequestStatusSchema", () => {
  it("accepts a valid status transition to started", () => {
    const result = updateRequestStatusSchema.safeParse({
      uuid: "abc-123-def",
      status: "started",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid status transition with feedback", () => {
    const result = updateRequestStatusSchema.safeParse({
      uuid: "abc-123-def",
      status: "delivered",
      feedback: "Request fulfilled successfully.",
    });
    expect(result.success).toBe(true);
  });

  it("accepts cancelled status", () => {
    const result = updateRequestStatusSchema.safeParse({
      uuid: "abc-123-def",
      status: "cancelled",
    });
    expect(result.success).toBe(true);
  });

  it("accepts finished_by_recruitment status", () => {
    const result = updateRequestStatusSchema.safeParse({
      uuid: "abc-123-def",
      status: "finished_by_recruitment",
    });
    expect(result.success).toBe(true);
  });

  it("accepts re_work status", () => {
    const result = updateRequestStatusSchema.safeParse({
      uuid: "abc-123-def",
      status: "re_work",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty uuid", () => {
    const result = updateRequestStatusSchema.safeParse({
      uuid: "",
      status: "started",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status value", () => {
    const result = updateRequestStatusSchema.safeParse({
      uuid: "abc-123-def",
      status: "invalid-status",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing uuid", () => {
    const result = updateRequestStatusSchema.safeParse({
      status: "started",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing status", () => {
    const result = updateRequestStatusSchema.safeParse({
      uuid: "abc-123-def",
    });
    expect(result.success).toBe(false);
  });

  it("rejects feedback over 255 characters", () => {
    const result = updateRequestStatusSchema.safeParse({
      uuid: "abc-123-def",
      status: "delivered",
      feedback: "x".repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty string feedback", () => {
    const result = updateRequestStatusSchema.safeParse({
      uuid: "abc-123-def",
      status: "delivered",
      feedback: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("deleteRequestSchema", () => {
  it("accepts a valid UUID", () => {
    const result = deleteRequestSchema.safeParse({ uuid: "abc-123-def" });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = deleteRequestSchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = deleteRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("getCompanyRequestDetailSchema", () => {
  it("accepts a valid UUID string", () => {
    const result = getCompanyRequestDetailSchema.safeParse({
      uuid: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a short non-UUID string", () => {
    const result = getCompanyRequestDetailSchema.safeParse({
      uuid: "abc-123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty string UUID", () => {
    const result = getCompanyRequestDetailSchema.safeParse({
      uuid: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getCompanyRequestDetailSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects null UUID", () => {
    const result = getCompanyRequestDetailSchema.safeParse({
      uuid: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects numeric UUID", () => {
    const result = getCompanyRequestDetailSchema.safeParse({
      uuid: 12345,
    });
    expect(result.success).toBe(false);
  });
});
