import { describe, it, expect } from "vitest";
import {
  getDesignationSchema,
  getDesignationResultSchema,
  designationItemSchema,
} from "../schemas";

describe("getDesignationSchema", () => {
  it("accepts a valid designation UUID", () => {
    const r = getDesignationSchema.safeParse({ designationUuid: "des-uuid-1" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.designationUuid).toBe("des-uuid-1");
  });

  it("rejects empty designation UUID", () => {
    const r = getDesignationSchema.safeParse({ designationUuid: "" });
    expect(r.success).toBe(false);
  });

  it("rejects missing designationUuid", () => {
    const r = getDesignationSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects non-string designationUuid", () => {
    const r = getDesignationSchema.safeParse({ designationUuid: 123 });
    expect(r.success).toBe(false);
  });
});

describe("designationItemSchema", () => {
  const validItem = {
    designation_uuid: "des-uuid-1",
    designation_name_en: "Software Engineer",
    designation_name_ar: "مهندس برمجيات",
    designation_created_at: new Date("2026-01-01"),
    designation_updated_at: new Date("2026-06-01"),
  };

  it("accepts a valid designation item", () => {
    expect(designationItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts null for nullable fields", () => {
    expect(
      designationItemSchema.safeParse({
        ...validItem,
        designation_name_ar: null,
        designation_created_at: null,
        designation_updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing designation_uuid", () => {
    const { designation_uuid: _, ...rest } = validItem;
    expect(designationItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects string for date (not z.coerce.date())", () => {
    expect(
      designationItemSchema.safeParse({
        ...validItem,
        designation_created_at: "2026-01-01T00:00:00",
      }).success,
    ).toBe(false);
  });
});

describe("getDesignationResultSchema", () => {
  it("accepts a valid result with designation", () => {
    const r = getDesignationResultSchema.safeParse({
      designation: {
        designation_uuid: "des-uuid-1",
        designation_name_en: "Engineer",
        designation_name_ar: null,
        designation_created_at: null,
        designation_updated_at: null,
      },
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.designation).not.toBeNull();
  });

  it("accepts null designation", () => {
    const r = getDesignationResultSchema.safeParse({ designation: null });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.designation).toBeNull();
  });

  it("rejects missing designation key", () => {
    const r = getDesignationResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});
