import { describe, it, expect } from "vitest";
import {
  majorItemSchema,
  listMajorsResultSchema,
} from "./schemas";

describe("majorItemSchema", () => {
  const valid = {
    major_uuid: "maj-uuid-1",
    major_name_en: "Computer Science",
    major_name_ar: "علوم الحاسب",
    data_source: 1,
    major_created_at: new Date("2026-01-01"),
    major_updated_at: new Date("2026-06-01"),
  };

  it("accepts a valid major item", () => {
    expect(majorItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(majorItemSchema.safeParse({
      ...valid, data_source: null, major_created_at: null, major_updated_at: null,
    }).success).toBe(true);
  });

  it("rejects missing major_uuid", () => {
    const { major_uuid: _, ...rest } = valid;
    expect(majorItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-date major_created_at", () => {
    expect(majorItemSchema.safeParse({ ...valid, major_created_at: "2026-01-01" }).success).toBe(false);
  });
});

describe("listMajorsResultSchema", () => {
  const valid = () => ({
    majors: [{ major_uuid: "m-1", major_name_en: "CS", major_name_ar: "علوم",
               data_source: null, major_created_at: null, major_updated_at: null }],
    total: 1, page: 0, limit: 20, totalPages: 1,
  });

  it("accepts a valid paginated result", () => expect(listMajorsResultSchema.safeParse(valid()).success).toBe(true));
  it("accepts empty majors array", () => {
    expect(listMajorsResultSchema.safeParse({ ...valid(), majors: [] }).success).toBe(true);
  });
  it("rejects negative limit", () => {
    expect(listMajorsResultSchema.safeParse({ ...valid(), limit: -5 }).success).toBe(false);
  });
  it("rejects missing majors", () => {
    const { majors: _, ...rest } = valid();
    expect(listMajorsResultSchema.safeParse(rest).success).toBe(false);
  });
});
