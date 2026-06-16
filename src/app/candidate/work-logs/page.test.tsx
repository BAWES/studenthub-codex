import { describe, it, expect } from "vitest";
import {
  workLogItemOutputSchema,
  workLogDetailOutputSchema,
  listWorkLogsResultOutputSchema,
  submitWorkLogResultOutputSchema,
  updateWorkLogStatusResultOutputSchema,
} from "./schemas";

describe("candidate work-logs page — data contract", () => {
  const validItem = {
    candidate_working_hour_uuid: "wl-1",
    date: new Date("2024-06-01"),
    start_time: new Date("2024-06-01T08:00:00"),
    end_time: new Date("2024-06-01T17:00:00"),
    total_time: 9,
    status: 1,
    via: "app",
    note: "Worked on project",
    store_name: "Store 1",
    company_name: "Tech Corp",
    created_at: null,
    updated_at: null,
  };

  it("workLogItemOutputSchema validates a valid item", () => {
    const r = workLogItemOutputSchema.safeParse(validItem);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.candidate_working_hour_uuid).toBe("wl-1");
  });

  it("workLogItemOutputSchema rejects missing uuid", () => {
    const r = workLogItemOutputSchema.safeParse({ date: new Date() });
    expect(r.success).toBe(false);
  });

  it("workLogDetailOutputSchema extends item with location", () => {
    const r = workLogDetailOutputSchema.safeParse({
      ...validItem,
      start_location_lat: 29.3,
      start_location_long: 47.9,
      end_location_lat: null,
      end_location_long: null,
      store_location: "Kuwait City",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.store_location).toBe("Kuwait City");
  });

  it("listWorkLogsResultOutputSchema validates paginated result", () => {
    const r = listWorkLogsResultOutputSchema.safeParse({
      items: [validItem], total: 1, page: 1, limit: 20, totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("submitWorkLogResultOutputSchema validates operation success", () => {
    const r = submitWorkLogResultOutputSchema.safeParse({ operation: "success", message: "Created" });
    expect(r.success).toBe(true);
  });

  it("submitWorkLogResultOutputSchema validates operation error", () => {
    const r = submitWorkLogResultOutputSchema.safeParse({ operation: "error", message: "Failed" });
    expect(r.success).toBe(true);
  });

  it("updateWorkLogStatusResultOutputSchema validates operation success", () => {
    const r = updateWorkLogStatusResultOutputSchema.safeParse({ operation: "success", message: "Approved" });
    expect(r.success).toBe(true);
  });
});
