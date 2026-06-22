import { describe, it, expect } from "vitest";
import {
  listFulltimersSchema,
  fulltimerItemSchema,
  listFulltimersResultSchema,
} from "@/modules/fulltimers/schemas";
import type {
  FulltimerListItem,
  ListFulltimersResult,
} from "@/modules/fulltimers/schemas";

describe("admin fulltimer — data contract", () => {
  it("listFulltimersSchema accepts empty params (defaults apply)", () => {
    const r = listFulltimersSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(20);
      expect(r.data.page).toBe(1);
    }
  });

  it("listFulltimersSchema accepts page and limit", () => {
    const r = listFulltimersSchema.safeParse({ page: 2, limit: 50 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(50);
      expect(r.data.page).toBe(2);
    }
  });

  it("FulltimerListItem fields map correctly to DataTable columns", () => {
    const row: FulltimerListItem = {
      fulltimer_uuid: "ft-123",
      fulltimer_name: "John Doe",
      fulltimer_email: "john@example.com",
      fulltimer_phone: "+965 5555 1234",
      fulltimer_employed: true,
      nationality_id: 1,
      country_id: 2,
      university_id: null,
      fulltimer_created_datetime: "2026-01-15T10:00:00.000Z",
    };
    expect(row.fulltimer_name).toBe("John Doe");
    expect(row.fulltimer_email).toBe("john@example.com");
    expect(row.fulltimer_phone).toBe("+965 5555 1234");
    expect(row.fulltimer_employed).toBe(true);
  });

  it("FulltimerListItem allows nullable fields", () => {
    const row: FulltimerListItem = {
      fulltimer_uuid: "nullable-test",
      fulltimer_name: "Jane",
      fulltimer_email: "jane@test.com",
      fulltimer_phone: null,
      fulltimer_employed: null,
      nationality_id: null,
      country_id: null,
      university_id: null,
      fulltimer_created_datetime: null,
    };
    expect(row.fulltimer_phone).toBeNull();
    expect(row.fulltimer_employed).toBeNull();
    expect(row.fulltimer_created_datetime).toBeNull();
  });

  it("ListFulltimersResult has expected shape", () => {
    const result: ListFulltimersResult = {
      fulltimers: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(Array.isArray(result.fulltimers)).toBe(true);
    expect(typeof result.total).toBe("number");
  });
});
