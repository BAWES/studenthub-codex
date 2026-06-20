import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  scheduleEntryExistenceSchema,
  scheduleEntryActionResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Tests for output validation schemas in candidate/schedule/[id]
// ---------------------------------------------------------------------------

describe("scheduleEntryExistenceSchema", () => {
  it("accepts null (entry not found)", () => {
    expect(scheduleEntryExistenceSchema.safeParse(null).success).toBe(true);
  });

  it("accepts a valid record with cwd_uuid only", () => {
    const r = scheduleEntryExistenceSchema.safeParse({ cwd_uuid: "abc-123" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data?.cwd_uuid).toBe("abc-123");
    }
  });

  it("accepts a valid record with cwd_uuid and status", () => {
    const r = scheduleEntryExistenceSchema.safeParse({
      cwd_uuid: "abc-123",
      status: 1,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data?.cwd_uuid).toBe("abc-123");
      expect(r.data?.status).toBe(1);
    }
  });

  it("rejects empty cwd_uuid string", () => {
    expect(
      scheduleEntryExistenceSchema.safeParse({ cwd_uuid: "" }).success,
    ).toBe(false);
  });

  it("rejects missing cwd_uuid", () => {
    expect(scheduleEntryExistenceSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-integer status", () => {
    expect(
      scheduleEntryExistenceSchema.safeParse({
        cwd_uuid: "abc-123",
        status: 1.5,
      }).success,
    ).toBe(false);
  });

  it("rejects undefined (not nullable)", () => {
    expect(scheduleEntryExistenceSchema.safeParse(undefined).success).toBe(false);
  });
});

describe("scheduleEntryActionResultSchema", () => {
  it("accepts success result", () => {
    const r = scheduleEntryActionResultSchema.parse({ success: true as const });
    expect(r).toEqual({ success: true });
  });

  it("accepts failure result with error string", () => {
    const r = scheduleEntryActionResultSchema.parse({
      success: false as const,
      error: "Something went wrong",
    });
    expect(r).toEqual({ success: false, error: "Something went wrong" });
  });

  it("rejects success with extra data field (when using strict parse)", () => {
    // Zod's object() allows extra keys by default, so { success: true, data: {} }
    // passes the union member. To reject extras, call .strict() on the member.
    const strictSchema = z.discriminatedUnion("success", [
      z.object({ success: z.literal(true) }).strict(),
      z.object({ success: z.literal(false), error: z.string() }).strict(),
    ]);
    expect(() => strictSchema.parse({ success: true, data: {} })).toThrow();
  });

  it("rejects failure without error field", () => {
    expect(() =>
      scheduleEntryActionResultSchema.parse({ success: false }),
    ).toThrow();
  });

  it("accepts failure with empty error string (z.string() allows empty by default)", () => {
    const r = scheduleEntryActionResultSchema.parse({
      success: false as const,
      error: "",
    });
    expect(r).toEqual({ success: false, error: "" });
  });

  it("rejects plain object without success field", () => {
    expect(() =>
      scheduleEntryActionResultSchema.parse({ foo: "bar" }),
    ).toThrow();
  });

  it("rejects non-boolean success value", () => {
    expect(() =>
      scheduleEntryActionResultSchema.parse({ success: "maybe" }),
    ).toThrow();
  });
});
