import { describe, it, expect } from "vitest";
import {
  offerListItemSchema,
  offerDetailSchema,
  listOffersResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// offerListItemSchema
// ---------------------------------------------------------------------------
describe("offerListItemSchema", () => {
  const valid = {
    job_uuid: "550e8400-e29b-41d4-a716-446655440000",
    position: "Junior Developer",
    position_ar: "مطور مبتدئ",
    description: "A great role for beginners",
    hours_per_day: 8,
    days_per_week: true,
    status: true,
    area_uuid: "550e8400-e29b-41d4-a716-446655440001",
    request_uuid: "550e8400-e29b-41d4-a716-446655440002",
    created_at: new Date("2026-01-01"),
    updated_at: new Date("2026-06-01"),
  };

  it("accepts a valid offer list item", () => {
    expect(offerListItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(
      offerListItemSchema.safeParse({
        job_uuid: "550e8400-e29b-41d4-a716-446655440000",
        position: "Junior Developer",
        position_ar: null,
        description: null,
        hours_per_day: null,
        days_per_week: null,
        status: null,
        area_uuid: null,
        request_uuid: "550e8400-e29b-41d4-a716-446655440002",
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing job_uuid", () => {
    const { job_uuid: _, ...rest } = valid;
    expect(offerListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing position", () => {
    const { position: _, ...rest } = valid;
    expect(offerListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing request_uuid", () => {
    const { request_uuid: _, ...rest } = valid;
    expect(offerListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for job_uuid", () => {
    expect(
      offerListItemSchema.safeParse({ ...valid, job_uuid: 123 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for hours_per_day", () => {
    expect(
      offerListItemSchema.safeParse({ ...valid, hours_per_day: "eight" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for days_per_week", () => {
    expect(
      offerListItemSchema.safeParse({ ...valid, days_per_week: "yes" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for status", () => {
    expect(
      offerListItemSchema.safeParse({ ...valid, status: "active" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for created_at", () => {
    expect(
      offerListItemSchema.safeParse({ ...valid, created_at: "2026-01-01" }).success,
    ).toBe(false);
  });

  it("rejects non-object", () => {
    expect(offerListItemSchema.safeParse(null).success).toBe(false);
    expect(offerListItemSchema.safeParse(undefined).success).toBe(false);
    expect(offerListItemSchema.safeParse("string").success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// offerDetailSchema (extends offerListItemSchema)
// ---------------------------------------------------------------------------
describe("offerDetailSchema", () => {
  const valid = {
    job_uuid: "550e8400-e29b-41d4-a716-446655440000",
    position: "Senior Developer",
    position_ar: "مطور أول",
    description: "Advanced development role",
    description_ar: "دور تطوير متقدم",
    hours_per_day: 8,
    days_per_week: true,
    status: true,
    area_uuid: "550e8400-e29b-41d4-a716-446655440001",
    request_uuid: "550e8400-e29b-41d4-a716-446655440002",
    compensation_type: "MONTHLY_SALARY",
    compensation_amount: "1500",
    compensation_description: "Monthly salary",
    compensation_description_ar: "راتب شهري",
    min_age: 21,
    max_age: 60,
    gender: true,
    available_from: new Date("2026-01-01"),
    available_to: new Date("2026-12-31"),
    created_at: new Date("2026-01-01"),
    updated_at: new Date("2026-06-01"),
  };

  it("accepts a valid offer detail", () => {
    expect(offerDetailSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts all extended fields as null", () => {
    expect(
      offerDetailSchema.safeParse({
        job_uuid: "550e8400-e29b-41d4-a716-446655440000",
        position: "Senior Developer",
        position_ar: null,
        description: null,
        description_ar: null,
        hours_per_day: null,
        days_per_week: null,
        status: null,
        area_uuid: null,
        request_uuid: "550e8400-e29b-41d4-a716-446655440002",
        compensation_type: null,
        compensation_amount: null,
        compensation_description: null,
        compensation_description_ar: null,
        min_age: null,
        max_age: null,
        gender: null,
        available_from: null,
        available_to: null,
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing job_uuid (inherited required)", () => {
    const { job_uuid: _, ...rest } = valid;
    expect(offerDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing request_uuid (inherited required)", () => {
    const { request_uuid: _, ...rest } = valid;
    expect(offerDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for min_age", () => {
    expect(
      offerDetailSchema.safeParse({ ...valid, min_age: "young" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for max_age", () => {
    expect(
      offerDetailSchema.safeParse({ ...valid, max_age: "old" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for gender", () => {
    expect(
      offerDetailSchema.safeParse({ ...valid, gender: "male" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for available_from", () => {
    expect(
      offerDetailSchema.safeParse({ ...valid, available_from: "2026-01-01" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for available_to", () => {
    expect(
      offerDetailSchema.safeParse({ ...valid, available_to: "2026-12-31" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for compensation_type", () => {
    expect(
      offerDetailSchema.safeParse({ ...valid, compensation_type: 123 }).success,
    ).toBe(false);
  });

  it("rejects non-object", () => {
    expect(offerDetailSchema.safeParse(null).success).toBe(false);
    expect(offerDetailSchema.safeParse(undefined).success).toBe(false);
    expect(offerDetailSchema.safeParse(42).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listOffersResultSchema
// ---------------------------------------------------------------------------
describe("listOffersResultSchema", () => {
  const valid = {
    offers: [
      {
        job_uuid: "550e8400-e29b-41d4-a716-446655440000",
        position: "Junior Developer",
        position_ar: "مطور مبتدئ",
        description: "A great role",
        hours_per_day: 8,
        days_per_week: true,
        status: true,
        area_uuid: "550e8400-e29b-41d4-a716-446655440001",
        request_uuid: "550e8400-e29b-41d4-a716-446655440002",
        created_at: new Date("2026-01-01"),
        updated_at: new Date("2026-06-01"),
      },
    ],
    total: 1,
    page: 0,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid result", () => {
    expect(listOffersResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty offers array", () => {
    expect(
      listOffersResultSchema.safeParse({
        ...valid,
        offers: [],
        total: 0,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("accepts page 0 (allowed: nonnegative)", () => {
    expect(
      listOffersResultSchema.safeParse({ ...valid, page: 0 }).success,
    ).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listOffersResultSchema.safeParse({ ...valid, total: -1 }).success,
    ).toBe(false);
  });

  it("rejects negative page", () => {
    expect(
      listOffersResultSchema.safeParse({ ...valid, page: -1 }).success,
    ).toBe(false);
  });

  it("rejects zero limit (must be positive)", () => {
    expect(
      listOffersResultSchema.safeParse({ ...valid, limit: 0 }).success,
    ).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(
      listOffersResultSchema.safeParse({ ...valid, totalPages: -1 }).success,
    ).toBe(false);
  });

  it("rejects missing offers", () => {
    const { offers: _, ...rest } = valid;
    expect(listOffersResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = valid;
    expect(listOffersResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing page", () => {
    const { page: _, ...rest } = valid;
    expect(listOffersResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing limit", () => {
    const { limit: _, ...rest } = valid;
    expect(listOffersResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing totalPages", () => {
    const { totalPages: _, ...rest } = valid;
    expect(listOffersResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-array offers", () => {
    expect(
      listOffersResultSchema.safeParse({ ...valid, offers: "not-an-array" }).success,
    ).toBe(false);
  });

  it("rejects array with invalid offer items", () => {
    expect(
      listOffersResultSchema.safeParse({
        ...valid,
        offers: [{ job_uuid: "orphan" }],
      }).success,
    ).toBe(false);
  });

  it("rejects non-integer total", () => {
    expect(
      listOffersResultSchema.safeParse({ ...valid, total: 1.5 }).success,
    ).toBe(false);
  });

  it("rejects non-integer limit", () => {
    expect(
      listOffersResultSchema.safeParse({ ...valid, limit: 20.5 }).success,
    ).toBe(false);
  });

  it("rejects non-integer page", () => {
    expect(
      listOffersResultSchema.safeParse({ ...valid, page: 1.5 }).success,
    ).toBe(false);
  });

  it("rejects non-integer totalPages", () => {
    expect(
      listOffersResultSchema.safeParse({ ...valid, totalPages: 1.5 }).success,
    ).toBe(false);
  });
});
