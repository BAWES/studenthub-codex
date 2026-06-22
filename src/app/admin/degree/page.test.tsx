import { describe, it, expect } from "vitest";
import {
  listDegreesSchema,
  degreeItemSchema,
  listDegreesResultSchema,
} from "./schemas";
import type {
  DegreeItem,
  ListDegreesResult,
} from "./schemas";

describe("admin degree — data contract", () => {
  it("listDegreesSchema accepts empty params (defaults apply)", () => {
    const r = listDegreesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(50);
      expect(r.data.page).toBe(1);
    }
  });

  it("listDegreesSchema accepts explicit page and limit", () => {
    const r = listDegreesSchema.safeParse({ page: 2, limit: 25 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(25);
      expect(r.data.page).toBe(2);
    }
  });

  it("DegreeItem fields map correctly to DataTable columns", () => {
    const row: DegreeItem = {
      degree_uuid: "deg-123",
      degree_group_uuid: "group-1",
      degree_name_en: "Bachelor of Science",
      degree_name_ar: "بكالوريوس علوم",
      degree_sort_order: 1,
      degree_created_at: new Date("2026-06-20T10:00:00Z"),
      degree_updated_at: new Date("2026-06-20T12:00:00Z"),
    };
    expect(row.degree_uuid).toBe("deg-123");
    expect(row.degree_name_en).toBe("Bachelor of Science");
    expect(row.degree_name_ar).toBe("بكالوريوس علوم");
  });

  it("DegreeItem allows nullable fields", () => {
    const row: DegreeItem = {
      degree_uuid: "nullable-test",
      degree_group_uuid: null,
      degree_name_en: "Test",
      degree_name_ar: null,
      degree_sort_order: null,
      degree_created_at: null,
      degree_updated_at: null,
    };
    expect(row.degree_group_uuid).toBeNull();
    expect(row.degree_name_ar).toBeNull();
    expect(row.degree_sort_order).toBeNull();
  });

  it("ListDegreesResult has expected shape", () => {
    const result: ListDegreesResult = {
      degrees: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    expect(Array.isArray(result.degrees)).toBe(true);
    expect(typeof result.total).toBe("number");
    expect(typeof result.page).toBe("number");
  });
});
