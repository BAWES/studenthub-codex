import { describe, it, expect } from "vitest";
import {
  discountItemSchema,
  createDiscountResultSchema,
  listDiscountsResultSchema,
} from "./schemas";

const validDiscountItem = () => ({
  discount_uuid: "abc-123-def-456",
  category_id: 1,
  company_id: 42,
  store_id: 5,
  description_en: "10% off all items",
  description_ar: "خصم 10% على جميع المنتجات",
  how_to_apply_en: "Show this code at checkout",
  how_to_apply_ar: "أظهر هذا الرمز عند الدفع",
  image: "https://example.com/discount.jpg",
  valid_until: new Date("2025-12-31T23:59:59Z"),
  created_at: new Date("2024-01-15T10:30:00Z"),
});

const validDiscountItemNullables = () => ({
  discount_uuid: "def-789-ghi-012",
  category_id: 2,
  company_id: 99,
  store_id: null,
  description_en: "Free shipping",
  description_ar: "شحن مجاني",
  how_to_apply_en: null,
  how_to_apply_ar: null,
  image: null,
  valid_until: null,
  created_at: null,
});

// ---------------------------------------------------------------------------
// discountItemSchema
// ---------------------------------------------------------------------------

describe("discountItemSchema", () => {
  it("accepts a full discount item with all fields", () => {
    const r = discountItemSchema.safeParse(validDiscountItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields set to null", () => {
    const r = discountItemSchema.safeParse(validDiscountItemNullables());
    expect(r.success).toBe(true);
  });

  it("rejects missing all required fields (empty object)", () => {
    const r = discountItemSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for discount_uuid (number instead of string)", () => {
    const r = discountItemSchema.safeParse({
      ...validDiscountItem(),
      discount_uuid: 12345,
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for category_id (string instead of number)", () => {
    const r = discountItemSchema.safeParse({
      ...validDiscountItem(),
      category_id: "not-a-number",
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for company_id (string instead of number)", () => {
    const r = discountItemSchema.safeParse({
      ...validDiscountItem(),
      company_id: "abc",
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for description_en (number instead of string)", () => {
    const r = discountItemSchema.safeParse({
      ...validDiscountItem(),
      description_en: 999,
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for description_ar (boolean instead of string)", () => {
    const r = discountItemSchema.safeParse({
      ...validDiscountItem(),
      description_ar: true,
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for valid_until (string instead of Date)", () => {
    const r = discountItemSchema.safeParse({
      ...validDiscountItem(),
      valid_until: "2025-12-31",
    });
    expect(r.success).toBe(false);
  });

  it("rejects undefined for non-nullable discount_uuid", () => {
    const r = discountItemSchema.safeParse({
      ...validDiscountItem(),
      discount_uuid: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects undefined for non-nullable description_en", () => {
    const r = discountItemSchema.safeParse({
      ...validDiscountItem(),
      description_en: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("accepts empty string for description_en", () => {
    const r = discountItemSchema.safeParse({
      ...validDiscountItem(),
      description_en: "",
    });
    expect(r.success).toBe(true);
  });

  it("accepts non-integer number for category_id (int() does not coerce decimals)", () => {
    // z.number().int() rejects non-integers
    const r = discountItemSchema.safeParse({
      ...validDiscountItem(),
      category_id: 1.5,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createDiscountResultSchema
// ---------------------------------------------------------------------------

describe("createDiscountResultSchema", () => {
  it("accepts a valid create result", () => {
    const r = createDiscountResultSchema.safeParse({
      discount_uuid: "new-uuid-here",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing discount_uuid", () => {
    const r = createDiscountResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for discount_uuid (number instead of string)", () => {
    const r = createDiscountResultSchema.safeParse({
      discount_uuid: 999,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listDiscountsResultSchema
// ---------------------------------------------------------------------------

describe("listDiscountsResultSchema", () => {
  it("accepts a full paginated result with discount items", () => {
    const r = listDiscountsResultSchema.safeParse({
      discounts: [validDiscountItem(), validDiscountItemNullables()],
      total: 42,
      page: 1,
      limit: 20,
      totalPages: 3,
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty discounts array", () => {
    const r = listDiscountsResultSchema.safeParse({
      discounts: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    const r = listDiscountsResultSchema.safeParse({
      discounts: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects zero page", () => {
    const r = listDiscountsResultSchema.safeParse({
      discounts: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects zero limit", () => {
    const r = listDiscountsResultSchema.safeParse({
      discounts: [],
      total: 0,
      page: 1,
      limit: 0,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects negative totalPages", () => {
    const r = listDiscountsResultSchema.safeParse({
      discounts: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: -1,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const r = listDiscountsResultSchema.safeParse({ discounts: [] });
    expect(r.success).toBe(false);
  });

  it("validates nested discount items within paginated result", () => {
    const r = listDiscountsResultSchema.safeParse({
      discounts: [{ ...validDiscountItem(), discount_uuid: 12345 }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(false);
  });

  it("rejects string for limit instead of number", () => {
    const r = listDiscountsResultSchema.safeParse({
      discounts: [],
      total: 0,
      page: 1,
      limit: "twenty",
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });
});
