import { describe, it, expect } from "vitest";
import {
  listWorkLogsSchema,
  getWorkLogDetailSchema,
  submitWorkLogSchema,
  updateWorkLogStatusSchema,
  workLogItemOutputSchema,
  workLogDetailOutputSchema,
  listWorkLogsResultOutputSchema,
  submitWorkLogResultOutputSchema,
  updateWorkLogStatusResultOutputSchema,
} from "@/app/candidate/work-logs/schemas";

// ---------------------------------------------------------------------------
// Input Schema Validation Tests
// ---------------------------------------------------------------------------

describe("listWorkLogsSchema", () => {
  it("applies defaults for empty input", () => {
    const result = listWorkLogsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts with date filter", () => {
    const result = listWorkLogsSchema.safeParse({
      page: 2,
      limit: 10,
      date: "2026-06-01",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.date).toBe("2026-06-01");
    }
  });

  it("coerces string page and limit", () => {
    const result = listWorkLogsSchema.safeParse({ page: "3", limit: "15" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(15);
    }
  });

  it("rejects limit > 100", () => {
    const result = listWorkLogsSchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive page", () => {
    const result = listWorkLogsSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative limit", () => {
    const result = listWorkLogsSchema.safeParse({ limit: -1 });
    expect(result.success).toBe(false);
  });
});

describe("getWorkLogDetailSchema", () => {
  it("accepts a valid UUID", () => {
    const result = getWorkLogDetailSchema.safeParse({
      workLogUuid: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.workLogUuid).toBe("550e8400-e29b-41d4-a716-446655440000");
    }
  });

  it("rejects empty string UUID", () => {
    const result = getWorkLogDetailSchema.safeParse({ workLogUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing workLogUuid", () => {
    const result = getWorkLogDetailSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("submitWorkLogSchema", () => {
  it("accepts minimal valid input", () => {
    const result = submitWorkLogSchema.safeParse({
      date: "2026-06-15",
      startTime: "08:00",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.date).toBe("2026-06-15");
      expect(result.data.startTime).toBe("08:00");
    }
  });

  it("accepts full input with all optional fields", () => {
    const result = submitWorkLogSchema.safeParse({
      date: "2026-06-15",
      startTime: "08:00",
      endTime: "17:00",
      totalTime: 8,
      note: "Regular work day",
      storeId: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.endTime).toBe("17:00");
      expect(result.data.totalTime).toBe(8);
      expect(result.data.note).toBe("Regular work day");
      expect(result.data.storeId).toBe(1);
    }
  });

  it("coerces string totalTime and storeId", () => {
    const result = submitWorkLogSchema.safeParse({
      date: "2026-06-15",
      startTime: "08:00",
      totalTime: "8",
      storeId: "3",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.totalTime).toBe(8);
      expect(result.data.storeId).toBe(3);
    }
  });

  it("rejects empty date", () => {
    const result = submitWorkLogSchema.safeParse({
      date: "",
      startTime: "08:00",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty startTime", () => {
    const result = submitWorkLogSchema.safeParse({
      date: "2026-06-15",
      startTime: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing date", () => {
    const result = submitWorkLogSchema.safeParse({ startTime: "08:00" });
    expect(result.success).toBe(false);
  });

  it("rejects missing startTime", () => {
    const result = submitWorkLogSchema.safeParse({ date: "2026-06-15" });
    expect(result.success).toBe(false);
  });
});

describe("updateWorkLogStatusSchema", () => {
  it("accepts valid input", () => {
    const result = updateWorkLogStatusSchema.safeParse({
      workLogUuid: "550e8400-e29b-41d4-a716-446655440000",
      status: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(1);
    }
  });

  it("coerces string status", () => {
    const result = updateWorkLogStatusSchema.safeParse({
      workLogUuid: "test-uuid",
      status: "2",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(2);
    }
  });

  it("rejects empty workLogUuid", () => {
    const result = updateWorkLogStatusSchema.safeParse({
      workLogUuid: "",
      status: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing workLogUuid", () => {
    const result = updateWorkLogStatusSchema.safeParse({ status: 1 });
    expect(result.success).toBe(false);
  });

  it("rejects missing status", () => {
    const result = updateWorkLogStatusSchema.safeParse({
      workLogUuid: "test-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative status", () => {
    const result = updateWorkLogStatusSchema.safeParse({
      workLogUuid: "test-uuid",
      status: -1,
    });
    expect(result.success).toBe(false);
  });

  it("accepts zero status", () => {
    const result = updateWorkLogStatusSchema.safeParse({
      workLogUuid: "test-uuid",
      status: 0,
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Output Schema Validation Tests
// ---------------------------------------------------------------------------

describe("workLogItemOutputSchema", () => {
  const validItem = {
    candidate_working_hour_uuid: "550e8400-e29b-41d4-a716-446655440000",
    date: new Date("2026-06-15"),
    start_time: new Date("2026-06-15T08:00:00"),
    end_time: new Date("2026-06-15T17:00:00"),
    total_time: 8,
    status: 1,
    via: "web",
    note: "Regular work day",
    store_name: "Main Store",
    company_name: "ACME Corp",
    created_at: new Date(),
    updated_at: new Date(),
  };

  it("accepts a valid work log item", () => {
    const result = workLogItemOutputSchema.safeParse(validItem);
    expect(result.success).toBe(true);
  });

  it("accepts all nullable fields as null", () => {
    const result = workLogItemOutputSchema.safeParse({
      candidate_working_hour_uuid: "uuid-123",
      date: null,
      start_time: null,
      end_time: null,
      total_time: null,
      status: null,
      via: null,
      note: null,
      store_name: null,
      company_name: null,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required UUID", () => {
    const { candidate_working_hour_uuid, ...without } = validItem;
    const result = workLogItemOutputSchema.safeParse(without);
    expect(result.success).toBe(false);
  });

  it("rejects non-string UUID", () => {
    const result = workLogItemOutputSchema.safeParse({
      ...validItem,
      candidate_working_hour_uuid: 12345,
    });
    expect(result.success).toBe(false);
  });
});

describe("workLogDetailOutputSchema", () => {
  const validDetail = {
    candidate_working_hour_uuid: "uuid-123",
    date: new Date("2026-06-15"),
    start_time: new Date("2026-06-15T08:00:00"),
    end_time: new Date("2026-06-15T17:00:00"),
    total_time: 8,
    status: 1,
    via: "mobile",
    note: "Worked on project",
    store_name: "Store A",
    company_name: "ACME Corp",
    created_at: new Date(),
    updated_at: new Date(),
    start_location_lat: 29.3759,
    start_location_long: 47.9774,
    end_location_lat: 29.376,
    end_location_long: 47.9775,
    store_location: "Kuwait City, Salmiya",
  };

  it("accepts a valid work log detail", () => {
    const result = workLogDetailOutputSchema.safeParse(validDetail);
    expect(result.success).toBe(true);
  });

  it("accepts location fields as null", () => {
    const result = workLogDetailOutputSchema.safeParse({
      ...validDetail,
      start_location_lat: null,
      start_location_long: null,
      end_location_lat: null,
      end_location_long: null,
      store_location: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing location fields", () => {
    const { start_location_lat, ...without } = validDetail;
    const result = workLogDetailOutputSchema.safeParse(without);
    expect(result.success).toBe(false);
  });
});

describe("listWorkLogsResultOutputSchema", () => {
  it("accepts valid result with items", () => {
    const result = listWorkLogsResultOutputSchema.safeParse({
      items: [
        {
          candidate_working_hour_uuid: "uuid-1",
          date: null,
          start_time: null,
          end_time: null,
          total_time: null,
          status: null,
          via: null,
          note: null,
          store_name: null,
          company_name: null,
          created_at: null,
          updated_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty items array", () => {
    const result = listWorkLogsResultOutputSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative total", () => {
    const result = listWorkLogsResultOutputSchema.safeParse({
      items: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("submitWorkLogResultOutputSchema", () => {
  it("accepts success result", () => {
    const result = submitWorkLogResultOutputSchema.safeParse({
      operation: "success",
      message: "Work log submitted successfully",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.operation).toBe("success");
    }
  });

  it("accepts error result", () => {
    const result = submitWorkLogResultOutputSchema.safeParse({
      operation: "error",
      message: "Invalid work log data",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.operation).toBe("error");
    }
  });

  it("accepts result with optional workLog", () => {
    const result = submitWorkLogResultOutputSchema.safeParse({
      operation: "success",
      message: "Done",
      workLog: {
        candidate_working_hour_uuid: "uuid-1",
        date: null,
        start_time: null,
        end_time: null,
        total_time: null,
        status: null,
        via: null,
        note: null,
        store_name: null,
        company_name: null,
        created_at: null,
        updated_at: null,
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid operation value", () => {
    const result = submitWorkLogResultOutputSchema.safeParse({
      operation: "pending",
      message: "Should fail",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing message", () => {
    const result = submitWorkLogResultOutputSchema.safeParse({
      operation: "success",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateWorkLogStatusResultOutputSchema", () => {
  it("accepts success result", () => {
    const result = updateWorkLogStatusResultOutputSchema.safeParse({
      operation: "success",
      message: "Work log status updated",
    });
    expect(result.success).toBe(true);
  });

  it("accepts error result", () => {
    const result = updateWorkLogStatusResultOutputSchema.safeParse({
      operation: "error",
      message: "Failed to update work log status",
    });
    expect(result.success).toBe(true);
  });

  it("accepts result with workLog", () => {
    const result = updateWorkLogStatusResultOutputSchema.safeParse({
      operation: "success",
      message: "Updated",
      workLog: {
        candidate_working_hour_uuid: "uuid-1",
        date: null,
        start_time: null,
        end_time: null,
        total_time: null,
        status: null,
        via: null,
        note: null,
        store_name: null,
        company_name: null,
        created_at: null,
        updated_at: null,
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid operation value", () => {
    const result = updateWorkLogStatusResultOutputSchema.safeParse({
      operation: "failed",
      message: "Should fail",
    });
    expect(result.success).toBe(false);
  });
});
