import { describe, it, expect } from "vitest";
import {
  listIdRequestsSchema,
  getIdRequestSchema,
  type ListIdRequestsInput,
} from "./schemas";

// ---------------------------------------------------------------------------
// Pure logic: Zod schema validation for inspector/id-requests server actions
//
// listIdRequests and getIdRequest use these schemas internally. Testing them
// separately avoids mocking prisma, session, and Next.js server-action infra.
// ---------------------------------------------------------------------------

describe("listIdRequestsSchema", () => {
  it("accepts empty params (no filters)", () => {
    const result = listIdRequestsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts pagination params", () => {
    const result = listIdRequestsSchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
  });

  it("accepts search query", () => {
    const result = listIdRequestsSchema.safeParse({ q: "Smith" });
    expect(result.success).toBe(true);
  });

  it("accepts status filter", () => {
    const result = listIdRequestsSchema.safeParse({ status: "pending" });
    expect(result.success).toBe(true);
  });

  it("rejects negative page", () => {
    const result = listIdRequestsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero page", () => {
    const result = listIdRequestsSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listIdRequestsSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });

  it("rejects zero limit", () => {
    const result = listIdRequestsSchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer page", () => {
    const result = listIdRequestsSchema.safeParse({ page: 1.5 });
    expect(result.success).toBe(false);
  });
});

describe("getIdRequestSchema", () => {
  it("accepts a valid UUID-like string", () => {
    const result = getIdRequestSchema.safeParse({ id: "abc-123-def" });
    expect(result.success).toBe(true);
  });

  it("rejects empty string", () => {
    const result = getIdRequestSchema.safeParse({ id: "" });
    expect(result.success).toBe(false);
  });
});
