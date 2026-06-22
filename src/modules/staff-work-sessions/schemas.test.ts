import { describe, it, expect } from "vitest";
import { staffWorkSessionSchema, listStaffWorkSessionsResultSchema, createStaffWorkSessionResultSchema } from "./schemas";
describe("staffWorkSessionSchema", () => {
  const valid = { work_session_uuid: "ws-uuid-1", staff_id: 1, total_minutes: 480,
                  created_at: "2026-06-14T00:00:00Z", updated_at: "2026-06-14T00:00:00Z" };
  it("accepts valid", () => expect(staffWorkSessionSchema.safeParse(valid).success).toBe(true));
  it("accepts nullable", () => expect(staffWorkSessionSchema.safeParse({
    ...valid, staff_id: null, total_minutes: null,
  }).success).toBe(true));
  it("rejects missing work_session_uuid", () => {
    const { work_session_uuid: _, ...rest } = valid;
    expect(staffWorkSessionSchema.safeParse(rest).success).toBe(false);
  });
  it("rejects non-string created_at", () => expect(staffWorkSessionSchema.safeParse({
    ...valid, created_at: new Date() }).success).toBe(false));
});
describe("listStaffWorkSessionsResultSchema", () => {
  const v = () => ({ sessions: [{ work_session_uuid: "w-1", staff_id: null, total_minutes: null, created_at: "now", updated_at: "now" }], total: 1, page: 1, limit: 20, totalPages: 1 });
  it("accepts", () => expect(listStaffWorkSessionsResultSchema.safeParse(v()).success).toBe(true));
  it("rejects missing", () => {
    const { sessions: _, ...rest } = v();
    expect(listStaffWorkSessionsResultSchema.safeParse(rest).success).toBe(false);
  });
});
describe("createStaffWorkSessionResultSchema", () => {
  it("accepts", () => expect(createStaffWorkSessionResultSchema.safeParse({ work_session_uuid: "w-1", staff_id: null, total_minutes: null }).success).toBe(true));
  it("rejects missing", () => expect(createStaffWorkSessionResultSchema.safeParse({ staff_id: 1 }).success).toBe(false));
});
