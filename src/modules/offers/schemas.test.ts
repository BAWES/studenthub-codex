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
    job_uuid: "job-123",
    position: "Software Engineer Intern",
    position_ar: "مهندس برمجيات متدرب",
    description: "Work on the student platform",
    hours_per_day: 8,
    days_per_week: true,
    status: true,
    area_uuid: "area-abc",
    request_uuid: "req-456",
    created_at: new Date("2026-01-15"),
    updated_at: new Date("2026-06-10"),
  };

  it("accepts a full offer list item", () => {
    expect(offerListItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts all nullable fields set to null", () => {
    expect(
      offerListItemSchema.safeParse({
        ...valid,
        position_ar: null,
        description: null,
        hours_per_day: null,
        days_per_week: null,
        status: null,
        area_uuid: null,
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("accepts nullable position_ar", () => {
    expect(
      offerListItemSchema.safeParse({ ...valid, position_ar: null }).success,
    ).toBe(true);
  });

  it("accepts nullable description", () => {
    expect(
      offerListItemSchema.safeParse({ ...valid, description: null }).success,
    ).toBe(true);
  });

  it("accepts nullable hours_per_day", () => {
    expect(
      offerListItemSchema.safeParse({ ...valid, hours_per_day: null }).success,
    ).toBe(true);
  });

  it("accepts nullable days_per_week", () => {
    expect(
      offerListItemSchema.safeParse({ ...valid, days_per_week: null }).success,
    ).toBe(true);
  });

  it("accepts nullable status", () => {
    expect(
      offerListItemSchema.safeParse({ ...valid, status: null }).success,
    ).toBe(true);
  });

  it("accepts nullable area_uuid", () => {
    expect(
      offerListItemSchema.safeParse({ ...valid, area_uuid: null }).success,
    ).toBe(true);
  });

  it("accepts nullable created_at", () => {
    expect(
      offerListItemSchema.safeParse({ ...valid, created_at: null }).success,
    ).toBe(true);
  });

  it("accepts nullable updated_at", () => {
    expect(
      offerListItemSchema.safeParse({ ...valid, updated_at: null }).success,
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

  it("rejects empty object", () => {
    expect(offerListItemSchema.safeParse({}).success).toBe(false);
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
      offerListItemSchema.safeParse({ ...valid, status: 1 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for created_at", () => {
    expect(
      offerListItemSchema.safeParse({ ...valid, created_at: "2026-01-15" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// offerDetailSchema
// ---------------------------------------------------------------------------
describe("offerDetailSchema", () => {
  const valid = {
    job_uuid: "job-123",
    position: "Software Engineer Intern",
    position_ar: "مهندس برمجيات متدرب",
    description: "Work on the student platform",
    description_ar: "العمل على منصة الطلاب",
    hours_per_day: 8,
    days_per_week: true,
    status: true,
    area_uuid: "area-abc",
    request_uuid: "req-456",
    created_at: new Date("2026-01-15"),
    updated_at: new Date("2026-06-10"),
    compensation_type: "HOURLY",
    compensation_amount: "15.50",
    compensation_description: "Hourly rate for internship",
    compensation_description_ar: "السعر بالساعة للتدريب",
    min_age: 18,
    max_age: 25,
    gender: true,
    available_from: new Date("2026-07-01"),
    available_to: new Date("2026-12-31"),
  };

  it("accepts a full offer detail", () => {
    expect(offerDetailSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts all nullable fields set to null", () => {
    expect(
      offerDetailSchema.safeParse({
        ...valid,
        position_ar: null,
        description: null,
        description_ar: null,
        hours_per_day: null,
        days_per_week: null,
        status: null,
        area_uuid: null,
        created_at: null,
        updated_at: null,
        compensation_type: null,
        compensation_amount: null,
        compensation_description: null,
        compensation_description_ar: null,
        min_age: null,
        max_age: null,
        gender: null,
        available_from: null,
        available_to: null,
      }).success,
    ).toBe(true);
  });

  it("accepts nullable description_ar", () => {
    expect(
      offerDetailSchema.safeParse({ ...valid, description_ar: null }).success,
    ).toBe(true);
  });

  it("accepts nullable compensation_type", () => {
    expect(
      offerDetailSchema.safeParse({ ...valid, compensation_type: null }).success,
    ).toBe(true);
  });

  it("accepts nullable compensation_amount", () => {
    expect(
      offerDetailSchema.safeParse({ ...valid, compensation_amount: null }).success,
    ).toBe(true);
  });

  it("accepts nullable compensation_description", () => {
    expect(
      offerDetailSchema.safeParse({ ...valid, compensation_description: null }).success,
    ).toBe(true);
  });

  it("accepts nullable compensation_description_ar", () => {
    expect(
      offerDetailSchema.safeParse({ ...valid, compensation_description_ar: null })
        .success,
    ).toBe(true);
  });

  it("accepts nullable min_age", () => {
    expect(
      offerDetailSchema.safeParse({ ...valid, min_age: null }).success,
    ).toBe(true);
  });

  it("accepts nullable max_age", () => {
    expect(
      offerDetailSchema.safeParse({ ...valid, max_age: null }).success,
    ).toBe(true);
  });

  it("accepts nullable gender", () => {
    expect(
      offerDetailSchema.safeParse({ ...valid, gender: null }).success,
    ).toBe(true);
  });

  it("accepts nullable available_from", () => {
    expect(
      offerDetailSchema.safeParse({ ...valid, available_from: null }).success,
    ).toBe(true);
  });

  it("accepts nullable available_to", () => {
    expect(
      offerDetailSchema.safeParse({ ...valid, available_to: null }).success,
    ).toBe(true);
  });

  it("rejects missing required fields (inherited from list item)", () => {
    expect(offerDetailSchema.safeParse({}).success).toBe(false);
  });

  it("rejects missing job_uuid", () => {
    const { job_uuid: _, ...rest } = valid;
    expect(offerDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing request_uuid", () => {
    const { request_uuid: _, ...rest } = valid;
    expect(offerDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for min_age", () => {
    expect(
      offerDetailSchema.safeParse({ ...valid, min_age: "eighteen" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for gender", () => {
    expect(
      offerDetailSchema.safeParse({ ...valid, gender: 1 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for available_from", () => {
    expect(
      offerDetailSchema.safeParse({ ...valid, available_from: "2026-07-01" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for compensation_amount", () => {
    expect(
      offerDetailSchema.safeParse({ ...valid, compensation_amount: 15.5 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listOffersResultSchema
// ---------------------------------------------------------------------------
describe("listOffersResultSchema", () => {
  const validItem = {
    job_uuid: "job-123",
    position: "Software Engineer Intern",
    position_ar: null,
    description: null,
    hours_per_day: null,
    days_per_week: null,
    status: null,
    area_uuid: null,
    request_uuid: "req-456",
    created_at: null,
    updated_at: null,
  };

  const valid = {
    offers: [validItem],
    total: 42,
    page: 1,
    limit: 20,
    totalPages: 3,
  };

  it("accepts a full paginated result", () => {
    expect(listOffersResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts an empty offers array", () => {
    expect(
      listOffersResultSchema.safeParse({
        offers: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("accepts page 0", () => {
    expect(
      listOffersResultSchema.safeParse({ ...valid, page: 0 }).success,
    ).toBe(true);
  });

  it("accepts zero total", () => {
    expect(
      listOffersResultSchema.safeParse({ ...valid, total: 0 }).success,
    ).toBe(true);
  });

  it("accepts limit 1 (minimum positive)", () => {
    expect(
      listOffersResultSchema.safeParse({ ...valid, limit: 1 }).success,
    ).toBe(true);
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

  it("rejects zero limit", () => {
    expect(
      listOffersResultSchema.safeParse({ ...valid, limit: 0 }).success,
    ).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(
      listOffersResultSchema.safeParse({ ...valid, totalPages: -1 }).success,
    ).toBe(false);
  });

  it("rejects non-array offers", () => {
    expect(
      listOffersResultSchema.safeParse({ ...valid, offers: "not-an-array" }).success,
    ).toBe(false);
  });

  it("rejects float total", () => {
    expect(
      listOffersResultSchema.safeParse({ ...valid, total: 1.5 }).success,
    ).toBe(false);
  });

  it("rejects float limit", () => {
    expect(
      listOffersResultSchema.safeParse({ ...valid, limit: 10.5 }).success,
    ).toBe(false);
  });
});
