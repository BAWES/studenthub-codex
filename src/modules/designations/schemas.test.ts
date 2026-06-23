import { describe, it, expect } from "vitest";
import {
  designationItemSchema,
  listDesignationsResultSchema,
} from "./schemas";

const validDesignationItem = () => ({
  designation_uuid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  designation_name_en: "Senior Engineer",
  designation_name_ar: "مهندس أول",
});

const validDesignationItemMinimal = () => ({
  designation_uuid: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  designation_name_en: "Junior Developer",
  designation_name_ar: null,
});

// ---------------------------------------------------------------------------
// designationItemSchema
// ---------------------------------------------------------------------------

describe("designationItemSchema", () => {
  it("accepts a full designation item (with Arabic name)", () => {
    const r = designationItemSchema.safeParse(validDesignationItem());
    expect(r.success).toBe(true);
  });

  it("accepts a minimal designation item (nullable Arabic name set to null)", () => {
    const r = designationItemSchema.safeParse(validDesignationItemMinimal());
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = designationItemSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong types", () => {
    const r = designationItemSchema.safeParse({
      ...validDesignationItem(),
      designation_uuid: 12345,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing designation_uuid", () => {
    const r = designationItemSchema.safeParse({
      ...validDesignationItem(),
      designation_uuid: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing designation_name_en", () => {
    const r = designationItemSchema.safeParse({
      ...validDesignationItem(),
      designation_name_en: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("accepts designation_name_ar as empty string", () => {
    const r = designationItemSchema.safeParse({
      ...validDesignationItem(),
      designation_name_ar: "",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty designation_uuid", () => {
    const r = designationItemSchema.safeParse({
      ...validDesignationItem(),
      designation_uuid: "",
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty designation_name_en", () => {
    const r = designationItemSchema.safeParse({
      ...validDesignationItem(),
      designation_name_en: "",
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listDesignationsResultSchema
// ---------------------------------------------------------------------------

describe("listDesignationsResultSchema", () => {
  it("accepts a full paginated result", () => {
    const r = listDesignationsResultSchema.safeParse({
      designations: [validDesignationItem(), validDesignationItemMinimal()],
      total: 42,
      page: 1,
      limit: 20,
      totalPages: 3,
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty designations array", () => {
    const r = listDesignationsResultSchema.safeParse({
      designations: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    const r = listDesignationsResultSchema.safeParse({
      designations: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects zero page", () => {
    const r = listDesignationsResultSchema.safeParse({
      designations: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const r = listDesignationsResultSchema.safeParse({ designations: [] });
    expect(r.success).toBe(false);
  });

  it("rejects zero limit", () => {
    const r = listDesignationsResultSchema.safeParse({
      designations: [],
      total: 0,
      page: 1,
      limit: 0,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects limit exceeding max (100)", () => {
    const r = listDesignationsResultSchema.safeParse({
      designations: [],
      total: 0,
      page: 1,
      limit: 101,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("validates nested designation items within paginated result", () => {
    const r = listDesignationsResultSchema.safeParse({
      designations: [{ ...validDesignationItem(), designation_name_en: 12345 }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(false);
  });
});
