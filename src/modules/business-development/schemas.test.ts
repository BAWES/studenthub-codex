import { describe, it, expect } from "vitest";
import {
  businessDevelopmentItemSchema,
  listBusinessDevelopmentsResultSchema,
  businessDevelopmentActionResultSchema,
} from "./schemas";
import type { BusinessDevelopmentItem } from "./schemas";

// ---------------------------------------------------------------------------
// businessDevelopmentItemSchema
// ---------------------------------------------------------------------------

describe("businessDevelopmentItemSchema", () => {
  const validItem: BusinessDevelopmentItem = {
    company_request_uuid: "uuid-bd-item-001",
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

  // --- Valid data ---

  it("accepts a fully populated valid item", () => {
    const result = businessDevelopmentItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
  });

  it("accepts an item with status set to false", () => {
    const result = businessDevelopmentItemSchema.safeParse({
      ...validItem,
      status: false,
    });
    expect(result.success).toBe(true);
  });

  // --- Nullable acceptance ---

  it("accepts all nullable fields set to null", () => {
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

  // --- Missing field rejection ---

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

  it("rejects missing contact_name", () => {
    const { contact_name: _, ...rest } = validItem;
    const result = businessDevelopmentItemSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  // --- Wrong type rejection ---

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

  it("rejects non-number country_id", () => {
    const result = businessDevelopmentItemSchema.safeParse({
      ...validItem,
      country_id: "one",
    });
    expect(result.success).toBe(false);
  });

  it("rejects float for country_id (must be int)", () => {
    const result = businessDevelopmentItemSchema.safeParse({
      ...validItem,
      country_id: 1.5,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listBusinessDevelopmentsResultSchema
// ---------------------------------------------------------------------------

describe("listBusinessDevelopmentsResultSchema", () => {
  const baseItem: BusinessDevelopmentItem = {
    company_request_uuid: "uuid-item-base",
    company_name: "Base Corp",
    company_email: "base@corp.com",
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

  // --- Valid data ---

  it("accepts an empty result set", () => {
    const result = listBusinessDevelopmentsResultSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a result with one item", () => {
    const result = listBusinessDevelopmentsResultSchema.safeParse({
      items: [baseItem],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a multi-page result", () => {
    const result = listBusinessDevelopmentsResultSchema.safeParse({
      items: [
        baseItem,
        { ...baseItem, company_request_uuid: "uuid-second" },
      ],
      total: 15,
      page: 2,
      limit: 10,
      totalPages: 2,
    });
    expect(result.success).toBe(true);
  });

  // --- Nullable acceptance (items is an array of nullable-field items) ---
  // Nullable fields are tested via the item schema above; the list schema
  // itself has no nullable fields, but items can be an empty array.

  it("accepts zero total and zero totalPages for empty result", () => {
    const result = listBusinessDevelopmentsResultSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  // --- Missing field rejection ---

  it("rejects missing items", () => {
    const result = listBusinessDevelopmentsResultSchema.safeParse({
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing total", () => {
    const result = listBusinessDevelopmentsResultSchema.safeParse({
      items: [],
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing page", () => {
    const result = listBusinessDevelopmentsResultSchema.safeParse({
      items: [],
      total: 0,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing limit", () => {
    const result = listBusinessDevelopmentsResultSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing totalPages", () => {
    const result = listBusinessDevelopmentsResultSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    });
    expect(result.success).toBe(false);
  });

  // --- Wrong type / constraint rejection ---

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

  it("rejects zero page (must be positive)", () => {
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

  it("rejects non-array items", () => {
    const result = listBusinessDevelopmentsResultSchema.safeParse({
      items: "not-an-array",
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects items that fail the item schema", () => {
    const result = listBusinessDevelopmentsResultSchema.safeParse({
      items: [{ bad_field: "no uuid, no name, no email" }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// businessDevelopmentActionResultSchema (discriminated union)
// ---------------------------------------------------------------------------

describe("businessDevelopmentActionResultSchema", () => {
  // --- Valid data ---

  it("accepts a success result with uuid", () => {
    const result = businessDevelopmentActionResultSchema.safeParse({
      success: true,
      uuid: "uuid-success-789",
    });
    expect(result.success).toBe(true);
  });

  it("accepts an error result with error message", () => {
    const result = businessDevelopmentActionResultSchema.safeParse({
      success: false,
      error: "Record not found or access denied",
    });
    expect(result.success).toBe(true);
  });

  // --- Nullable acceptance ---
  // Discriminated union has no nullable fields; both branches are required.

  // --- Missing field rejection ---

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

  // --- Wrong type rejection ---

  it("rejects non-boolean success discriminator", () => {
    const result = businessDevelopmentActionResultSchema.safeParse({
      success: "maybe",
    });
    expect(result.success).toBe(false);
  });

  it("rejects success with non-string uuid", () => {
    const result = businessDevelopmentActionResultSchema.safeParse({
      success: true,
      uuid: 12345,
    });
    expect(result.success).toBe(false);
  });

  it("rejects error with non-string error message", () => {
    const result = businessDevelopmentActionResultSchema.safeParse({
      success: false,
      error: false,
    });
    expect(result.success).toBe(false);
  });

  // --- Edge cases ---

  it("strips extra fields from success (zod strips unknown keys by default)", () => {
    const result = businessDevelopmentActionResultSchema.safeParse({
      success: true,
      uuid: "abc",
      error: "should-be-stripped",
    });
    expect(result.success).toBe(true);
  });

  it("strips extra fields from error (zod strips unknown keys by default)", () => {
    const result = businessDevelopmentActionResultSchema.safeParse({
      success: false,
      error: "fail",
      uuid: "should-be-stripped",
    });
    expect(result.success).toBe(true);
  });
});
