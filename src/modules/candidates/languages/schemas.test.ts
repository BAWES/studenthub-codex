import { describe, it, expect } from "vitest";
import {
  languageItemSchema,
  languageActionResultSchema,
  languageDetailResponseSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// languageItemSchema
// ---------------------------------------------------------------------------

describe("languageItemSchema", () => {
  const validItem = () => ({
    candidate_language_id: 1,
    language: "English",
    proficiency: "Fluent",
    candidate_language_created_at: new Date("2026-06-01"),
  });

  it("accepts a valid language item", () => {
    const r = languageItemSchema.safeParse(validItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable created_at", () => {
    const r = languageItemSchema.safeParse({
      ...validItem(),
      candidate_language_created_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing candidate_language_id", () => {
    const { candidate_language_id: _, ...rest } = validItem();
    expect(languageItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-positive candidate_language_id", () => {
    expect(
      languageItemSchema.safeParse({ ...validItem(), candidate_language_id: 0 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// languageActionResultSchema  (discriminatedUnion)
// ---------------------------------------------------------------------------

describe("languageActionResultSchema", () => {
  it("accepts success with languageId", () => {
    const r = languageActionResultSchema.safeParse({ success: true, languageId: 42 });
    expect(r.success).toBe(true);
  });

  it("rejects success without languageId", () => {
    const r = languageActionResultSchema.safeParse({ success: true });
    expect(r.success).toBe(false);
  });

  it("accepts failure with error", () => {
    const r = languageActionResultSchema.safeParse({ success: false, error: "Failed" });
    expect(r.success).toBe(true);
  });

  it("rejects failure without error", () => {
    const r = languageActionResultSchema.safeParse({ success: false });
    expect(r.success).toBe(false);
  });

  it("rejects non-positive languageId", () => {
    const r = languageActionResultSchema.safeParse({ success: true, languageId: -1 });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// languageDetailResponseSchema  (z.union)
// ---------------------------------------------------------------------------

describe("languageDetailResponseSchema", () => {
  const validItem = () => ({
    candidate_language_id: 1,
    language: "English",
    proficiency: "Fluent",
    candidate_language_created_at: null,
  });

  it("accepts found variant with data and null error", () => {
    const r = languageDetailResponseSchema.safeParse({ data: validItem(), error: null });
    expect(r.success).toBe(true);
  });

  it("accepts not-found variant with null data and error", () => {
    const r = languageDetailResponseSchema.safeParse({ data: null, error: "Not found" });
    expect(r.success).toBe(true);
  });

  it("accepts both data and error null (error is .nullable())", () => {
    const r = languageDetailResponseSchema.safeParse({ data: null, error: null });
    expect(r.success).toBe(true);
  });

  it("rejects missing data", () => {
    const r = languageDetailResponseSchema.safeParse({ error: "Error" });
    expect(r.success).toBe(false);
  });
});
