import { describe, it, expect } from "vitest";
import {
  degreeItemSchema,
  listDegreesResultSchema,
} from "./schemas";

describe("admin degree — data contract", () => {
  it("degreeItemSchema validates a full degree entry", () => {
    const r = degreeItemSchema.safeParse({
      degree_uuid: "deg-123",
      degree_group_uuid: "group-1",
      degree_name_en: "Bachelor of Science",
      degree_name_ar: "بكالوريوس علوم",
      degree_sort_order: 1,
      degree_created_at: new Date("2026-06-20T10:00:00Z"),
      degree_updated_at: new Date("2026-06-20T12:00:00Z"),
    });
    expect(r.success).toBe(true);
    expect(r.data?.degree_name_en).toBe("Bachelor of Science");
    expect(r.data?.degree_name_ar).toBe("بكالوريوس علوم");
  });

  it("degreeItemSchema accepts nullable fields", () => {
    const r = degreeItemSchema.safeParse({
      degree_uuid: "nullable-test",
      degree_group_uuid: null,
      degree_name_en: "Test",
      degree_name_ar: null,
      degree_sort_order: null,
      degree_created_at: null,
      degree_updated_at: null,
    });
    expect(r.success).toBe(true);
    expect(r.data.degree_group_uuid).toBeNull();
    expect(r.data.degree_name_ar).toBeNull();
  });

  it("degreeItemSchema rejects missing required fields", () => {
    const r = degreeItemSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("degreeItemSchema rejects empty degree_name_en", () => {
    const r = degreeItemSchema.safeParse({
      degree_uuid: "bad",
      degree_name_en: "",
      degree_group_uuid: null,
      degree_name_ar: null,
      degree_sort_order: null,
      degree_created_at: null,
      degree_updated_at: null,
    });
    expect(r.success).toBe(false);
  });

  it("listDegreesResultSchema validates paginated result", () => {
    const r = listDegreesResultSchema.safeParse({
      degrees: [
        {
          degree_uuid: "deg-1",
          degree_group_uuid: null,
          degree_name_en: "BSc",
          degree_name_ar: null,
          degree_sort_order: null,
          degree_created_at: null,
          degree_updated_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 50,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("listDegreesResultSchema rejects negative total", () => {
    const r = listDegreesResultSchema.safeParse({
      degrees: [],
      total: -1,
      page: 1,
      limit: 50,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });
});
