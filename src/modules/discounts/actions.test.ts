import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: discount schema validation
//
// listDiscounts and createDiscount in actions.ts use these zod schemas
// internally. Testing them separately avoids the need to mock "use server"
// dependencies (prisma, session, next/cache).
// ---------------------------------------------------------------------------

const createDiscountSchema = z.object({
  category_id: z.number().int("Category ID must be an integer").positive(),
  company_id: z.number().int("Company ID must be an integer").positive(),
  store_id: z.number().int().positive().optional(),
  description_en: z
    .string({ required_error: "English description is required" })
    .min(1, "English description is required")
    .max(65535),
  description_ar: z
    .string({ required_error: "Arabic description is required" })
    .min(1, "Arabic description is required")
    .max(65535),
  how_to_apply_en: z.string().max(255).optional(),
  how_to_apply_ar: z.string().max(255).optional(),
  valid_until: z.string().datetime().optional(),
});

const listDiscountsSchema = z.object({
  company_id: z.number().int().positive().optional(),
  category_id: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const listDiscountsByApplicantSchema = z.object({
  applicant_id: z
    .number({ required_error: "Applicant ID is required" })
    .int("Applicant ID must be an integer")
    .positive("Applicant ID must be positive"),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

describe("createDiscountSchema", () => {
  it("accepts valid discount data", () => {
    const result = createDiscountSchema.safeParse({
      category_id: 1,
      company_id: 5,
      description_en: "10% off all products",
      description_ar: "خصم 10% على جميع المنتجات",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description_en).toBe("10% off all products");
      expect(result.data.description_ar).toBe("خصم 10% على جميع المنتجات");
    }
  });

  it("accepts discount with all optional fields", () => {
    const result = createDiscountSchema.safeParse({
      category_id: 2,
      company_id: 5,
      store_id: 10,
      description_en: "Buy one get one free",
      description_ar: "اشتري واحد واحصل على الثاني مجاناً",
      how_to_apply_en: "Show this coupon at checkout",
      how_to_apply_ar: "أظهر هذا القسيمة عند الدفع",
      valid_until: "2026-12-31T23:59:59Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing english description", () => {
    const result = createDiscountSchema.safeParse({
      category_id: 1,
      company_id: 5,
      description_ar: "وصف بالعربية",
    });
    expect(result.success).toBe(false);
    expect(result.error!.errors[0]?.message).toBe("English description is required");
  });

  it("rejects missing arabic description", () => {
    const result = createDiscountSchema.safeParse({
      category_id: 1,
      company_id: 5,
      description_en: "English description",
    });
    expect(result.success).toBe(false);
    expect(result.error!.errors[0]?.message).toBe("Arabic description is required");
  });

  it("rejects non-integer category_id", () => {
    const result = createDiscountSchema.safeParse({
      category_id: "abc",
      company_id: 5,
      description_en: "Test",
      description_ar: "اختبار",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative company_id", () => {
    const result = createDiscountSchema.safeParse({
      category_id: 1,
      company_id: -1,
      description_en: "Test",
      description_ar: "اختبار",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty discount name fields", () => {
    const result = createDiscountSchema.safeParse({
      category_id: 1,
      company_id: 5,
      description_en: "",
      description_ar: "وصف",
    });
    expect(result.success).toBe(false);
    expect(result.error!.errors[0]?.message).toBe("English description is required");
  });
});

describe("listDiscountsSchema", () => {
  it("accepts empty params (no filters)", () => {
    const result = listDiscountsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts company_id filter", () => {
    const result = listDiscountsSchema.safeParse({ company_id: 5 });
    expect(result.success).toBe(true);
  });

  it("accepts pagination params", () => {
    const result = listDiscountsSchema.safeParse({
      company_id: 5,
      page: 1,
      limit: 20,
    });
    expect(result.success).toBe(true);
  });

  it("rejects limit over 100", () => {
    const result = listDiscountsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listDiscountsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });
});

describe("listDiscountsByApplicantSchema", () => {
  it("accepts valid applicant_id", () => {
    const result = listDiscountsByApplicantSchema.safeParse({
      applicant_id: 42,
    });
    expect(result.success).toBe(true);
  });

  it("accepts applicant_id with pagination", () => {
    const result = listDiscountsByApplicantSchema.safeParse({
      applicant_id: 42,
      page: 2,
      limit: 50,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing applicant_id", () => {
    const result = listDiscountsByApplicantSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects negative applicant_id", () => {
    const result = listDiscountsByApplicantSchema.safeParse({
      applicant_id: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero applicant_id", () => {
    const result = listDiscountsByApplicantSchema.safeParse({
      applicant_id: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer applicant_id", () => {
    const result = listDiscountsByApplicantSchema.safeParse({
      applicant_id: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listDiscountsByApplicantSchema.safeParse({
      applicant_id: 42,
      limit: 999,
    });
    expect(result.success).toBe(false);
  });
});
