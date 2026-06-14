import { describe, it, expect } from "vitest";
import {
  fulltimerItemSchema,
  fulltimerDetailSchema,
  fulltimerDetailOrNullSchema,
  listFulltimersResultSchema,
} from "./schemas";

const validItem = () => ({
  fulltimer_uuid: "ft-001",
  fulltimer_name: "Ahmed Ali",
  fulltimer_email: "ahmed@example.com",
  fulltimer_phone: null,
  fulltimer_employed: true,
  nationality_id: null,
  country_id: null,
  university_id: null,
  fulltimer_created_datetime: "2026-01-15T10:00:00.000Z",
});

const validItemMinimal = () => ({
  fulltimer_uuid: "ft-002",
  fulltimer_name: "Sara",
  fulltimer_email: "sara@example.com",
  fulltimer_phone: null,
  fulltimer_employed: null,
  nationality_id: null,
  country_id: null,
  university_id: null,
  fulltimer_created_datetime: null,
});

const validDetail = () => ({
  fulltimer_uuid: "ft-001",
  fulltimer_name: "Ahmed Ali",
  fulltimer_email: "ahmed@example.com",
  fulltimer_phone: null,
  fulltimer_employed: true,
  fulltimer_gender: null,
  fulltimer_birth_date: null,
  fulltimer_driving_license: null,
  nationality_id: null,
  country_id: null,
  university_id: null,
  fulltimer_area_uuid: null,
  fulltimer_current_salary: null,
  fulltimer_expected_salary: null,
  fulltimer_pdf_cv: null,
  currency_code: null,
  fulltimer_created_datetime: "2026-01-15T10:00:00.000Z",
  fulltimer_updated_datetime: null,
});

// ---------------------------------------------------------------------------
// fulltimerItemSchema
// ---------------------------------------------------------------------------

describe("fulltimerItemSchema", () => {
  it("accepts a valid item", () => {
    const r = fulltimerItemSchema.safeParse(validItem());
    expect(r.success).toBe(true);
  });

  it("accepts minimal item (nullable fields as null)", () => {
    const r = fulltimerItemSchema.safeParse(validItemMinimal());
    expect(r.success).toBe(true);
  });

  it("rejects missing fulltimer_uuid", () => {
    const { fulltimer_uuid: _, ...rest } = validItem();
    expect(fulltimerItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-string fulltimer_name", () => {
    expect(fulltimerItemSchema.safeParse({ ...validItem(), fulltimer_name: 42 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// fulltimerDetailSchema
// ---------------------------------------------------------------------------

describe("fulltimerDetailSchema", () => {
  it("accepts a valid detail", () => {
    const r = fulltimerDetailSchema.safeParse(validDetail());
    expect(r.success).toBe(true);
  });

  it("rejects missing fulltimer_email", () => {
    const { fulltimer_email: _, ...rest } = validDetail();
    expect(fulltimerDetailSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// fulltimerDetailOrNullSchema
// ---------------------------------------------------------------------------

describe("fulltimerDetailOrNullSchema", () => {
  it("accepts a valid detail object", () => {
    const r = fulltimerDetailOrNullSchema.safeParse(validDetail());
    expect(r.success).toBe(true);
  });

  it("accepts null", () => {
    expect(fulltimerDetailOrNullSchema.safeParse(null).success).toBe(true);
  });

  it("rejects undefined", () => {
    expect(fulltimerDetailOrNullSchema.safeParse(undefined).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listFulltimersResultSchema
// ---------------------------------------------------------------------------

describe("listFulltimersResultSchema", () => {
  it("accepts a full paginated result", () => {
    const r = listFulltimersResultSchema.safeParse({
      fulltimers: [validItem(), validItemMinimal()],
      total: 42,
      page: 1,
      limit: 20,
      totalPages: 3,
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty fulltimers array", () => {
    expect(
      listFulltimersResultSchema.safeParse({
        fulltimers: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listFulltimersResultSchema.safeParse({
        fulltimers: [],
        total: -1,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(
      listFulltimersResultSchema.safeParse({
        fulltimers: [],
        total: 0,
        page: 0,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });
});
