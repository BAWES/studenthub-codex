import { describe, it, expect } from "vitest";
import {
  businessDevelopmentItemSchema,
  listBusinessDevelopmentsResultSchema,
  businessDevelopmentActionResultSchema,
} from "./schemas";
import type { BusinessDevelopmentItem } from "./schemas";

// ---------------------------------------------------------------------------
// Output: businessDevelopmentItemSchema
// ---------------------------------------------------------------------------

describe("businessDevelopmentItemSchema", () => {
  const validItem: BusinessDevelopmentItem = {
    company_request_uuid: "uuid-abc-123",
    company_name: "Acme Corp",
    company_email: "contact@acme.com",
    contact_name: "John Doe",
    contact_position: "Manager",
    phone_number: "+965 1234 5678",
    requesting_for: "Internships",
    status: true,
    country_id: 1,
    currency_code: "KWD",
    country_name_en: "Kuwait",
    country_name_ar: "الكويت",
    created_at: "2026-06-01T10:00:00.000Z",
    updated_at: "2026-06-13T12:00:00.000Z",
  };

  it("accepts a valid item with all fields", () => {
    const result = businessDevelopmentItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
  });

  it("accepts an item with nullable fields set to null", () => {
    const result = businessDevelopmentItemSchema.safeParse({
      ...validItem,
      contact_position: null,
      phone_number: null,
      requesting_for: null,
      status: null,
      country_id: null,
      currency_code: null,
      country_name_en: null,
      country_name_ar: null,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts an item with empty string optional fields", () => {
    const result = businessDevelopmentItemSchema.safeParse({
      ...validItem,
      contact_name: "",
      company_name: "",
      company_email: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing company_request_uuid", () => {
    const { company_request_uuid: _, ...rest } = validItem;
    const result = businessDevelopmentItemSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing company_name", () => {
    const { company_name: _, ...rest } = validItem;
    const result = businessDevelopmentItemSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing company_email", () => {
    const { company_email: _, ...rest } = validItem;
    const result = businessDevelopmentItemSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects non-string company_request_uuid", () => {
    const result = businessDevelopmentItemSchema.safeParse({
      ...validItem,
      company_request_uuid: 123,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-boolean status", () => {
    const result = businessDevelopmentItemSchema.safeParse({
      ...validItem,
      status: "yes",
    });
    expect(result.success).toBe(false);
  });

  it("accepts status as false", () => {
    const result = businessDevelopmentItemSchema.safeParse({
      ...validItem,
      status: false,
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Output: listBusinessDevelopmentsResultSchema
// ---------------------------------------------------------------------------

describe("listBusinessDevelopmentsResultSchema", () => {
  const baseItem: BusinessDevelopmentItem = {
    company_request_uuid: "uuid-abc",
    company_name: "Test Corp",
    company_email: "test@corp.com",
    contact_name: "Jane",
    contact_position: null,
    phone_number: null,
    requesting_for: null,
    status: true,
    country_id: null,
    currency_code: null,
    country_name_en: null,
    country_name_ar: null,
    created_at: null,
    updated_at: null,
  };

  it("accepts empty result", () => {
    const result = listBusinessDevelopmentsResultSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("accepts result with one item", () => {
    const result = listBusinessDevelopmentsResultSchema.safeParse({
      items: [baseItem],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts result with multiple items and pagination", () => {
    const result = listBusinessDevelopmentsResultSchema.safeParse({
      items: [baseItem, { ...baseItem, company_request_uuid: "uuid-xyz" }],
      total: 2,
      page: 2,
      limit: 10,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative total", () => {
    const result = listBusinessDevelopmentsResultSchema.safeParse({
      items: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero page", () => {
    const result = listBusinessDevelopmentsResultSchema.safeParse({
      items: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative totalPages", () => {
    const result = listBusinessDevelopmentsResultSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing items field", () => {
    const result = listBusinessDevelopmentsResultSchema.safeParse({
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects items that fail the item schema", () => {
    const result = listBusinessDevelopmentsResultSchema.safeParse({
      items: [{ bad_field: true }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output: businessDevelopmentActionResultSchema (discriminated union)
// ---------------------------------------------------------------------------

describe("businessDevelopmentActionResultSchema", () => {
  it("accepts success result with uuid", () => {
    const result = businessDevelopmentActionResultSchema.safeParse({
      success: true,
      uuid: "uuid-abc-456",
    });
    expect(result.success).toBe(true);
  });

  it("accepts error result with message", () => {
    const result = businessDevelopmentActionResultSchema.safeParse({
      success: false,
      error: "Record not found or access denied",
    });
    expect(result.success).toBe(true);
  });

  it("rejects success without uuid", () => {
    const result = businessDevelopmentActionResultSchema.safeParse({
      success: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects error without error message", () => {
    const result = businessDevelopmentActionResultSchema.safeParse({
      success: false,
    });
    expect(result.success).toBe(false);
  });

  it("strips extra fields from success (zod strips unknown keys)", () => {
    const result = businessDevelopmentActionResultSchema.safeParse({
      success: true,
      uuid: "abc",
      error: "should-not-appear",
    });
    expect(result.success).toBe(true);
  });

  it("strips extra fields from error (zod strips unknown keys)", () => {
    const result = businessDevelopmentActionResultSchema.safeParse({
      success: false,
      error: "fail",
      uuid: "should-not-exist",
    });
    expect(result.success).toBe(true);
  });
});
